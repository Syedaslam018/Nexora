import { apiClient, type ApiSuccessResponse } from "./client";
import type { PaginationMeta } from "@/types/product";
import type { Review } from "@/types/review";

export interface AdminReview extends Review {
  product: { name: string; slug: string };
}

export const adminReviewsApi = {
  async list(params: { status?: string; page?: number }) {
    const { data } = await apiClient.get<
      ApiSuccessResponse<{ items: AdminReview[]; meta: PaginationMeta }>
    >("/reviews/admin/all", { params });
    return data.data;
  },

  async approve(id: string) {
    const { data } = await apiClient.patch<ApiSuccessResponse<Review>>(`/reviews/admin/${id}/approve`);
    return data.data;
  },

  async hide(id: string) {
    const { data } = await apiClient.patch<ApiSuccessResponse<Review>>(`/reviews/admin/${id}/hide`);
    return data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/reviews/admin/${id}`);
  },
};
