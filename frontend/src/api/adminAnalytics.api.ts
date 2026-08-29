import { apiClient, type ApiSuccessResponse } from "./client";
import type {
  TopCustomerRow,
  MonthlyRevenueRow,
  BestSellingProductRow,
  AvgOrderValueRow,
  NewVsReturningRow,
  RetentionSummary,
  AverageCLV,
  ProductPerformanceRow,
  CategoryPerformanceRow,
  RevenueGrowthRow,
} from "@/types/analytics";

async function get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await apiClient.get<ApiSuccessResponse<T>>(path, { params });
  return data.data;
}

export const adminAnalyticsApi = {
  topCustomers: (limit = 10) => get<TopCustomerRow[]>("/admin/analytics/top-customers", { limit }),
  monthlyRevenue: (months = 12) => get<MonthlyRevenueRow[]>("/admin/analytics/monthly-revenue", { months }),
  bestSellingProducts: (limit = 10) =>
    get<BestSellingProductRow[]>("/admin/analytics/best-selling-products", { limit }),
  averageOrderValueByMonth: (months = 12) =>
    get<AvgOrderValueRow[]>("/admin/analytics/average-order-value-by-month", { months }),
  monthlyNewVsReturning: (months = 12) =>
    get<NewVsReturningRow[]>("/admin/analytics/monthly-new-vs-returning", { months }),
  retentionSummary: () => get<RetentionSummary>("/admin/analytics/retention-summary"),
  averageCLV: () => get<AverageCLV>("/admin/analytics/average-clv"),
  productPerformance: (limit = 20) =>
    get<ProductPerformanceRow[]>("/admin/analytics/product-performance", { limit }),
  categoryPerformance: () => get<CategoryPerformanceRow[]>("/admin/analytics/category-performance"),
  revenueGrowth: (months = 12) => get<RevenueGrowthRow[]>("/admin/analytics/revenue-growth", { months }),
};
