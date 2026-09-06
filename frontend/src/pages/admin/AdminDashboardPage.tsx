import {
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { MetricCard } from "@/features/admin/MetricCard";
import {
  useDashboardMetrics,
  useRevenueOverTime,
  useOrdersOverTime,
  useSalesByCategory,
  useTopProducts,
  useCustomerGrowth,
  useOrderStatusDistribution,
} from "@/features/admin/useDashboard";
import { formatCents } from "@/lib/utils";

const CHART_COLORS = ["#C95F3B", "#99A63C", "#E9A332", "#7B7063", "#241914"];

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/75 p-5 shadow-soft">
      <h3 className="mb-4 font-display text-base font-semibold">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}

export function AdminDashboardPage() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: revenue } = useRevenueOverTime(30);
  const { data: orders } = useOrdersOverTime(30);
  const { data: categorySales } = useSalesByCategory();
  const { data: topProducts } = useTopProducts(5);
  const { data: customerGrowth } = useCustomerGrowth(30);
  const { data: statusDistribution } = useOrderStatusDistribution();

  return (
    <main className="container py-10 sm:py-12">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
        Good morning, team
      </p>
      <h1 className="mb-2 font-display text-4xl font-bold tracking-[-0.06em]">
        Overview
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        A pulse check on your store, inventory, and customers.
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <MetricCard
          label="Total Revenue"
          value={formatCents(metrics?.totalRevenueCents ?? 0)}
          icon={DollarSign}
          isLoading={metricsLoading}
        />
        <MetricCard
          label="Today's Revenue"
          value={formatCents(metrics?.todayRevenueCents ?? 0)}
          icon={DollarSign}
          isLoading={metricsLoading}
        />
        <MetricCard
          label="Monthly Revenue"
          value={formatCents(metrics?.monthlyRevenueCents ?? 0)}
          icon={TrendingUp}
          isLoading={metricsLoading}
        />
        <MetricCard
          label="Avg. Order Value"
          value={formatCents(metrics?.averageOrderValueCents ?? 0)}
          icon={DollarSign}
          isLoading={metricsLoading}
        />
        <MetricCard
          label="Total Orders"
          value={String(metrics?.totalOrders ?? 0)}
          icon={ShoppingCart}
          isLoading={metricsLoading}
        />
        <MetricCard
          label="Pending Orders"
          value={String(metrics?.pendingOrders ?? 0)}
          icon={Clock}
          isLoading={metricsLoading}
        />
        <MetricCard
          label="Total Customers"
          value={String(metrics?.totalCustomers ?? 0)}
          icon={Users}
          isLoading={metricsLoading}
        />
        <MetricCard
          label="Low Stock Items"
          value={String(metrics?.lowStockCount ?? 0)}
          icon={AlertTriangle}
          isLoading={metricsLoading}
        />
      </div>
      {metrics && (
        <p className="mt-2 text-xs text-muted-foreground">
          Approx. conversion (customers with ≥1 order ÷ total customers):{" "}
          {(metrics.approxConversionRate * 100).toFixed(1)}% — this build has no
          visit/session tracking, so this is a proxy, not a true
          visitor-to-purchase rate.
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Revenue — last 30 days">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenue}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `$${v / 100}`}
              />
              <Tooltip formatter={(v: number) => formatCents(v)} />
              <Line
                type="monotone"
                dataKey="revenueCents"
                stroke={CHART_COLORS[0]}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Orders — last 30 days">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={orders}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="orderCount"
                stroke={CHART_COLORS[1]}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Sales by category">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categorySales} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                type="number"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `$${v / 100}`}
              />
              <YAxis
                type="category"
                dataKey="categoryName"
                tick={{ fontSize: 10 }}
                width={90}
              />
              <Tooltip formatter={(v: number) => formatCents(v)} />
              <Bar
                dataKey="revenueCents"
                fill={CHART_COLORS[0]}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top products by revenue">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                type="number"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `$${v / 100}`}
              />
              <YAxis
                type="category"
                dataKey="productName"
                tick={{ fontSize: 10 }}
                width={110}
              />
              <Tooltip formatter={(v: number) => formatCents(v)} />
              <Bar
                dataKey="revenueCents"
                fill={CHART_COLORS[1]}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Customer growth — last 30 days">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={customerGrowth}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="newCustomers"
                stroke={CHART_COLORS[2]}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Order status distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusDistribution}
                dataKey="count"
                nameKey="status"
                outerRadius={90}
                label
              >
                {(statusDistribution ?? []).map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </main>
  );
}
