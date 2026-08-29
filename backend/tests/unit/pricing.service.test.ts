import { describe, it, expect } from "vitest";
import { computePricing, type PricingLineItem } from "../../src/services/pricing.service.js";
import type { CouponWithRestrictions } from "../../src/services/coupon.service.js";

/**
 * Pure-function tests — computePricing takes no dependencies (no DB, no
 * network), so these run with zero mocking and are the highest-confidence
 * tests in the suite. This is the single function all cart/order totals
 * flow through (see the file's own doc comment), so it earns thorough
 * coverage.
 */

const laptop: PricingLineItem = {
  productId: "prod-laptop",
  categoryId: "cat-electronics",
  unitPriceCents: 100_000, // $1,000.00
  quantity: 1,
};

const mouse: PricingLineItem = {
  productId: "prod-mouse",
  categoryId: "cat-accessories",
  unitPriceCents: 2_500, // $25.00
  quantity: 2,
};

function makeCoupon(overrides: Partial<CouponWithRestrictions>): CouponWithRestrictions {
  return {
    id: "coupon-1",
    code: "TESTCODE",
    type: "PERCENTAGE",
    value: 10,
    minOrderValueCents: null,
    maxDiscountCents: null,
    startsAt: new Date("2020-01-01"),
    expiresAt: new Date("2999-01-01"),
    usageLimit: null,
    perUserLimit: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    products: [],
    categories: [],
    ...overrides,
  };
}

describe("computePricing", () => {
  it("returns all zeros for an empty cart", () => {
    const result = computePricing([], null);
    expect(result).toEqual({
      subtotalCents: 0,
      discountCents: 0,
      taxCents: 0,
      shippingCents: 0,
      totalCents: 0,
      freeShippingApplied: false,
    });
  });

  it("sums line items into a subtotal", () => {
    const result = computePricing([laptop, mouse], null);
    // 100,000 + (2,500 * 2) = 105,000
    expect(result.subtotalCents).toBe(105_000);
  });

  it("applies flat shipping under the free-shipping threshold", () => {
    const result = computePricing([mouse], null); // subtotal 5,000 < 7,500 threshold
    expect(result.shippingCents).toBe(599);
    expect(result.freeShippingApplied).toBe(false);
  });

  it("waives shipping once the subtotal clears the free-shipping threshold", () => {
    const result = computePricing([laptop], null); // subtotal 100,000 >= 7,500 threshold
    expect(result.shippingCents).toBe(0);
    expect(result.freeShippingApplied).toBe(true);
  });

  it("charges the flat express rate regardless of subtotal", () => {
    const result = computePricing([laptop], null, "EXPRESS");
    expect(result.shippingCents).toBe(1_999);
  });

  it("computes 8% tax on the (undiscounted) subtotal when there's no coupon", () => {
    const result = computePricing([mouse], null); // subtotal 5,000
    expect(result.taxCents).toBe(400); // 5,000 * 0.08
  });

  it("applies a percentage coupon across the whole cart when unrestricted", () => {
    const coupon = makeCoupon({ type: "PERCENTAGE", value: 10 });
    const result = computePricing([laptop, mouse], coupon);
    // 10% of 105,000 = 10,500
    expect(result.discountCents).toBe(10_500);
  });

  it("caps a percentage discount at maxDiscountCents", () => {
    const coupon = makeCoupon({ type: "PERCENTAGE", value: 50, maxDiscountCents: 5_000 });
    const result = computePricing([laptop], coupon); // 50% of 100,000 = 50,000, capped to 5,000
    expect(result.discountCents).toBe(5_000);
  });

  it("caps a fixed-amount coupon at the eligible subtotal (never a negative total)", () => {
    const coupon = makeCoupon({ type: "FIXED_AMOUNT", value: 10_000 });
    const result = computePricing([mouse], coupon); // subtotal only 5,000
    expect(result.discountCents).toBe(5_000);
  });

  it("only discounts eligible line items when a coupon is category-restricted", () => {
    const coupon = makeCoupon({
      type: "PERCENTAGE",
      value: 10,
      categories: [{ couponId: "coupon-1", categoryId: "cat-accessories" }],
    });
    const result = computePricing([laptop, mouse], coupon);
    // Only mouse (categoryId "cat-accessories") is eligible: 10% of 5,000 = 500
    expect(result.discountCents).toBe(500);
  });

  it("only discounts eligible line items when a coupon is product-restricted", () => {
    const coupon = makeCoupon({
      type: "PERCENTAGE",
      value: 100,
      products: [{ couponId: "coupon-1", productId: "prod-mouse" }],
    });
    const result = computePricing([laptop, mouse], coupon);
    // 100% off only the mouse line (5,000), laptop untouched
    expect(result.discountCents).toBe(5_000);
  });

  it("a FREE_SHIPPING coupon zeroes shipping regardless of delivery method or subtotal", () => {
    const coupon = makeCoupon({ type: "FREE_SHIPPING", value: 0 });
    const result = computePricing([mouse], coupon, "EXPRESS"); // would normally be $19.99 express
    expect(result.shippingCents).toBe(0);
    expect(result.freeShippingApplied).toBe(true);
    expect(result.discountCents).toBe(0); // FREE_SHIPPING doesn't also discount the subtotal
  });

  it("computes tax on the post-discount subtotal, not the pre-discount one", () => {
    const coupon = makeCoupon({ type: "FIXED_AMOUNT", value: 25_000 });
    const result = computePricing([laptop], coupon); // 100,000 - 25,000 = 75,000 taxable
    expect(result.taxCents).toBe(6_000); // 75,000 * 0.08
  });

  it("total is discountedSubtotal + tax + shipping", () => {
    const coupon = makeCoupon({ type: "PERCENTAGE", value: 10 });
    const result = computePricing([laptop], coupon);
    const discountedSubtotal = 100_000 - result.discountCents;
    expect(result.totalCents).toBe(discountedSubtotal + result.taxCents + result.shippingCents);
  });
});
