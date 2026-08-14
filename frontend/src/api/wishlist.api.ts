import { apiClient, type ApiSuccessResponse } from "./client";
import type { Wishlist } from "@/types/wishlist";

export const wishlistApi = {
  async get() {
    const { data } = await apiClient.get<ApiSuccessResponse<Wishlist>>("/wishlist");
    return data.data;
  },

  async add(productId: string) {
    const { data } = await apiClient.post<ApiSuccessResponse<Wishlist>>(`/wishlist/${productId}`);
    return data.data;
  },

  async remove(productId: string) {
    const { data } = await apiClient.delete<ApiSuccessResponse<Wishlist>>(
      `/wishlist/${productId}`,
    );
    return data.data;
  },

  async moveToCart(productId: string, variantId: string, quantity = 1) {
    const { data } = await apiClient.post<ApiSuccessResponse<Wishlist>>(
      `/wishlist/${productId}/move-to-cart`,
      { variantId, quantity },
    );
    return data.data;
  },
};
