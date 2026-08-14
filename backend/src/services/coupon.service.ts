import { couponRepository } from "../repositories/coupon.repository.js";
import { ApiError } from "../utils/ApiError.js";
import type { Coupon, CouponCategory, CouponProduct } from "@prisma/client";

export type CouponWithRestrictions = Coupon & {
  products: CouponProduct[];
  categories: CouponCategory[];
};

/**
 * Checks everything about a coupon EXCEPT whether the cart's contents are
 * eligible for it — that's product/category-specific and is computed
 * against actual line items in `pricing.service.ts`, since it affects how
 * much discount applies, not just whether the code is valid at all.
 */
export const couponService = {
  async validateForUser(
    code: string,
    userId: string,
    subtotalCents: number,
  ): Promise<CouponWithRestrictions> {
    const coupon = await couponRepository.findByCode(code.trim().toUpperCase());
    if (!coupon || !coupon.isActive) {
      throw ApiError.badRequest("This coupon code is invalid");
    }

    const now = new Date();
    if (now < coupon.startsAt || now > coupon.expiresAt) {
      throw ApiError.badRequest("This coupon has expired or is not yet active");
    }

    if (coupon.usageLimit !== null) {
      const totalUsages = await couponRepository.countTotalUsages(coupon.id);
      if (totalUsages >= coupon.usageLimit) {
        throw ApiError.badRequest("This coupon has reached its usage limit");
      }
    }

    if (coupon.perUserLimit !== null) {
      const userUsages = await couponRepository.countUserUsages(coupon.id, userId);
      if (userUsages >= coupon.perUserLimit) {
        throw ApiError.badRequest("You've already used this coupon the maximum number of times");
      }
    }

    if (coupon.minOrderValueCents !== null && subtotalCents < coupon.minOrderValueCents) {
      throw ApiError.badRequest(
        `This coupon requires a minimum order of $${(coupon.minOrderValueCents / 100).toFixed(2)}`,
      );
    }

    return coupon;
  },
};
