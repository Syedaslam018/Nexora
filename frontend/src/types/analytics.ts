export interface TopCustomerRow {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  order_count: number;
  lifetime_spend_cents: number;
  spend_rank: number;
}

export interface MonthlyRevenueRow {
  month: string;
  order_count: number;
  revenue_cents: number;
  cumulative_revenue_cents: number;
}

export interface BestSellingProductRow {
  product_id: string;
  product_name: string;
  units_sold: number;
  revenue_cents: number;
  sales_rank: number;
}

export interface AvgOrderValueRow {
  month: string;
  order_count: number;
  avg_order_value_cents: number;
}

export interface NewVsReturningRow {
  month: string;
  new_customer_orders: number;
  returning_customer_orders: number;
}

export interface RetentionSummary {
  returningCustomers: number;
  totalCustomersWithOrders: number;
  retentionRatePct: number;
}

export interface AverageCLV {
  avgLifetimeValueCents: number;
}

export interface ProductPerformanceRow {
  product_id: string;
  product_name: string;
  units_sold: number;
  revenue_cents: number;
  avg_rating: string;
  review_count: number;
}

export interface CategoryPerformanceRow {
  category_id: string;
  category_name: string;
  units_sold: number;
  revenue_cents: number;
  revenue_rank: number;
}

export interface RevenueGrowthRow {
  month: string;
  revenue_cents: number;
  prev_month_revenue_cents: number | null;
  growth_pct: number | null;
}
