import { apiClient, type ApiSuccessResponse } from "./client";
import type { PaginationMeta } from "@/types/product";
import type { AdminCustomerListItem, AdminCustomerDetail } from "@/types/adminCustomer";

export const adminCustomersApi = {
  async list(params: { search?: string; page?: number }) {
    const { data } = await apiClient.get<
      ApiSuccessResponse<{ items: AdminCustomerListItem[]; meta: PaginationMeta }>
    >("/admin/customers", { params });
    return data.data;
  },

  async detail(id: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<AdminCustomerDetail>>(`/admin/customers/${id}`);
    return data.data;
  },

  async setActive(id: string, isActive: boolean) {
    const { data } = await apiClient.patch<ApiSuccessResponse<AdminCustomerDetail>>(
      `/admin/customers/${id}/active`,
      { isActive },
    );
    return data.data;
  },

  async setRole(id: string, role: "CUSTOMER" | "STAFF" | "ADMIN") {
    const { data } = await apiClient.patch<ApiSuccessResponse<AdminCustomerDetail>>(
      `/admin/customers/${id}/role`,
      { role },
    );
    return data.data;
  },
};
