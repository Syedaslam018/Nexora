import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { MetricCard } from "@/features/admin/MetricCard";
import { Trophy, Users, TrendingUp, Repeat } from "lucide-react";
import {
  useTopCustomers,
  useMonthlyRevenue,
  useBestSellingProducts,
  useAverageOrderValueByMonth,
  useMonthlyNewVsReturning,
  useRetentionSummary,
  useAverageCLV,
  useProductPerformance,
  useCategoryPerformance,
  useRevenueGrowth,
} from "@/features/admin/useAnalytics";
import { formatCents, cn } from "@/lib/utils";

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border p-4">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

function monthLabel(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

function TableCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border">
      <h3 className="border-b border-border px-4 py-3 text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function AdminAnalyticsPage() {
  const { data: topCustomers, isLoading: loadingCustomers } = useTopCustomers(10);
  const { data: monthlyRevenue } = useMonthlyRevenue(12);
  const { data: bestSelling, isLoading: loadingBestSelling } = useBestSellingProducts(10);
  const { data: aov } = useAverageOrderValueByMonth(12);
  const { data: newVsReturning } = useMonthlyNewVsReturning(12);
  const { data: retention } = useRetentionSummary();
  const { data: clv } = useAverageCLV();
  const { data: productPerf, isLoading: loadingProductPerf } = useProductPerformance(15);
  const { data: categoryPerf, isLoading: loadingCategoryPerf } = useCategoryPerformance();
  const { data: revenueGrowth } = useRevenueGrowth(12);

  const revenueChartData = monthlyRevenue?.map((r) => ({
    month: monthLabel(r.month),
    revenue: r.revenue_cents / 100,
    cumulative: r.cumulative_revenue_cents / 100,
  }));

  const aovChartData = aov?.map((r) => ({ month: monthLabel(r.month), aov: r.avg_order_value_cents / 100 }));

  const newVsReturningData = newVsReturning?.map((r) => ({
    month: monthLabel(r.month),
    new: r.new_customer_orders,
    returning: r.returning_customer_orders,
  }));

  return (
    <main className="container py-8">
      <h1 className="mb-2 font-display text-2xl font-semibold">Analytics</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        SQL-backed reports — see{" "}
        <code className="font-mono-data text-xs">docs/sql-analytics.md</code> for the underlying queries.
      </p>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard
          label="Returning customers"
          value={retention ? `${retention.retentionRatePct}%` : "—"}
          icon={Repeat}
        />
        <MetricCard
          label="Avg. lifetime value"
          value={clv ? formatCents(clv.avgLifetimeValueCents) : "—"}
          icon={TrendingUp}
        />
        <MetricCard
          label="Customers with orders"
          value={retention ? String(retention.totalCustomersWithOrders) : "—"}
          icon={Users}
        />
        <MetricCard
          label="Top customer spend"
          value={topCustomers?.[0] ? formatCents(topCustomers[0].lifetime_spend_cents) : "—"}
          icon={Trophy}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Monthly revenue (+ cumulative)">
          <LineChart data={revenueChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" fontSize={11} />
            <YAxis fontSize={11} />
            <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3B6EF6" name="Monthly" strokeWidth={2} />
            <Line type="monotone" dataKey="cumulative" stroke="#22D3C7" name="Cumulative" strokeWidth={2} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Average order value by month">
          <LineChart data={aovChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" fontSize={11} />
            <YAxis fontSize={11} />
            <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
            <Line type="monotone" dataKey="aov" stroke="#F5A524" strokeWidth={2} />
          </LineChart>
        </ChartCard>

        <ChartCard title="New vs. returning customer orders">
          <BarChart data={newVsReturningData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" fontSize={11} />
            <YAxis fontSize={11} />
            <Tooltip />
            <Legend />
            <Bar dataKey="new" stackId="a" fill="#3B6EF6" name="New" />
            <Bar dataKey="returning" stackId="a" fill="#22D3C7" name="Returning" />
          </BarChart>
        </ChartCard>

        <div className="rounded-md border border-border p-4">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">Revenue growth month-over-month</h3>
          <div className="flex flex-col gap-1.5 text-sm">
            {revenueGrowth?.map((r) => (
              <div key={r.month} className="flex items-center justify-between">
                <span className="text-muted-foreground">{monthLabel(r.month)}</span>
                <span className="font-mono-data">{formatCents(r.revenue_cents)}</span>
                {r.growth_pct !== null && (
                  <span
                    className={cn(
                      "font-mono-data text-xs",
                      r.growth_pct >= 0 ? "text-accent-foreground" : "text-destructive",
                    )}
                  >
                    {r.growth_pct >= 0 ? "+" : ""}
                    {r.growth_pct}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TableCard title="Top customers (ranked by lifetime spend)">
          {loadingCustomers ? (
            <div className="p-4 text-sm text-muted-foreground">Loading…</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2 text-right">Orders</th>
                  <th className="px-4 py-2 text-right">Lifetime spend</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers?.map((c) => (
                  <tr key={c.user_id} className="border-t border-border">
                    <td className="px-4 py-2 font-mono-data text-muted-foreground">{c.spend_rank}</td>
                    <td className="px-4 py-2">
                      {c.first_name} {c.last_name}
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </td>
                    <td className="px-4 py-2 text-right font-mono-data">{c.order_count}</td>
                    <td className="px-4 py-2 text-right font-mono-data">{formatCents(c.lifetime_spend_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TableCard>

        <TableCard title="Best-selling products (by units sold)">
          {loadingBestSelling ? (
            <div className="p-4 text-sm text-muted-foreground">Loading…</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Product</th>
                  <th className="px-4 py-2 text-right">Units sold</th>
                  <th className="px-4 py-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {bestSelling?.map((p) => (
                  <tr key={p.product_id} className="border-t border-border">
                    <td className="px-4 py-2 font-mono-data text-muted-foreground">{p.sales_rank}</td>
                    <td className="px-4 py-2">{p.product_name}</td>
                    <td className="px-4 py-2 text-right font-mono-data">{p.units_sold}</td>
                    <td className="px-4 py-2 text-right font-mono-data">{formatCents(p.revenue_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TableCard>

        <TableCard title="Category performance (ranked by revenue)">
          {loadingCategoryPerf ? (
            <div className="p-4 text-sm text-muted-foreground">Loading…</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2 text-right">Units sold</th>
                  <th className="px-4 py-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {categoryPerf?.map((c) => (
                  <tr key={c.category_id} className="border-t border-border">
                    <td className="px-4 py-2 font-mono-data text-muted-foreground">{c.revenue_rank}</td>
                    <td className="px-4 py-2">{c.category_name}</td>
                    <td className="px-4 py-2 text-right font-mono-data">{c.units_sold}</td>
                    <td className="px-4 py-2 text-right font-mono-data">{formatCents(c.revenue_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TableCard>

        <TableCard title="Product performance">
          {loadingProductPerf ? (
            <div className="p-4 text-sm text-muted-foreground">Loading…</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Product</th>
                  <th className="px-4 py-2 text-right">Units</th>
                  <th className="px-4 py-2 text-right">Revenue</th>
                  <th className="px-4 py-2 text-right">Rating</th>
                </tr>
              </thead>
              <tbody>
                {productPerf?.map((p) => (
                  <tr key={p.product_id} className="border-t border-border">
                    <td className="px-4 py-2">{p.product_name}</td>
                    <td className="px-4 py-2 text-right font-mono-data">{p.units_sold}</td>
                    <td className="px-4 py-2 text-right font-mono-data">{formatCents(p.revenue_cents)}</td>
                    <td className="px-4 py-2 text-right font-mono-data">
                      {Number(p.avg_rating).toFixed(1)} ({p.review_count})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TableCard>
      </div>
    </main>
  );
}
