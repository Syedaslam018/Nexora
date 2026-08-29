import { useQuery } from "@tanstack/react-query";
import { adminAnalyticsApi } from "@/api/adminAnalytics.api";

const KEY = ["admin", "analytics"];

export function useTopCustomers(limit = 10) {
  return useQuery({ queryKey: [...KEY, "top-customers", limit], queryFn: () => adminAnalyticsApi.topCustomers(limit) });
}

export function useMonthlyRevenue(months = 12) {
  return useQuery({ queryKey: [...KEY, "monthly-revenue", months], queryFn: () => adminAnalyticsApi.monthlyRevenue(months) });
}

export function useBestSellingProducts(limit = 10) {
  return useQuery({ queryKey: [...KEY, "best-selling", limit], queryFn: () => adminAnalyticsApi.bestSellingProducts(limit) });
}

export function useAverageOrderValueByMonth(months = 12) {
  return useQuery({ queryKey: [...KEY, "aov", months], queryFn: () => adminAnalyticsApi.averageOrderValueByMonth(months) });
}

export function useMonthlyNewVsReturning(months = 12) {
  return useQuery({ queryKey: [...KEY, "new-vs-returning", months], queryFn: () => adminAnalyticsApi.monthlyNewVsReturning(months) });
}

export function useRetentionSummary() {
  return useQuery({ queryKey: [...KEY, "retention"], queryFn: () => adminAnalyticsApi.retentionSummary() });
}

export function useAverageCLV() {
  return useQuery({ queryKey: [...KEY, "clv"], queryFn: () => adminAnalyticsApi.averageCLV() });
}

export function useProductPerformance(limit = 20) {
  return useQuery({ queryKey: [...KEY, "product-performance", limit], queryFn: () => adminAnalyticsApi.productPerformance(limit) });
}

export function useCategoryPerformance() {
  return useQuery({ queryKey: [...KEY, "category-performance"], queryFn: () => adminAnalyticsApi.categoryPerformance() });
}

export function useRevenueGrowth(months = 12) {
  return useQuery({ queryKey: [...KEY, "revenue-growth", months], queryFn: () => adminAnalyticsApi.revenueGrowth(months) });
}
