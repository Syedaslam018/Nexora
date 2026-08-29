import { prisma } from "../config/db.js";
import { Prisma } from "@prisma/client";

/**
 * Every query here filters orders to `status NOT IN ('CANCELLED','PENDING')`
 * — cancelled orders never happened financially, and pending ones haven't
 * been paid/confirmed yet, so neither should count as revenue for any of
 * these reports. That's the same revenue definition used throughout
 * (Phase 9's dashboard, Phase 6/7's inventory-sold transitions).
 *
 * Two forms of the same filter are kept: `REVENUE_FILTER` (a plain string)
 * for queries built with `$queryRawUnsafe` — used only where a LIMIT/months
 * parameter needs to be interpolated into the SQL structure itself, not
 * just bound as a value — and `REVENUE_FILTER_FRAGMENT` (a `Prisma.sql`
 * fragment) for queries using the safer parameterized `$queryRaw` tagged
 * template. A `Prisma.sql` fragment is the correct way to compose
 * reusable SQL snippets into a tagged template; interpolating a live
 * `$queryRaw` call (which fires immediately and returns a Promise) into
 * another template would be a bug, not a fragment.
 *
 * See docs/sql-analytics.md for a walkthrough of each query — what it
 * computes, which window function or CTE technique it demonstrates, and
 * why it's written the way it is.
 */
const REVENUE_FILTER = `o.status NOT IN ('CANCELLED', 'PENDING')`;
const REVENUE_FILTER_FRAGMENT = Prisma.sql`o.status NOT IN ('CANCELLED', 'PENDING')`;

