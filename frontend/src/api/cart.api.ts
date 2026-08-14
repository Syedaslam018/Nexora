import { apiClient, type ApiSuccessResponse } from "./client";
import type { Cart } from "@/types/cart";

export const cartApi = {
  async get() {
    const { data } = await apiClient.get<ApiSuccessResponse<Cart>>("/cart");
    return data.data;
  },

  async addItem(variantId: string, quantity: number) {
    const { data } = await apiClient.post<ApiSuccessResponse<Cart>>("/cart/items", {
      variantId,
      quantity,
    });
    return data.data;
  },

  async updateItemQuantity(variantId: string, quantity: number) {
    const { data } = await apiClient.patch<ApiSuccessResponse<Cart>>(
      `/cart/items/${variantId}`,
      { quantity },
    );
    return data.data;
  },

  async removeItem(variantId: string) {
    const { data } = await apiClient.delete<ApiSuccessResponse<Cart>>(`/cart/items/${variantId}`);
    return data.data;
  },

  async applyCoupon(code: string) {
    const { data } = await apiClient.post<ApiSuccessResponse<Cart>>("/cart/coupon", { code });
    return data.data;
  },

  async removeCoupon() {
    const { data } = await apiClient.delete<ApiSuccessResponse<Cart>>("/cart/coupon");
    return data.data;
  },

  async merge(items: { variantId: string; quantity: number }[]) {
    const { data } = await apiClient.post<ApiSuccessResponse<Cart>>("/cart/merge", { items });
    return data.data;
  },
};
