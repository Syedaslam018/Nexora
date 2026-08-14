import { z } from "zod";

export const addCartItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive().max(99),
});
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive().max(99),
});
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export const cartItemParamsSchema = z.object({
  variantId: z.string().uuid(),
});

export const applyCouponSchema = z.object({
  code: z.string().trim().min(1).max(40),
});
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;

export const mergeGuestCartSchema = z.object({
  items: z
    .array(z.object({ variantId: z.string().uuid(), quantity: z.number().int().positive().max(99) }))
    .max(100),
});
export type MergeGuestCartInput = z.infer<typeof mergeGuestCartSchema>;
