import { z } from "zod";

export const adjustStockSchema = z.object({
  delta: z.number().int().refine((v) => v !== 0, "Delta must not be zero"),
  note: z.string().trim().min(1).max(300),
});
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;

export const variantParamsSchema = z.object({ variantId: z.string().uuid() });
