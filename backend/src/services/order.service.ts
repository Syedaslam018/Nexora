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
import { paginationMeta } from "../utils/pagination.js";
import type { CreateOrderInput, OrderListQuery } from "../schemas/order.schema.js";
import type { OrderStatus } from "@prisma/client";

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

  async listForUser(userId: string, query: OrderListQuery) {
    const { items, totalItems } = await orderRepository.findManyForUser(
      userId,
      { status: query.status, search: query.search },
      { page: query.page, pageSize: query.pageSize },
    );
    return { items, meta: paginationMeta(totalItems, { page: query.page, pageSize: query.pageSize }) };
  },

  /**
   * Pre-shipment cancellation. Allowed while the order hasn't shipped yet
   * (PENDING/CONFIRMED/PROCESSING). Unlike `requestRefund` below, this DOES
   * restock inventory — nothing has physically left the warehouse, so
   * there's nothing to inspect before it goes back into `availableQty`.
   * If the payment had already succeeded, it's refunded through Stripe as
   * part of cancelling, and the order lands in REFUNDED rather than
   * CANCELLED so "money was returned" is visible in the status itself.
   */
  async cancelOrder(userId: string, orderId: string, reason?: string) {
    const order = await orderRepository.findByIdForUser(orderId, userId);
    if (!order) throw ApiError.notFound("Order not found");

    if (!["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status)) {
      throw ApiError.badRequest(
        "This order has already shipped and can no longer be cancelled — request a refund instead",
      );
    }

    const payment = order.payments[0];
    const wasPaid = payment?.status === "SUCCEEDED";
    // Reservation was only converted reservedQty -> soldQty once payment
    // succeeded (see confirmStripePayment) — so a still-PENDING Stripe
    // order releases from `reservedQty`, everything else releases from
    // `soldQty` (COD is sold immediately at creation; a paid Stripe order
    // was finalized to sold by the webhook).
    const releaseFromReserved = order.paymentMethod === "STRIPE" && order.status === "PENDING";

    const finalStatus = wasPaid ? "REFUNDED" : "CANCELLED";
    const note = reason
      ? `${wasPaid ? "Refunded" : "Cancelled"} by customer: ${reason}`
      : `${wasPaid ? "Refunded" : "Cancelled"} by customer`;

    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status: finalStatus } });
      await tx.orderStatusHistory.create({
        data: { orderId, status: finalStatus, note, changedById: userId },
      });
      for (const item of order.items) {
        await tx.inventory.update({
          where: { variantId: item.variantId },
          data: releaseFromReserved
            ? { reservedQty: { decrement: item.quantity }, availableQty: { increment: item.quantity } }
            : { soldQty: { decrement: item.quantity }, availableQty: { increment: item.quantity } },
        });
        await tx.inventoryTransaction.create({
          data: {
            variantId: item.variantId,
            type: "STOCK_RELEASED",
            quantity: item.quantity,
            referenceType: "ORDER",
            referenceId: orderId,
            note,
            createdById: userId,
          },
        });
      }
      if (wasPaid && payment) {
        await tx.payment.update({ where: { id: payment.id }, data: { status: "REFUNDED" } });
      }
    });

    if (wasPaid && payment?.stripePaymentIntentId) {
      await paymentService.refundPayment(payment.stripePaymentIntentId);
    }

    return orderRepository.findByIdForUser(orderId, userId);
  },

  /**
   * Post-delivery refund. Unlike `cancelOrder`, this does NOT restock
   * inventory — the item already shipped and is either with the customer
   * or in transit back, and physically inspecting a return before it's
   * sellable again is outside this build's scope. Only reverses payment
   * and marks the order REFUNDED.
   */
  async requestRefund(userId: string, orderId: string, reason?: string) {
    const order = await orderRepository.findByIdForUser(orderId, userId);
    if (!order) throw ApiError.notFound("Order not found");
    if (order.status !== "DELIVERED") {
      throw ApiError.badRequest("Only delivered orders can be refunded — see cancellation instead");
    }
    const payment = order.payments[0];
    if (!payment || payment.status !== "SUCCEEDED" || !payment.stripePaymentIntentId) {
      throw ApiError.badRequest(
        "This order has no completed online payment to refund — contact support for cash-on-delivery returns",
      );
    }

    const note = reason ? `Refund requested by customer: ${reason}` : "Refund requested by customer";

    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status: "REFUNDED" } });
      await tx.orderStatusHistory.create({
        data: { orderId, status: "REFUNDED", note, changedById: userId },
      });
      await tx.payment.update({ where: { id: payment.id }, data: { status: "REFUNDED" } });
    });

    await paymentService.refundPayment(payment.stripePaymentIntentId);
    return orderRepository.findByIdForUser(orderId, userId);
  },

  /**
   * Re-adds every item from a past order to the current cart at today's
   * price and stock — never the historical snapshot price, since that
   * could be stale or the item could be discontinued/out of stock. Items
   * that can't be re-added are reported back rather than silently dropped.
   */
  async reorder(userId: string, orderId: string) {
    const order = await orderRepository.findByIdForUser(orderId, userId);
    if (!order) throw ApiError.notFound("Order not found");

    const added: string[] = [];
    const skipped: { name: string; reason: string }[] = [];

    for (const item of order.items) {
      if (item.product.isArchived || !item.product.isActive) {
        skipped.push({ name: item.productNameSnapshot, reason: "No longer available" });
        continue;
      }
      try {
        await cartService.addItem(userId, item.variantId, item.quantity);
        added.push(item.productNameSnapshot);
      } catch (err) {
        skipped.push({
          name: item.productNameSnapshot,
          reason: err instanceof ApiError ? err.message : "Could not add to cart",
        });
      }
    }

    return { added, skipped };
  },

  /**
   * Admin/staff-only status advancement (PROCESSING → SHIPPED → ... →
   * DELIVERED). The full admin order-management UI that calls this lands
   * in Phase 9 — this endpoint exists now so the order lifecycle is
   * actually testable end-to-end without it (otherwise no order could ever
   * progress past CONFIRMED). Marking an order DELIVERED also marks a COD
   * payment SUCCEEDED, since cash is collected at the point of delivery.
   */
  async updateStatus(orderId: string, status: OrderStatus, note: string | undefined, adminUserId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw ApiError.notFound("Order not found");

    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status } });
      await tx.orderStatusHistory.create({
        data: { orderId, status, note, changedById: adminUserId },
      });
      if (status === "DELIVERED" && order.paymentMethod === "COD") {
        const codPayment = order.payments.find((p) => p.provider === "COD");
        if (codPayment && codPayment.status === "PENDING") {
          await tx.payment.update({ where: { id: codPayment.id }, data: { status: "SUCCEEDED" } });
        }
      }
    });

    return orderRepository.findById(orderId);
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
