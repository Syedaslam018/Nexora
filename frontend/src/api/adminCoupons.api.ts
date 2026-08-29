import { apiClient, type ApiSuccessResponse } from "./client";
import type { PaginationMeta } from "@/types/product";
import type { Coupon, CreateCouponInput, UpdateCouponInput } from "@/types/coupon";

export const adminCouponsApi = {
  async list(params: { page?: number; pageSize?: number }) {
    const { data } = await apiClient.get<ApiSuccessResponse<{ items: Coupon[]; meta: PaginationMeta }>>(
      "/admin/coupons",
      { params },
    );
    return data.data;
  },

  async create(input: CreateCouponInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<Coupon>>("/admin/coupons", input);
    return data.data;
  },

  async update(id: string, input: UpdateCouponInput) {
    const { data } = await apiClient.patch<ApiSuccessResponse<Coupon>>(`/admin/coupons/${id}`, input);
    return data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/admin/coupons/${id}`);
  },
};
