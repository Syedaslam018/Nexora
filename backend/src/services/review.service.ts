import { prisma } from "../config/db.js";
import { reviewRepository } from "../repositories/review.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { paginationMeta } from "../utils/pagination.js";
import type {
  CreateReviewInput,
  UpdateReviewInput,
  ReviewListQuery,
  AdminReviewListQuery,
} from "../schemas/review.schema.js";

/** Recomputes the denormalized `avgRating`/`reviewCount` on Product from
 * APPROVED reviews only — called after every create/edit/delete/moderation
 * action so those two fields (used everywhere product cards/listings show
 * a rating) never drift from the actual review rows. */
async function recomputeProductRating(productId: string): Promise<void> {
  const agg = await prisma.review.aggregate({
    where: { productId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: { avgRating: agg._avg.rating ?? 0, reviewCount: agg._count.rating },
  });
}

export const reviewService = {
  async listForProduct(productId: string, query: ReviewListQuery) {
    const [{ items, totalItems }, distribution] = await Promise.all([
      reviewRepository.findManyForProduct(productId, query.sort, {
        page: query.page,
        pageSize: query.pageSize,
      }),
      reviewRepository.findRatingDistribution(productId),
    ]);
    return {
      items,
      distribution,
      meta: paginationMeta(totalItems, { page: query.page, pageSize: query.pageSize }),
    };
  },

  getMyReviewForProduct(productId: string, userId: string) {
    return reviewRepository.findByProductAndUser(productId, userId);
  },

  /**
   * Every review requires a DELIVERED order item for this product that
   * isn't already tied to a review — "Customers can review products they
   * purchased" (Section 8) is enforced structurally, not by a checkbox the
   * user could lie about. `isVerifiedPurchase` is therefore always true;
   * there's no code path that creates an unverified review.
   */
  async create(userId: string, input: CreateReviewInput) {
    const existing = await reviewRepository.findByProductAndUser(input.productId, userId);
    if (existing) throw ApiError.conflict("You've already reviewed this product");

    const orderItem = await reviewRepository.findReviewableOrderItem(userId, input.productId);
    if (!orderItem) {
      throw ApiError.badRequest(
        "You can only review products from delivered orders you haven't already reviewed",
      );
    }

    const review = await reviewRepository.create(userId, {
      productId: input.productId,
      orderItemId: orderItem.id,
      rating: input.rating,
      title: input.title,
      body: input.body,
    });
    if (input.images.length > 0) await reviewRepository.setImages(review.id, input.images);
    return reviewRepository.findById(review.id);
  },

  /**
   * Editing resets the review to PENDING for re-moderation — an approved
   * review's visible content shouldn't change without another look, same
   * principle as the original submission.
   */
  async update(userId: string, reviewId: string, input: UpdateReviewInput) {
    const review = await reviewRepository.findById(reviewId);
    if (!review || review.userId !== userId) throw ApiError.notFound("Review not found");

    const wasApproved = review.status === "APPROVED";
    await reviewRepository.update(reviewId, {
      rating: input.rating,
      title: input.title,
      body: input.body,
      status: "PENDING",
    });
    if (input.images) await reviewRepository.setImages(reviewId, input.images);
    if (wasApproved) await recomputeProductRating(review.productId);
    return reviewRepository.findById(reviewId);
  },

  async remove(userId: string, reviewId: string) {
    const review = await reviewRepository.findById(reviewId);
    if (!review || review.userId !== userId) throw ApiError.notFound("Review not found");
    await reviewRepository.delete(reviewId);
    if (review.status === "APPROVED") await recomputeProductRating(review.productId);
  },

  listForAdmin(query: AdminReviewListQuery) {
    return reviewRepository
      .findManyForAdmin(query.status, { page: query.page, pageSize: query.pageSize })
      .then(({ items, totalItems }) => ({
        items,
        meta: paginationMeta(totalItems, { page: query.page, pageSize: query.pageSize }),
      }));
  },

  async approve(reviewId: string) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw ApiError.notFound("Review not found");
    await reviewRepository.setStatus(reviewId, "APPROVED");
    await recomputeProductRating(review.productId);
    return reviewRepository.findById(reviewId);
  },

  async hide(reviewId: string) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw ApiError.notFound("Review not found");
    await reviewRepository.setStatus(reviewId, "HIDDEN");
    await recomputeProductRating(review.productId);
    return reviewRepository.findById(reviewId);
  },

  async removeAsAdmin(reviewId: string) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw ApiError.notFound("Review not found");
    await reviewRepository.delete(reviewId);
    if (review.status === "APPROVED") await recomputeProductRating(review.productId);
  },
};
