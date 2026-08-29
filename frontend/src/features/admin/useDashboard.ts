import { useQuery } from "@tanstack/react-query";
import { adminDashboardApi } from "@/api/adminDashboard.api";

export function useDashboardMetrics() {
  return useQuery({ queryKey: ["admin", "dashboard", "metrics"], queryFn: () => adminDashboardApi.metrics() });
}

export function useRevenueOverTime(days = 30) {
  return useQuery({
    queryKey: ["admin", "dashboard", "revenue", days],
    queryFn: () => adminDashboardApi.revenueOverTime(days),
  });
}

export function useOrdersOverTime(days = 30) {
  return useQuery({
    queryKey: ["admin", "dashboard", "orders-over-time", days],
    queryFn: () => adminDashboardApi.ordersOverTime(days),
  });
}

export function useSalesByCategory() {
  return useQuery({
    queryKey: ["admin", "dashboard", "sales-by-category"],
    queryFn: () => adminDashboardApi.salesByCategory(),
  });
}

export function useTopProducts(limit = 5) {
  return useQuery({
    queryKey: ["admin", "dashboard", "top-products", limit],
    queryFn: () => adminDashboardApi.topProducts(limit),
  });
}

export function useCustomerGrowth(days = 30) {
  return useQuery({
    queryKey: ["admin", "dashboard", "customer-growth", days],
    queryFn: () => adminDashboardApi.customerGrowth(days),
  });
}

export function useOrderStatusDistribution() {
  return useQuery({
    queryKey: ["admin", "dashboard", "order-status-distribution"],
    queryFn: () => adminDashboardApi.orderStatusDistribution(),
  });
}
