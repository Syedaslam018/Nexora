import { cartRepository } from "../repositories/cart.repository.js";
import { couponService } from "./coupon.service.js";
import { computePricing, type PricingLineItem } from "./pricing.service.js";
import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import type { Prisma } from "@prisma/client";

type CartWithRelations = Prisma.CartGetPayload<{
  include: {
    coupon: { include: { products: true; categories: true } };
    items: {
      include: {
        variant: {
          include: { product: { include: { images: true } }; inventory: true };
        };
      };
    };
  };
}>;

function effectivePriceCents(variant: CartWithRelations["items"][number]["variant"]): number {
  return variant.priceCents ?? variant.product.basePriceCents;
}

async function getOrCreateCart(userId: string): Promise<CartWithRelations> {
  const existing = await cartRepository.findByUserId(userId);
  if (existing) return existing;
  // Should be unreachable in normal operation (every user gets a cart at
  // registration — see user.repository.ts), but cheap to guard against any
  // account created before that invariant, or created by a future admin
  // tool that forgets it.
  return cartRepository.createForUser(userId);
}

function toLineItems(cart: CartWithRelations): PricingLineItem[] {
  return cart.items.map((item) => ({
    productId: item.variant.product.id,
    categoryId: item.variant.product.categoryId,
    unitPriceCents: effectivePriceCents(item.variant),
    quantity: item.quantity,
  }));
}

function toDto(cart: CartWithRelations, pricing: ReturnType<typeof computePricing>) {
  return {
    id: cart.id,
    items: cart.items.map((item) => ({
      variantId: item.variantId,
      productId: item.variant.product.id,
      productSlug: item.variant.product.slug,
      productName: item.variant.product.name,
      variantName: item.variant.name,
      sku: item.variant.sku,
      thumbnailUrl: item.variant.product.images[0]?.url ?? null,
      unitPriceCents: effectivePriceCents(item.variant),
      quantity: item.quantity,
      availableQty: item.variant.inventory?.availableQty ?? 0,
      lineTotalCents: effectivePriceCents(item.variant) * item.quantity,
    })),
    coupon: cart.coupon ? { code: cart.coupon.code, type: cart.coupon.type } : null,
    pricing,
  };
}

export type CartDto = ReturnType<typeof toDto>;

async function buildDto(cart: CartWithRelations): Promise<CartDto> {
  const lineItems = toLineItems(cart);
  const pricing = computePricing(lineItems, cart.coupon);
  return toDto(cart, pricing);
}

export const cartService = {
  async getCart(userId: string): Promise<CartDto> {
    const cart = await getOrCreateCart(userId);
    return buildDto(cart);
  },

  async addItem(userId: string, variantId: string, quantity: number): Promise<CartDto> {
    const cart = await getOrCreateCart(userId);

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { inventory: true, product: true },
    });
    if (!variant || !variant.isActive || !variant.product.isActive) {
      throw ApiError.notFound("This product is no longer available");
    }

    const existing = await cartRepository.findItem(cart.id, variantId);
    const requestedTotal = (existing?.quantity ?? 0) + quantity;
    const availableQty = variant.inventory?.availableQty ?? 0;
    if (requestedTotal > availableQty) {
      throw ApiError.badRequest(
        availableQty === 0
          ? "This item is out of stock"
          : `Only ${availableQty} in stock — you already have ${existing?.quantity ?? 0} in your cart`,
      );
    }

    await cartRepository.addOrIncrementItem(cart.id, variantId, quantity);
    return this.getCart(userId);
  },

  async updateItemQuantity(userId: string, variantId: string, quantity: number): Promise<CartDto> {
    const cart = await getOrCreateCart(userId);
    const item = await cartRepository.findItem(cart.id, variantId);
    if (!item) throw ApiError.notFound("Item not in cart");

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { inventory: true },
    });
    const availableQty = variant?.inventory?.availableQty ?? 0;
    if (quantity > availableQty) {
      throw ApiError.badRequest(`Only ${availableQty} in stock`);
    }

    await cartRepository.setItemQuantity(cart.id, variantId, quantity);
    return this.getCart(userId);
  },

  async removeItem(userId: string, variantId: string): Promise<CartDto> {
    const cart = await getOrCreateCart(userId);
    const item = await cartRepository.findItem(cart.id, variantId);
    if (!item) throw ApiError.notFound("Item not in cart");
    await cartRepository.removeItem(cart.id, variantId);
    return this.getCart(userId);
  },

  async applyCoupon(userId: string, code: string): Promise<CartDto> {
    const cart = await getOrCreateCart(userId);
    if (cart.items.length === 0) throw ApiError.badRequest("Your cart is empty");

    const lineItems = toLineItems(cart);
    const subtotalCents = lineItems.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);
    const coupon = await couponService.validateForUser(code, userId, subtotalCents);

    await cartRepository.setCoupon(cart.id, coupon.id);
    return this.getCart(userId);
  },

  async removeCoupon(userId: string): Promise<CartDto> {
    const cart = await getOrCreateCart(userId);
    await cartRepository.setCoupon(cart.id, null);
    return this.getCart(userId);
  },

  /**
   * Called right after login with whatever the guest had in localStorage.
   * Quantities are summed with anything already in the user's DB cart and
   * capped at available stock — a guest browsing on one device shouldn't be
   * able to silently exceed stock limits their now-merged account cart has.
   */
  async mergeGuestCart(
    userId: string,
    guestItems: { variantId: string; quantity: number }[],
  ): Promise<CartDto> {
    const cart = await getOrCreateCart(userId);

    for (const guestItem of guestItems) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: guestItem.variantId },
        include: { inventory: true },
      });
      if (!variant || !variant.isActive) continue; // silently skip items no longer available

      const existing = await cartRepository.findItem(cart.id, guestItem.variantId);
      const availableQty = variant.inventory?.availableQty ?? 0;
      const mergedQty = Math.min((existing?.quantity ?? 0) + guestItem.quantity, availableQty);
      if (mergedQty <= 0) continue;

      if (existing) {
        await cartRepository.setItemQuantity(cart.id, guestItem.variantId, mergedQty);
      } else {
        await cartRepository.addOrIncrementItem(cart.id, guestItem.variantId, mergedQty);
      }
    }

    return this.getCart(userId);
  },

  async clearCart(userId: string): Promise<void> {
    const cart = await getOrCreateCart(userId);
    await cartRepository.clearItems(cart.id);
    await cartRepository.setCoupon(cart.id, null);
  },
};