export const analyticsService = {
  /** RANK() over lifetime spend per customer, via a CTE. RANK (not
   * ROW_NUMBER) so tied spend amounts share a rank rather than being
   * arbitrarily separated. */
  async getTopCustomers(limit: number) {
    return prisma.$queryRawUnsafe<
      {
        user_id: string;
        first_name: string;
        last_name: string;
        email: string;
        order_count: bigint;
        lifetime_spend_cents: bigint;
        spend_rank: bigint;
      }[]
    >(
      `
      WITH customer_spend AS (
        SELECT
          u.id AS user_id, u.first_name, u.last_name, u.email,
          COUNT(o.id) AS order_count,
          SUM(o.total_cents) AS lifetime_spend_cents
        FROM users u
        JOIN orders o ON o.user_id = u.id AND ${REVENUE_FILTER}
        GROUP BY u.id
      )
      SELECT *, RANK() OVER (ORDER BY lifetime_spend_cents DESC) AS spend_rank
      FROM customer_spend
      ORDER BY lifetime_spend_cents DESC
      LIMIT $1
      `,
      limit,
    );
  },

  /** Monthly revenue plus a running cumulative total via SUM() OVER() —
   * the cumulative column is the window-function part; the monthly
   * figures themselves are a plain GROUP BY. */
  async getMonthlyRevenue(months: number) {
    return prisma.$queryRawUnsafe<
      { month: Date; order_count: bigint; revenue_cents: bigint; cumulative_revenue_cents: bigint }[]
    >(
      `
      WITH monthly AS (
        SELECT
          DATE_TRUNC('month', created_at) AS month,
          COUNT(*) AS order_count,
          SUM(total_cents) AS revenue_cents
        FROM orders o
        WHERE ${REVENUE_FILTER} AND created_at >= NOW() - ($1 || ' months')::interval
        GROUP BY month
      )
      SELECT *, SUM(revenue_cents) OVER (ORDER BY month) AS cumulative_revenue_cents
      FROM monthly
      ORDER BY month
      `,
      months,
    );
  },

  /** DENSE_RANK() by units sold — deliberately the other ranking function
   * from getTopCustomers's RANK(), so both are demonstrated: DENSE_RANK
   * leaves no gaps after a tie (1, 1, 2, ...) where RANK would (1, 1, 3, ...). */
  async getBestSellingProducts(limit: number) {
    return prisma.$queryRawUnsafe<
      { product_id: string; product_name: string; units_sold: bigint; revenue_cents: bigint; sales_rank: bigint }[]
    >(
      `
      WITH product_sales AS (
        SELECT
          p.id AS product_id, p.name AS product_name,
          SUM(oi.quantity) AS units_sold,
          SUM(oi.total_cents) AS revenue_cents
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id AND ${REVENUE_FILTER}
        JOIN products p ON p.id = oi.product_id
        GROUP BY p.id
      )
      SELECT *, DENSE_RANK() OVER (ORDER BY units_sold DESC) AS sales_rank
      FROM product_sales
      ORDER BY units_sold DESC
      LIMIT $1
      `,
      limit,
    );
  },

  async getAverageOrderValueByMonth(months: number) {
    return prisma.$queryRawUnsafe<
      { month: Date; order_count: bigint; avg_order_value_cents: number }[]
    >(
      `
      SELECT
        DATE_TRUNC('month', created_at) AS month,
        COUNT(*) AS order_count,
        ROUND(AVG(total_cents)) AS avg_order_value_cents
      FROM orders o
      WHERE ${REVENUE_FILTER} AND created_at >= NOW() - ($1 || ' months')::interval
      GROUP BY month
      ORDER BY month
      `,
      months,
    );
  },

  /**
   * ROW_NUMBER() PARTITION BY user_id — assigns each customer's orders a
   * sequence number (1 = their first order, 2 = their second, ...), then
   * groups by month counting sequence=1 (new customers that month)
   * against sequence>1 (repeat purchases that month). This is what
   * actually distinguishes "new" from "returning" per month, rather than
   * just counting total orders.
   */
  async getMonthlyNewVsReturning(months: number) {
    return prisma.$queryRawUnsafe<
      { month: Date; new_customer_orders: bigint; returning_customer_orders: bigint }[]
    >(
      `
      WITH sequenced_orders AS (
        SELECT
          o.created_at,
          ROW_NUMBER() OVER (PARTITION BY o.user_id ORDER BY o.created_at) AS order_seq
        FROM orders o
        WHERE ${REVENUE_FILTER}
      )
      SELECT
        DATE_TRUNC('month', created_at) AS month,
        COUNT(*) FILTER (WHERE order_seq = 1) AS new_customer_orders,
        COUNT(*) FILTER (WHERE order_seq > 1) AS returning_customer_orders
      FROM sequenced_orders
      WHERE created_at >= NOW() - ($1 || ' months')::interval
      GROUP BY month
      ORDER BY month
      `,
      months,
    );
  },

  /** Overall retention snapshot (not month-by-month) — what fraction of
   * everyone who's ever ordered has ordered more than once. */
  async getRetentionSummary() {
    const rows = await prisma.$queryRaw<
      { returning_customers: bigint; total_customers_with_orders: bigint }[]
    >`
      WITH customer_order_counts AS (
        SELECT user_id, COUNT(*) AS order_count
        FROM orders o
        WHERE ${REVENUE_FILTER_FRAGMENT}
        GROUP BY user_id
      )
      SELECT
        COUNT(*) FILTER (WHERE order_count > 1) AS returning_customers,
        COUNT(*) AS total_customers_with_orders
      FROM customer_order_counts
    `;
    const row = rows[0] ?? { returning_customers: 0n, total_customers_with_orders: 0n };
    const total = Number(row.total_customers_with_orders);
    const returning = Number(row.returning_customers);
    return {
      returningCustomers: returning,
      totalCustomersWithOrders: total,
      retentionRatePct: total > 0 ? Math.round((returning / total) * 1000) / 10 : 0,
    };
  },

  async getAverageCustomerLifetimeValue() {
    const rows = await prisma.$queryRaw<{ avg_clv_cents: number | null }[]>`
      SELECT AVG(lifetime_spend_cents) AS avg_clv_cents
      FROM (
        SELECT o.user_id, SUM(o.total_cents) AS lifetime_spend_cents
        FROM orders o
        WHERE ${REVENUE_FILTER_FRAGMENT}
        GROUP BY o.user_id
      ) per_customer
    `;
    return { avgLifetimeValueCents: Math.round(rows[0]?.avg_clv_cents ?? 0) };
  },

  /** Units sold, revenue, rating, and review count per product. The joins
   * to order_items/orders are LEFT JOINs with the status filter kept in
   * the ON clause (not WHERE) deliberately — putting it in WHERE would
   * silently turn this into an INNER JOIN and drop every product with no
   * qualifying sales at all, which is exactly the "0 units sold" products
   * a performance report needs to show. */
  async getProductPerformance(limit: number) {
    return prisma.$queryRawUnsafe<
      {
        product_id: string;
        product_name: string;
        units_sold: bigint;
        revenue_cents: bigint;
        avg_rating: string;
        review_count: number;
      }[]
    >(
      `
      SELECT
        p.id AS product_id, p.name AS product_name,
        COALESCE(SUM(oi.quantity), 0) AS units_sold,
        COALESCE(SUM(oi.total_cents), 0) AS revenue_cents,
        p.avg_rating::text AS avg_rating,
        p.review_count
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o ON o.id = oi.order_id AND ${REVENUE_FILTER}
      GROUP BY p.id
      ORDER BY revenue_cents DESC
      LIMIT $1
      `,
      limit,
    );
  },

  /** Same LEFT JOIN + ON-clause-filter reasoning as product performance,
   * plus RANK() so category standing is directly visible. */
  async getCategoryPerformance() {
    return prisma.$queryRaw<
      { category_id: string; category_name: string; units_sold: bigint; revenue_cents: bigint; revenue_rank: bigint }[]
    >`
      WITH category_sales AS (
        SELECT
          c.id AS category_id, c.name AS category_name,
          COALESCE(SUM(oi.quantity), 0) AS units_sold,
          COALESCE(SUM(oi.total_cents), 0) AS revenue_cents
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        LEFT JOIN order_items oi ON oi.product_id = p.id
        LEFT JOIN orders o ON o.id = oi.order_id AND ${REVENUE_FILTER_FRAGMENT}
        GROUP BY c.id
      )
      SELECT *, RANK() OVER (ORDER BY revenue_cents DESC) AS revenue_rank
      FROM category_sales
      ORDER BY revenue_cents DESC
    `;
  },

  /** LAG() to compare each month's revenue with the prior month — the
   * canonical LAG use case: "how does this row compare to the row before
   * it in the same ordered set," which a plain GROUP BY can't express
   * without a self-join. */
  async getRevenueGrowth(months: number) {
    return prisma.$queryRawUnsafe<
      { month: Date; revenue_cents: bigint; prev_month_revenue_cents: bigint | null; growth_pct: number | null }[]
    >(
      `
      WITH monthly AS (
        SELECT DATE_TRUNC('month', created_at) AS month, SUM(total_cents) AS revenue_cents
        FROM orders o
        WHERE ${REVENUE_FILTER} AND created_at >= NOW() - ($1 || ' months')::interval
        GROUP BY month
      )
      SELECT
        month,
        revenue_cents,
        LAG(revenue_cents) OVER (ORDER BY month) AS prev_month_revenue_cents,
        ROUND(
          (revenue_cents - LAG(revenue_cents) OVER (ORDER BY month))::numeric
          / NULLIF(LAG(revenue_cents) OVER (ORDER BY month), 0) * 100,
          1
        ) AS growth_pct
      FROM monthly
      ORDER BY month
      `,
      months,
    );
  },
};
