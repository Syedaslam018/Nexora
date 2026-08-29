import { apiClient, type ApiSuccessResponse } from "./client";
import type {
  DashboardMetrics,
  RevenuePoint,
  OrderCountPoint,
  CategorySales,
  TopProduct,
  CustomerGrowthPoint,
  OrderStatusCount,
} from "@/types/dashboard";

export const adminDashboardApi = {
  async metrics() {
    const { data } = await apiClient.get<ApiSuccessResponse<DashboardMetrics>>("/admin/dashboard/metrics");
    return data.data;
  },
  async revenueOverTime(days = 30) {
    const { data } = await apiClient.get<ApiSuccessResponse<RevenuePoint[]>>(
      "/admin/dashboard/revenue-over-time",
      { params: { days } },
    );
    return data.data;
  },
  async ordersOverTime(days = 30) {
    const { data } = await apiClient.get<ApiSuccessResponse<OrderCountPoint[]>>(
      "/admin/dashboard/orders-over-time",
      { params: { days } },
    );
    return data.data;
  },
  async salesByCategory() {
    const { data } = await apiClient.get<ApiSuccessResponse<CategorySales[]>>(
      "/admin/dashboard/sales-by-category",
    );
    return data.data;
  },
  async topProducts(limit = 5) {
    const { data } = await apiClient.get<ApiSuccessResponse<TopProduct[]>>("/admin/dashboard/top-products", {
      params: { limit },
    });
    return data.data;
  },
  async customerGrowth(days = 30) {
    const { data } = await apiClient.get<ApiSuccessResponse<CustomerGrowthPoint[]>>(
      "/admin/dashboard/customer-growth",
      { params: { days } },
    );
    return data.data;
  },
  async orderStatusDistribution() {
    const { data } = await apiClient.get<ApiSuccessResponse<OrderStatusCount[]>>(
      "/admin/dashboard/order-status-distribution",
    );
    return data.data;
  },
};
