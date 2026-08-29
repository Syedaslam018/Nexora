export type CouponType = "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderValueCents: number | null;
  maxDiscountCents: number | null;
  startsAt: string;
  expiresAt: string;
  usageLimit: number | null;
  perUserLimit: number | null;
  isActive: boolean;
  categories: { categoryId: string }[];
  products: { productId: string }[];
  _count?: { usages: number };
}

export interface CreateCouponInput {
  code: string;
  type: CouponType;
  value: number;
  minOrderValueCents?: number;
  maxDiscountCents?: number;
  startsAt: string;
  expiresAt: string;
  usageLimit?: number;
  perUserLimit?: number;
  isActive: boolean;
  categoryIds: string[];
  productIds: string[];
}

export type UpdateCouponInput = Partial<Omit<CreateCouponInput, "code">>;
