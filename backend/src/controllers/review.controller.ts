import type { Request, Response } from "express";
import { reviewService } from "../services/review.service.js";
import { sendSuccess, sendPaginated } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type {
  CreateReviewInput,
  UpdateReviewInput,
  ReviewListQuery,
  AdminReviewListQuery,
} from "../schemas/review.schema.js";

export const reviewController = {
  listForProduct: asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const query = req.query as unknown as ReviewListQuery;
    const { items, distribution, meta } = await reviewService.listForProduct(productId, query);
    // Custom shape (not the generic sendPaginated envelope) since the
    // rating distribution needs to travel alongside the page of reviews —
    // splitting it into a second request would be a wasted round trip for
    // data that's always needed together on the product page.
    sendSuccess(res, { items, distribution, meta }, "Reviews retrieved");
  }),

  myReviewForProduct: asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const review = await reviewService.getMyReviewForProduct(productId, req.user!.id);
    sendSuccess(res, review, "Review retrieved");
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateReviewInput;
    const review = await reviewService.create(req.user!.id, body);
    sendSuccess(res, review, "Review submitted for moderation", 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const body = req.body as UpdateReviewInput;
    const review = await reviewService.update(req.user!.id, id, body);
    sendSuccess(res, review, "Review updated");
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await reviewService.remove(req.user!.id, id);
    sendSuccess(res, null, "Review deleted");
  }),

  adminList: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as AdminReviewListQuery;
    const { items, meta } = await reviewService.listForAdmin(query);
    sendPaginated(res, items, meta, "Reviews retrieved");
  }),

  approve: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    sendSuccess(res, await reviewService.approve(id), "Review approved");
  }),

  hide: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    sendSuccess(res, await reviewService.hide(id), "Review hidden");
  }),

  adminRemove: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await reviewService.removeAsAdmin(id);
    sendSuccess(res, null, "Review deleted");
  }),
};
