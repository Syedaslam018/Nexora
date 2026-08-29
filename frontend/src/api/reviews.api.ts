import { apiClient, type ApiSuccessResponse } from "./client";
import type { PaginationMeta } from "@/types/product";
import type { Review, RatingDistribution, CreateReviewInput, UpdateReviewInput } from "@/types/review";

export const reviewsApi = {
  async listForProduct(
    productId: string,
    params: { sort?: string; page?: number; pageSize?: number },
  ) {
    const { data } = await apiClient.get<
      ApiSuccessResponse<{ items: Review[]; distribution: RatingDistribution; meta: PaginationMeta }>
    >(`/reviews/product/${productId}`, { params });
    return data.data;
  },

  async myReview(productId: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<Review | null>>(
      `/reviews/product/${productId}/mine`,
    );
    return data.data;
  },

  async create(input: CreateReviewInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<Review>>("/reviews", input);
    return data.data;
  },

  async update(id: string, input: UpdateReviewInput) {
    const { data } = await apiClient.patch<ApiSuccessResponse<Review>>(`/reviews/${id}`, input);
    return data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/reviews/${id}`);
  },
};
