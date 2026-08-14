import { apiClient, type ApiSuccessResponse } from "./client";
import type { Order, CreateOrderInput, CreateOrderResult } from "@/types/order";

export const ordersApi = {
  async create(input: CreateOrderInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<CreateOrderResult>>("/orders", input);
    return data.data;
  },

  async detail(id: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<Order>>(`/orders/${id}`);
    return data.data;
  },
};
