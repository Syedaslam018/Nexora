import { couponRepository } from "../repositories/coupon.repository.js";
import { paginationMeta } from "../utils/pagination.js";
import { ApiError } from "../utils/ApiError.js";
import type { Coupon, CouponCategory, CouponProduct } from "@prisma/client";
import type { CreateCouponInput, UpdateCouponInput, CouponListQuery } from "../schemas/coupon.schema.js";

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

  // ── Admin CRUD ──────────────────────────────────────────────────────
  // Kept in the same service as customer-facing validation (rather than a
  // separate admin-only service) since both operate on the same Coupon
  // entity and its rules — splitting them would just mean two files that
  // have to agree on what a "valid coupon" looks like.

  async adminList(query: CouponListQuery) {
    const { items, totalItems } = await couponRepository.findManyForAdmin({
      page: query.page,
      pageSize: query.pageSize,
    });
    return { items, meta: paginationMeta(totalItems, { page: query.page, pageSize: query.pageSize }) };
  },

  async adminCreate(input: CreateCouponInput) {
    const existing = await couponRepository.findByCode(input.code);
    if (existing) throw ApiError.conflict("A coupon with this code already exists");
    return couponRepository.create(input);
  },

  async adminUpdate(id: string, input: UpdateCouponInput) {
    const existing = await couponRepository.findById(id);
    if (!existing) throw ApiError.notFound("Coupon not found");
    return couponRepository.update(id, input);
  },

  async adminDelete(id: string) {
    const existing = await couponRepository.findById(id);
    if (!existing) throw ApiError.notFound("Coupon not found");
    await couponRepository.delete(id);
  },
};
