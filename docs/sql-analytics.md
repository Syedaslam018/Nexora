# SQL Analytics — query reference

Every query below lives in `backend/src/services/analytics.service.ts` and
is exposed under `/api/admin/analytics/*` (admin/staff only). This doc
walks through each one: what it computes, which SQL technique it
demonstrates, and why it's written the way it is — meant to be read
alongside the source when discussing these queries (e.g. in an interview).

**Shared convention**: every query filters to
`status NOT IN ('CANCELLED', 'PENDING')` — a cancelled order never
happened financially, and a pending one hasn't been paid/confirmed yet.
Neither should count as revenue. This is the same definition used by
Phase 9's dashboard and Phase 6/7's inventory-sold transitions, so a
number computed here always agrees with the equivalent number shown
elsewhere in the app.

---

## Top customers — `RANK()`, CTE

```sql
WITH customer_spend AS (
  SELECT u.id AS user_id, u.first_name, u.last_name, u.email,
         COUNT(o.id) AS order_count,
         SUM(o.total_cents) AS lifetime_spend_cents
  FROM users u
  JOIN orders o ON o.user_id = u.id AND o.status NOT IN ('CANCELLED','PENDING')
  GROUP BY u.id
)
SELECT *, RANK() OVER (ORDER BY lifetime_spend_cents DESC) AS spend_rank
FROM customer_spend
ORDER BY lifetime_spend_cents DESC
LIMIT $1
```

The CTE does the aggregation (spend + order count per customer); the outer
query ranks it. **`RANK()`**, not `ROW_NUMBER()`, so two customers with
identical lifetime spend share the same rank instead of being split
arbitrarily by row order.

## Monthly revenue — `SUM() OVER()`, running total

```sql
WITH monthly AS (
  SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*) AS order_count,
         SUM(total_cents) AS revenue_cents
  FROM orders o
  WHERE o.status NOT IN ('CANCELLED','PENDING')
    AND created_at >= NOW() - ($1 || ' months')::interval
  GROUP BY month
)
SELECT *, SUM(revenue_cents) OVER (ORDER BY month) AS cumulative_revenue_cents
FROM monthly
ORDER BY month
```

The monthly figures are a plain `GROUP BY`. The window function is the
`cumulative_revenue_cents` column — a running total across months without
a self-join or a second query.

## Best-selling products — `DENSE_RANK()`, CTE

```sql
WITH product_sales AS (
  SELECT p.id AS product_id, p.name AS product_name,
         SUM(oi.quantity) AS units_sold, SUM(oi.total_cents) AS revenue_cents
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id AND o.status NOT IN ('CANCELLED','PENDING')
  JOIN products p ON p.id = oi.product_id
  GROUP BY p.id
)
SELECT *, DENSE_RANK() OVER (ORDER BY units_sold DESC) AS sales_rank
FROM product_sales
ORDER BY units_sold DESC
LIMIT $1
```

Deliberately `DENSE_RANK()` here (vs. `RANK()` above) so both are
demonstrated: after a 3-way tie for 1st, `RANK()` gives (1, 1, 1, 4);
`DENSE_RANK()` gives (1, 1, 1, 2) — no gap.

## Average order value by month

```sql
SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*) AS order_count,
       ROUND(AVG(total_cents)) AS avg_order_value_cents
FROM orders o
WHERE o.status NOT IN ('CANCELLED','PENDING')
  AND created_at >= NOW() - ($1 || ' months')::interval
GROUP BY month
ORDER BY month
```

Plain aggregation — included for completeness against the spec's list, not
every query needs a window function to be a real answer to a real
business question.

## Monthly new vs. returning customers — `ROW_NUMBER() PARTITION BY`

```sql
WITH sequenced_orders AS (
  SELECT o.created_at,
         ROW_NUMBER() OVER (PARTITION BY o.user_id ORDER BY o.created_at) AS order_seq
  FROM orders o
  WHERE o.status NOT IN ('CANCELLED','PENDING')
)
SELECT DATE_TRUNC('month', created_at) AS month,
       COUNT(*) FILTER (WHERE order_seq = 1) AS new_customer_orders,
       COUNT(*) FILTER (WHERE order_seq > 1) AS returning_customer_orders
FROM sequenced_orders
WHERE created_at >= NOW() - ($1 || ' months')::interval
GROUP BY month
ORDER BY month
```

`ROW_NUMBER() PARTITION BY user_id` numbers each customer's own orders
(1st, 2nd, 3rd, ...) independently of everyone else's. Filtering on that
sequence number — 1 vs. >1 — is what actually distinguishes "first-time"
from "repeat" per month; counting total orders per month can't make that
distinction on its own.

