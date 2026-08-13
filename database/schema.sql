-- NEXORA reference DDL
--
-- The source of truth for the schema is backend/prisma/schema.prisma —
-- running `npx prisma migrate dev --name init` against a live Postgres
-- instance generates the real, complete migration SQL from it.
--
-- This file exists for two reasons:
--   1. It's reviewable without running anything (useful for interviews /
--      code review — you can read the actual constraints directly).
--   2. It documents things Prisma's schema language can't express natively:
--      CHECK constraints and the full-text search tsvector + GIN index.
--      These are added as a follow-up raw-SQL migration
--      (`prisma/migrations/<timestamp>_add_constraints_and_search/migration.sql`)
--      once Phase 4 (catalog) lands, using `npx prisma migrate dev
--      --create-only` so Prisma's own migration never overwrites them.

-- ── CHECK constraints Prisma can't express ─────────────────────────────

ALTER TABLE reviews
  ADD CONSTRAINT reviews_rating_range CHECK (rating BETWEEN 1 AND 5);

ALTER TABLE products
  ADD CONSTRAINT products_price_positive CHECK (base_price_cents >= 0),
  ADD CONSTRAINT products_compare_price_gte_base
    CHECK (compare_at_price_cents IS NULL OR compare_at_price_cents >= base_price_cents);

ALTER TABLE product_variants
  ADD CONSTRAINT variants_price_positive CHECK (price_cents IS NULL OR price_cents >= 0);

ALTER TABLE inventory
  ADD CONSTRAINT inventory_available_nonneg CHECK (available_qty >= 0),
  ADD CONSTRAINT inventory_reserved_nonneg CHECK (reserved_qty >= 0),
  ADD CONSTRAINT inventory_sold_nonneg CHECK (sold_qty >= 0);

ALTER TABLE cart_items
  ADD CONSTRAINT cart_items_qty_positive CHECK (quantity > 0);

ALTER TABLE order_items
  ADD CONSTRAINT order_items_qty_positive CHECK (quantity > 0),
  ADD CONSTRAINT order_items_price_nonneg CHECK (unit_price_cents >= 0);

ALTER TABLE orders
  ADD CONSTRAINT orders_totals_nonneg CHECK (
    subtotal_cents >= 0 AND discount_cents >= 0 AND tax_cents >= 0
    AND shipping_cents >= 0 AND total_cents >= 0
  );

ALTER TABLE coupons
  ADD CONSTRAINT coupons_percentage_range CHECK (
    type != 'PERCENTAGE' OR (value >= 0 AND value <= 100)
  ),
  ADD CONSTRAINT coupons_date_order CHECK (expires_at > starts_at);

-- ── Full-text search on products ────────────────────────────────────────
-- A generated column keeps the tsvector automatically in sync with name +
-- description on every INSERT/UPDATE, so the application never has to
-- remember to update it manually. Weighting name ('A') higher than
-- description ('B') means name matches rank above description-only matches.

ALTER TABLE products
  ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED;

CREATE INDEX products_search_vector_idx ON products USING GIN (search_vector);

-- Query pattern (Phase 4 uses this via Prisma's $queryRaw):
--   SELECT *, ts_rank(search_vector, query) AS rank
--   FROM products, plainto_tsquery('english', $1) query
--   WHERE search_vector @@ query AND is_active AND NOT is_archived
--   ORDER BY rank DESC;

-- ── Additional composite indexes for hot query paths ────────────────────
-- (Single-column indexes on FKs are created automatically by Prisma; these
-- are the multi-column ones for specific query patterns used later.)

-- Product listing filtered by category + sorted by price (Phase 4)
CREATE INDEX products_category_price_idx ON products (category_id, base_price_cents)
  WHERE is_active AND NOT is_archived;

-- Order history for a user, most recent first (Phase 6/7)
CREATE INDEX orders_user_created_idx ON orders (user_id, created_at DESC);

-- Admin order queue filtered by status, most recent first (Phase 13)
CREATE INDEX orders_status_created_idx ON orders (status, created_at DESC);

-- Revenue analytics group by month (Phase 10) — partial index on paid orders only
CREATE INDEX orders_analytics_idx ON orders (created_at)
  WHERE status NOT IN ('CANCELLED', 'PENDING');

-- SKU lookup during checkout stock validation (Phase 6/7)
CREATE UNIQUE INDEX product_variants_sku_idx ON product_variants (sku);
