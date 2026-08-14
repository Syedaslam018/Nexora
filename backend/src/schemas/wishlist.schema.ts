import { z } from "zod";

export const wishlistProductParamsSchema = z.object({
  productId: z.string().uuid(),
});

export const moveToCartSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive().max(99).default(1),
});
export type MoveToCartInput = z.infer<typeof moveToCartSchema>;