## Retention summary

```sql
WITH customer_order_counts AS (
  SELECT user_id, COUNT(*) AS order_count
  FROM orders o
  WHERE o.status NOT IN ('CANCELLED','PENDING')
  GROUP BY user_id
)
SELECT COUNT(*) FILTER (WHERE order_count > 1) AS returning_customers,
       COUNT(*) AS total_customers_with_orders
FROM customer_order_counts
```

An overall snapshot (not month-by-month, unlike the query above): what
fraction of everyone who has ever ordered has ordered more than once.

## Average customer lifetime value

```sql
SELECT AVG(lifetime_spend_cents) AS avg_clv_cents
FROM (
  SELECT o.user_id, SUM(o.total_cents) AS lifetime_spend_cents
  FROM orders o
  WHERE o.status NOT IN ('CANCELLED','PENDING')
  GROUP BY o.user_id
) per_customer
```

A subquery (not a CTE, for variety) computing lifetime spend per customer,
then averaging across all of them.

## Product performance — `LEFT JOIN` with the filter kept in `ON`, not `WHERE`

```sql
SELECT p.id AS product_id, p.name AS product_name,
       COALESCE(SUM(oi.quantity), 0) AS units_sold,
       COALESCE(SUM(oi.total_cents), 0) AS revenue_cents,
       p.avg_rating, p.review_count
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id AND o.status NOT IN ('CANCELLED','PENDING')
GROUP BY p.id
ORDER BY revenue_cents DESC
LIMIT $1
```

The subtle-but-important detail: the status filter is in the `ON` clause
of the second `LEFT JOIN`, not in a `WHERE` clause. Putting it in `WHERE`
would silently turn this into an inner join — any product with zero
qualifying sales would be dropped from the result entirely, when a
performance report needs exactly those "0 units sold" products to show up
(with `COALESCE(..., 0)` making that explicit rather than `NULL`).

## Category performance — `RANK()` over a `LEFT JOIN` chain

```sql
WITH category_sales AS (
  SELECT c.id AS category_id, c.name AS category_name,
         COALESCE(SUM(oi.quantity), 0) AS units_sold,
         COALESCE(SUM(oi.total_cents), 0) AS revenue_cents
  FROM categories c
  LEFT JOIN products p ON p.category_id = c.id
  LEFT JOIN order_items oi ON oi.product_id = p.id
  LEFT JOIN orders o ON o.id = oi.order_id AND o.status NOT IN ('CANCELLED','PENDING')
  GROUP BY c.id
)
SELECT *, RANK() OVER (ORDER BY revenue_cents DESC) AS revenue_rank
FROM category_sales
ORDER BY revenue_cents DESC
```

Same ON-clause-filter reasoning as product performance, chained through
three joins (category → products → order_items → orders) so a category
with no sales at all still appears, ranked last.

## Revenue growth month-over-month — `LAG()`

```sql
WITH monthly AS (
  SELECT DATE_TRUNC('month', created_at) AS month, SUM(total_cents) AS revenue_cents
  FROM orders o
  WHERE o.status NOT IN ('CANCELLED','PENDING')
    AND created_at >= NOW() - ($1 || ' months')::interval
  GROUP BY month
)
SELECT month, revenue_cents,
       LAG(revenue_cents) OVER (ORDER BY month) AS prev_month_revenue_cents,
       ROUND(
         (revenue_cents - LAG(revenue_cents) OVER (ORDER BY month))::numeric
         / NULLIF(LAG(revenue_cents) OVER (ORDER BY month), 0) * 100,
         1
       ) AS growth_pct
FROM monthly
ORDER BY month
```

The canonical `LAG()` use case: "how does this row compare to the row
before it in the same ordered set" — expressing that with a plain
`GROUP BY` would need a self-join on `month - 1`. `NULLIF(..., 0)` guards
against a divide-by-zero if a prior month had exactly $0 in revenue.

---

## A note on `$queryRawUnsafe`

Queries that need a `LIMIT`/interval count to be part of the query
*structure* (not just a bound value) use `$queryRawUnsafe` with the SQL
built via a JS template literal, but the actual `limit`/`months` value is
still passed as a separate bound parameter (`$1`) — never string-concatenated
into the SQL text itself. The only string interpolation happening is the
constant `REVENUE_FILTER` clause, which is fixed application code, never
user input. Queries that don't need that flexibility use the fully
parameterized `prisma.$queryRaw` tagged-template form instead, which is
preferred wherever it's sufficient.
