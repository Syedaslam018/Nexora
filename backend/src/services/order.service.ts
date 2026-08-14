import { prisma } from "../config/db.js";
import { cartRepository } from "../repositories/cart.repository.js";
import { orderRepository } from "../repositories/order.repository.js";
import { addressService } from "./address.service.js";
import { couponService } from "./coupon.service.js";
import { computePricing, type PricingLineItem } from "./pricing.service.js";
import { paymentService } from "./payment.service.js";
import { cartService } from "./cart.service.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../config/logger.js";
import type { CreateOrderInput } from "../schemas/order.schema.js";

function effectivePriceCents(variant: { priceCents: number | null; product: { basePriceCents: number } }) {
  return variant.priceCents ?? variant.product.basePriceCents;
}

export const orderService = {
  /**
   * The whole checkout, in one place: verify the address belongs to the
   * user, re-check stock and coupon validity against current data (never
   * trust what the cart showed a moment ago), compute the authoritative
   * price, create the order, and move inventory — sold immediately for
   * COD, reserved pending payment confirmation for Stripe.
   */
  async createOrder(userId: string, input: CreateOrderInput) {
    const shippingAddress = await addressService.assertBelongsToUser(userId, input.shippingAddressId);
    const billingAddress = input.billingAddressId
      ? await addressService.assertBelongsToUser(userId, input.billingAddressId)
      : null;

    const cart = await cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) throw ApiError.badRequest("Your cart is empty");

    for (const item of cart.items) {
      if (!item.variant.isActive || !item.variant.product.isActive) {
        throw ApiError.badRequest(`${item.variant.product.name} is no longer available`);
      }
      const availableQty = item.variant.inventory?.availableQty ?? 0;
      if (item.quantity > availableQty) {
        throw ApiError.badRequest(
          `Only ${availableQty} of "${item.variant.product.name}" left in stock — please update your cart`,
        );
      }
    }

    const lineItems: PricingLineItem[] = cart.items.map((item) => ({
      productId: item.variant.product.id,
      categoryId: item.variant.product.categoryId,
      unitPriceCents: effectivePriceCents(item.variant),
      quantity: item.quantity,
    }));
    const subtotalCents = lineItems.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);

    const coupon = cart.coupon
      ? await couponService.validateForUser(cart.coupon.code, userId, subtotalCents)
      : null;

    const pricing = computePricing(lineItems, coupon, input.deliveryMethod);
    const orderNumber = orderRepository.generateOrderNumber();
    const isCOD = input.paymentMethod === "COD";

    const { order, payment } = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: isCOD ? "CONFIRMED" : "PENDING",
          paymentMethod: input.paymentMethod,
          subtotalCents: pricing.subtotalCents,
          discountCents: pricing.discountCents,
          taxCents: pricing.taxCents,
          shippingCents: pricing.shippingCents,
          totalCents: pricing.totalCents,
          couponId: coupon?.id,
          shippingAddressId: shippingAddress.id,
          billingAddressId: (billingAddress ?? shippingAddress).id,
          notes: input.notes,
          items: {
            create: cart.items.map((item) => ({
              productId: item.variant.product.id,
              variantId: item.variantId,
              productNameSnapshot: item.variant.product.name,
              variantNameSnapshot: item.variant.name,
              skuSnapshot: item.variant.sku,
              unitPriceCents: effectivePriceCents(item.variant),
              quantity: item.quantity,
              totalCents: effectivePriceCents(item.variant) * item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      await tx.orderStatusHistory.create({
        data: { orderId: createdOrder.id, status: "PENDING", note: "Order placed", changedById: userId },
      });
      if (isCOD) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: createdOrder.id,
            status: "CONFIRMED",
            note: "Confirmed — pay on delivery",
            changedById: userId,
          },
        });
      }

      for (const item of createdOrder.items) {
        // `updateMany` with a `gte` guard, not `update`, so this is an
        // atomic "decrement only if enough stock" at the database level —
        // closes the race window between the check above and this write
        // (two concurrent checkouts can't both succeed for the last unit).
        const result = await tx.inventory.updateMany({
          where: { variantId: item.variantId, availableQty: { gte: item.quantity } },
          data: isCOD
            ? { availableQty: { decrement: item.quantity }, soldQty: { increment: item.quantity } }
            : { availableQty: { decrement: item.quantity }, reservedQty: { increment: item.quantity } },
        });
        if (result.count === 0) {
          throw ApiError.conflict(
            `Stock for "${item.productNameSnapshot}" changed while placing your order — please review your cart`,
          );
        }
        await tx.inventoryTransaction.create({
          data: {
            variantId: item.variantId,
            type: isCOD ? "STOCK_SOLD" : "STOCK_RESERVED",
            quantity: -item.quantity,
            referenceType: "ORDER",
            referenceId: createdOrder.id,
            createdById: userId,
          },
        });
      }

      if (coupon) {
        await tx.couponUsage.create({
          data: {
            couponId: coupon.id,
            userId,
            orderId: createdOrder.id,
            discountAppliedCents: pricing.discountCents,
          },
        });
      }

      const createdPayment = await tx.payment.create({
        data: {
          orderId: createdOrder.id,
          provider: isCOD ? "COD" : "STRIPE",
          status: "PENDING",
          amountCents: pricing.totalCents,
        },
      });

      return { order: createdOrder, payment: createdPayment };
    });

    if (isCOD) {
      await cartService.clearCart(userId);
      return { order, clientSecret: null };
    }

    try {
      const intent = await paymentService.createPaymentIntent(pricing.totalCents, order.id, orderNumber);
      await prisma.payment.update({
        where: { id: payment.id },
        data: { stripePaymentIntentId: intent.id },
      });
      await cartService.clearCart(userId);
      return { order, clientSecret: intent.client_secret };
    } catch (err) {
      logger.error({ err, orderId: order.id }, "Failed to create Stripe PaymentIntent — releasing order");
      await this.releaseUnconfirmedOrder(order.id, "Could not initialize payment");
      throw ApiError.internal("Could not initialize payment — please try again");
    }
  },

  async getOrderForUser(userId: string, orderId: string) {
    const order = await orderRepository.findByIdForUser(orderId, userId);
    if (!order) throw ApiError.notFound("Order not found");
    return order;
  },

  /** Releases reserved inventory and cancels an order that never got a
   * chance to succeed or fail payment through Stripe at all (e.g. the
   * PaymentIntent API call itself failed). Distinct from `failStripePayment`
   * below, which handles a PaymentIntent that WAS created but was later
   * declined. */
  async releaseUnconfirmedOrder(orderId: string, reason: string) {
    const order = await orderRepository.findById(orderId);
    if (!order || order.status !== "PENDING") return;

    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
      await tx.orderStatusHistory.create({
        data: { orderId, status: "CANCELLED", note: reason },
      });
      for (const item of order.items) {
        await tx.inventory.update({
          where: { variantId: item.variantId },
          data: { reservedQty: { decrement: item.quantity }, availableQty: { increment: item.quantity } },
        });
        await tx.inventoryTransaction.create({
          data: {
            variantId: item.variantId,
            type: "STOCK_RELEASED",
            quantity: item.quantity,
            referenceType: "ORDER",
            referenceId: orderId,
            note: reason,
          },
        });
      }
    });
  },

  /** Called from the Stripe webhook on `payment_intent.succeeded`. Finalizes
   * the reservation into a sale — this is the only place `reservedQty`
   * converts to `soldQty` for a Stripe order. Idempotent: a webhook that
   * fires twice for the same event is a no-op the second time. */
  async confirmStripePayment(paymentIntentId: string) {
    const order = await orderRepository.findByStripePaymentIntentId(paymentIntentId);
    if (!order) {
      logger.warn({ paymentIntentId }, "Webhook for unknown PaymentIntent");
      return;
    }
    const payment = order.payments.find((p) => p.stripePaymentIntentId === paymentIntentId);
    if (!payment || payment.status === "SUCCEEDED") return; // idempotent

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({ where: { id: payment.id }, data: { status: "SUCCEEDED" } });
      await tx.order.update({ where: { id: order.id }, data: { status: "CONFIRMED" } });
      await tx.orderStatusHistory.create({
        data: { orderId: order.id, status: "CONFIRMED", note: "Payment confirmed via Stripe" },
      });
      for (const item of order.items) {
        await tx.inventory.update({
          where: { variantId: item.variantId },
          data: { reservedQty: { decrement: item.quantity }, soldQty: { increment: item.quantity } },
        });
        await tx.inventoryTransaction.create({
          data: {
            variantId: item.variantId,
            type: "STOCK_SOLD",
            quantity: -item.quantity,
            referenceType: "ORDER",
            referenceId: order.id,
          },
        });
      }
    });
  },

  /** Called from the Stripe webhook on `payment_intent.payment_failed`.
   * Releases the reservation back to available stock and cancels the order
   * — the customer would need to check out again to retry (no in-place
   * "retry payment on the same order" flow in this build). */
  async failStripePayment(paymentIntentId: string, reason: string) {
    const order = await orderRepository.findByStripePaymentIntentId(paymentIntentId);
    if (!order) {
      logger.warn({ paymentIntentId }, "Webhook for unknown PaymentIntent");
      return;
    }
    const payment = order.payments.find((p) => p.stripePaymentIntentId === paymentIntentId);
    if (!payment || payment.status === "FAILED" || payment.status === "SUCCEEDED") return; // idempotent

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", failureReason: reason },
      });
      await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
      await tx.orderStatusHistory.create({
        data: { orderId: order.id, status: "CANCELLED", note: `Payment failed: ${reason}` },
      });
      for (const item of order.items) {
        await tx.inventory.update({
          where: { variantId: item.variantId },
          data: { reservedQty: { decrement: item.quantity }, availableQty: { increment: item.quantity } },
        });
        await tx.inventoryTransaction.create({
          data: {
            variantId: item.variantId,
            type: "STOCK_RELEASED",
            quantity: item.quantity,
            referenceType: "ORDER",
            referenceId: order.id,
            note: reason,
          },
        });
      }
    });
  },
};
