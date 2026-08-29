import { apiClient, type ApiSuccessResponse } from "./client";
import type { Order, OrderStatus } from "@/types/order";
import type { PaginationMeta } from "@/types/product";

export interface AdminOrder extends Order {
  user: { id: string; firstName: string; lastName: string; email: string };
}

export interface AdminOrderListParams {
  status?: OrderStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const adminOrdersApi = {
  async list(params: AdminOrderListParams) {
    const { data } = await apiClient.get<ApiSuccessResponse<{ items: AdminOrder[]; meta: PaginationMeta }>>(
      "/admin/orders",
      { params },
    );
    return data.data;
  },

  async detail(id: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<AdminOrder>>(`/admin/orders/${id}`);
    return data.data;
  },

  async updateStatus(id: string, status: OrderStatus, note?: string) {
    const { data } = await apiClient.patch<ApiSuccessResponse<AdminOrder>>(`/admin/orders/${id}/status`, {
      status,
      note,
    });
    return data.data;
  },
};
