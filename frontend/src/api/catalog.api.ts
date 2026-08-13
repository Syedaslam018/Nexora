import { apiClient, type ApiSuccessResponse } from "./client";
import type { CategoryNode, Brand } from "@/types/product";

export const categoriesApi = {
  async tree() {
    const { data } = await apiClient.get<ApiSuccessResponse<CategoryNode[]>>("/categories");
    return data.data;
  },
};

export const brandsApi = {
  async list() {
    const { data } = await apiClient.get<ApiSuccessResponse<Brand[]>>("/brands");
    return data.data;
  },
};
