import { apiClient, type ApiSuccessResponse } from "./client";
import type { Order, CreateOrderInput, CreateOrderResult, OrderStatus } from "@/types/order";
import type { PaginationMeta } from "@/types/product";

export interface OrderListParams {
  status?: OrderStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ReorderResult {
  added: string[];
  skipped: { name: string; reason: string }[];
}

export const ordersApi = {
  async create(input: CreateOrderInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<CreateOrderResult>>("/orders", input);
    return data.data;
  },

  async list(params: OrderListParams) {
    const { data } = await apiClient.get<ApiSuccessResponse<{ items: Order[]; meta: PaginationMeta }>>(
      "/orders",
      { params },
    );
    return data.data;
  },

  async detail(id: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<Order>>(`/orders/${id}`);
    return data.data;
  },

  async cancel(id: string, reason?: string) {
    const { data } = await apiClient.post<ApiSuccessResponse<Order>>(`/orders/${id}/cancel`, { reason });
    return data.data;
  },

  async requestRefund(id: string, reason?: string) {
    const { data } = await apiClient.post<ApiSuccessResponse<Order>>(`/orders/${id}/refund-request`, {
      reason,
    });
    return data.data;
  },

  async reorder(id: string) {
    const { data } = await apiClient.post<ApiSuccessResponse<ReorderResult>>(`/orders/${id}/reorder`);
    return data.data;
  },

  async downloadInvoice(id: string, orderNumber: string) {
    const response = await apiClient.get(`/orders/${id}/invoice`, { responseType: "blob" });
    const url = URL.createObjectURL(response.data as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${orderNumber}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  },
};
