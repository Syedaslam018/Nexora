import { apiClient, type ApiSuccessResponse } from "./client";
import type { PaginationMeta } from "@/types/product";
import type { AdminProductListItem, CreateProductInput } from "@/types/adminProduct";

export const adminProductsApi = {
  async list(params: { search?: string; page?: number; pageSize?: number }) {
    const { data } = await apiClient.get<
      ApiSuccessResponse<{ items: AdminProductListItem[]; meta: PaginationMeta }>
    >("/admin/products", { params });
    return data.data;
  },

  async create(input: CreateProductInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<unknown>>("/products", input);
    return data.data;
  },

  async setActive(productId: string, isActive: boolean) {
    const { data } = await apiClient.patch<ApiSuccessResponse<unknown>>(
      `/admin/products/${productId}/active`,
      { isActive },
    );
    return data.data;
  },
};
