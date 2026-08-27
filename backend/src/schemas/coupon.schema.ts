import { z } from "zod";

export const createCouponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3)
      .max(40)
      .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, hyphens, underscores only")
      .transform((v) => v.toUpperCase()),
    type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
    value: z.number().int().nonnegative(),
    minOrderValueCents: z.number().int().nonnegative().optional(),
    maxDiscountCents: z.number().int().nonnegative().optional(),
    startsAt: z.coerce.date(),
    expiresAt: z.coerce.date(),
    usageLimit: z.number().int().positive().optional(),
    perUserLimit: z.number().int().positive().optional(),
    isActive: z.boolean().default(true),
    categoryIds: z.array(z.string().uuid()).default([]),
    productIds: z.array(z.string().uuid()).default([]),
  })
  .refine((data) => data.expiresAt > data.startsAt, {
    message: "Expiry must be after the start date",
    path: ["expiresAt"],
  })
  .refine((data) => data.type !== "PERCENTAGE" || data.value <= 100, {
    message: "Percentage discounts can't exceed 100",
    path: ["value"],
  });
export type CreateCouponInput = z.infer<typeof createCouponSchema>;

export const updateCouponSchema = z.object({
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]).optional(),
  value: z.number().int().nonnegative().optional(),
  minOrderValueCents: z.number().int().nonnegative().nullable().optional(),
  maxDiscountCents: z.number().int().nonnegative().nullable().optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  perUserLimit: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  productIds: z.array(z.string().uuid()).optional(),
});
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;

export const couponParamsSchema = z.object({ id: z.string().uuid() });

export const couponListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});
export type CouponListQuery = z.infer<typeof couponListQuerySchema>;
