import { prisma } from "../config/db.js";
import { inventoryService } from "./inventory.service.js";

const REVENUE_STATUSES = ["CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "REFUNDED"];
const PENDING_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING"];

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export const dashboardService = {
  /**
   * Headline metrics for the dashboard's top row. Kept as straightforward
   * aggregate queries (COUNT/SUM/AVG, no window functions) — Phase 10's
   * SQL analytics module is where RANK/DENSE_RANK/LAG-based reporting
   * lives; this endpoint is about "what's true right now," not ranked
   * historical analysis.
   */
  async getMetrics() {
    const [totalRevenue, todayRevenue, monthRevenue, totalOrders, pendingOrders, totalCustomers, lowStock] =
      await Promise.all([
        prisma.order.aggregate({
          where: { status: { in: REVENUE_STATUSES } },
          _sum: { totalCents: true },
        }),
        prisma.order.aggregate({
          where: { status: { in: REVENUE_STATUSES }, createdAt: { gte: startOfToday() } },
          _sum: { totalCents: true },
        }),
        prisma.order.aggregate({
          where: { status: { in: REVENUE_STATUSES }, createdAt: { gte: startOfMonth() } },
          _sum: { totalCents: true },
        }),
        prisma.order.count({ where: { status: { in: REVENUE_STATUSES } } }),
        prisma.order.count({ where: { status: { in: PENDING_STATUSES } } }),
        prisma.user.count({ where: { role: "CUSTOMER" } }),
        inventoryService.listLowStock(),
      ]);

    const revenueCents = totalRevenue._sum.totalCents ?? 0;
    const avgOrderValueCents = totalOrders > 0 ? Math.round(revenueCents / totalOrders) : 0;

    // Approximation, not a real conversion rate: this build has no
    // page-view/session tracking, so "visitors" doesn't exist as data.
    // Used instead: the share of registered customers who have placed at
    // least one order. Explicitly documented as an approximation rather
    // than presented as a true visit-to-purchase conversion rate.
    const customersWithOrders = await prisma.user.count({
      where: { role: "CUSTOMER", orders: { some: { status: { in: REVENUE_STATUSES } } } },
    });
    const approxConversionRate = totalCustomers > 0 ? customersWithOrders / totalCustomers : 0;

    return {
      totalRevenueCents: revenueCents,
      todayRevenueCents: todayRevenue._sum.totalCents ?? 0,
      monthlyRevenueCents: monthRevenue._sum.totalCents ?? 0,
      totalOrders,
      pendingOrders,
      totalCustomers,
      averageOrderValueCents: avgOrderValueCents,
      approxConversionRate,
      lowStockCount: lowStock.length,
    };
  },

  async getRevenueOverTime(days: number) {
    return prisma.$queryRaw<{ date: string; revenue_cents: bigint }[]>`
      SELECT DATE(created_at) AS date, SUM(total_cents) AS revenue_cents
      FROM orders
      WHERE status IN ('CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','REFUNDED')
        AND created_at >= NOW() - (${days} || ' days')::interval
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
  },

  async getOrdersOverTime(days: number) {
    return prisma.$queryRaw<{ date: string; order_count: bigint }[]>`
      SELECT DATE(created_at) AS date, COUNT(*) AS order_count
      FROM orders
      WHERE created_at >= NOW() - (${days} || ' days')::interval
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
  },

  async getSalesByCategory() {
    return prisma.$queryRaw<
      { category_name: string; revenue_cents: bigint; units_sold: bigint }[]
    >`
      SELECT
        c.name AS category_name,
        SUM(oi.total_cents) AS revenue_cents,
        SUM(oi.quantity) AS units_sold
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      JOIN categories c ON c.id = p.category_id
      WHERE o.status IN ('CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','REFUNDED')
      GROUP BY c.name
      ORDER BY revenue_cents DESC
    `;
  },

  async getTopProducts(limit: number) {
    return prisma.$queryRaw<
      { product_id: string; product_name: string; revenue_cents: bigint; units_sold: bigint }[]
    >`
      SELECT
        p.id AS product_id,
        p.name AS product_name,
        SUM(oi.total_cents) AS revenue_cents,
        SUM(oi.quantity) AS units_sold
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      WHERE o.status IN ('CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','REFUNDED')
      GROUP BY p.id, p.name
      ORDER BY revenue_cents DESC
      LIMIT ${limit}
    `;
  },

  async getCustomerGrowth(days: number) {
    return prisma.$queryRaw<{ date: string; new_customers: bigint }[]>`
      SELECT DATE(created_at) AS date, COUNT(*) AS new_customers
      FROM users
      WHERE role = 'CUSTOMER' AND created_at >= NOW() - (${days} || ' days')::interval
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
  },

  async getOrderStatusDistribution() {
    const rows = await prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    });
    return rows.map((r) => ({ status: r.status, count: r._count.status }));
  },
};
