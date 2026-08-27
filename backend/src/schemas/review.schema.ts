import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(1).max(2000),
  images: z.array(z.string().url()).max(6).default([]),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(1).max(2000).optional(),
  images: z.array(z.string().url()).max(6).optional(),
});
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

export const reviewParamsSchema = z.object({ id: z.string().uuid() });
export const productIdParamsSchema = z.object({ productId: z.string().uuid() });

export const reviewListQuerySchema = z.object({
  sort: z.enum(["newest", "highest_rated", "lowest_rated"]).default("newest"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
});
export type ReviewListQuery = z.infer<typeof reviewListQuerySchema>;

export const adminReviewListQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "HIDDEN"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});
export type AdminReviewListQuery = z.infer<typeof adminReviewListQuerySchema>;
