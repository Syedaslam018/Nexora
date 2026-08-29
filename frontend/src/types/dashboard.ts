export interface DashboardMetrics {
  totalRevenueCents: number;
  todayRevenueCents: number;
  monthlyRevenueCents: number;
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  averageOrderValueCents: number;
  approxConversionRate: number;
  lowStockCount: number;
}

export interface RevenuePoint {
  date: string;
  revenueCents: number;
}

export interface OrderCountPoint {
  date: string;
  orderCount: number;
}

export interface CategorySales {
  categoryName: string;
  revenueCents: number;
  unitsSold: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  revenueCents: number;
  unitsSold: number;
}

export interface CustomerGrowthPoint {
  date: string;
  newCustomers: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}
