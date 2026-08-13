import { apiClient, type ApiSuccessResponse } from "./client";
import type { ProductDetail, ProductListItem, ProductListParams, PaginationMeta } from "@/types/product";

export const productsApi = {
  async list(params: ProductListParams) {
    const { data } = await apiClient.get<
      ApiSuccessResponse<{ items: ProductListItem[]; meta: PaginationMeta }>
    >("/products", { params });
    return data.data;
  },

  async detail(idOrSlug: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<ProductDetail>>(
      `/products/${idOrSlug}`,
    );
    return data.data;
  },

  async byIds(ids: string[]) {
    if (ids.length === 0) return [];
    const { data } = await apiClient.get<ApiSuccessResponse<ProductListItem[]>>(
      "/products/by-ids",
      { params: { ids: ids.join(",") } },
    );
    return data.data;
  },
};
