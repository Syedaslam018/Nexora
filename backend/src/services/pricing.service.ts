import { COMMERCE_RULES } from "../config/commerce.js";
import type { CouponWithRestrictions } from "./coupon.service.js";

export interface PricingLineItem {
  productId: string;
  categoryId: string;
  unitPriceCents: number;
  quantity: number;
}

export interface PricingBreakdown {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  freeShippingApplied: boolean;
}

/**
 * The ONLY place cart/order totals are computed. Cart display and order
 * creation (Phase 6) both call this with the same inputs and get the same
 * numbers — the frontend never sends a price or discount amount that gets
 * trusted; it only ever sends product/variant ids and quantities, and this
 * function (server-side) decides what they cost.
 */
export function computePricing(
  items: PricingLineItem[],
  coupon: CouponWithRestrictions | null,
): PricingBreakdown {
  const subtotalCents = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);

  let discountCents = 0;
  let freeShippingApplied = false;

  if (coupon) {
    const hasRestrictions = coupon.products.length > 0 || coupon.categories.length > 0;
    const eligibleProductIds = new Set(coupon.products.map((p) => p.productId));
    const eligibleCategoryIds = new Set(coupon.categories.map((c) => c.categoryId));

    const eligibleSubtotalCents = hasRestrictions
      ? items
          .filter(
            (item) =>
              eligibleProductIds.has(item.productId) || eligibleCategoryIds.has(item.categoryId),
          )
          .reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0)
      : subtotalCents;

    switch (coupon.type) {
      case "PERCENTAGE":
        discountCents = Math.round((eligibleSubtotalCents * coupon.value) / 100);
        break;
      case "FIXED_AMOUNT":
        discountCents = Math.min(coupon.value, eligibleSubtotalCents);
        break;
      case "FREE_SHIPPING":
        freeShippingApplied = true;
        break;
    }

    if (coupon.maxDiscountCents !== null) {
      discountCents = Math.min(discountCents, coupon.maxDiscountCents);
    }
  }

  const discountedSubtotal = Math.max(0, subtotalCents - discountCents);
  const taxCents = Math.round(discountedSubtotal * COMMERCE_RULES.FLAT_TAX_RATE);

  const qualifiesForFreeShipping =
    freeShippingApplied || discountedSubtotal >= COMMERCE_RULES.FREE_SHIPPING_THRESHOLD_CENTS;
  const shippingCents =
    items.length === 0 ? 0 : qualifiesForFreeShipping ? 0 : COMMERCE_RULES.FLAT_SHIPPING_CENTS;

  const totalCents = discountedSubtotal + taxCents + shippingCents;

  return {
    subtotalCents,
    discountCents,
    taxCents,
    shippingCents,
    totalCents,
    freeShippingApplied: qualifiesForFreeShipping,
  };
}
