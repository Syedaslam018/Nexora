# Build Progress Log

Tracks what's been implemented, phase by phase. Each phase is only marked done
once its files exist and are internally consistent with prior phases.

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Project setup & architecture (monorepo, configs, tooling) | ✅ Done |
| 2 | Database schema & migrations (Prisma schema, ER diagram, SQL docs) | ✅ Done |
| 3 | Authentication & authorization | ✅ Done |
| 4 | Product / catalog system | ✅ Done |
| 5 | Cart & wishlist | ✅ Done |
| 6 | Checkout & payments (Stripe) | ✅ Done |
| 7 | Orders & inventory | ✅ Done |
| 8 | Reviews & coupons | ✅ Done |
| 9 | Admin dashboard | ✅ Done |
| 10 | SQL analytics | ✅ Done |
| 11 | Real-time features (Socket.IO) | ✅ Done |
| 12 | Testing | ✅ Done |
| 13 | Docker & CI/CD | ✅ Done |
| 14 | Performance optimization | ✅ Done |
| 15 | Final UI polish & documentation | ⏳ Next |

## Important note on verification

This environment has no network access and no running PostgreSQL/Redis/Docker
daemon, so `npm install`, `prisma migrate dev`, `docker compose up`, and test
runs cannot be executed here. Every file is hand-verified for internal
consistency (matching types, matching field names across schema/services/
routes, valid syntax) as it's written, but the actual `npm install && docker
compose up` + `npm test` pass described in the original spec needs to happen
on your machine. Run the commands in each phase's "Verify locally" note and
report back anything that breaks — fixes will target root cause, not
workarounds.

## Phase 1 notes — Project setup & architecture

- Monorepo: `backend/` (Express API) and `frontend/` (Vite React app), kept
  independent (separate `package.json`, separate `node_modules`) so each can
  be deployed separately.
- Backend layering: `routes/` (HTTP wiring only) → `controllers/` (request/
  response shaping) → `services/` (business logic — the only place pricing/
  discount/inventory decisions are made) → `repositories/` (Prisma queries).
  This keeps business logic out of Express handlers and out of React
  components, per the spec's engineering rules.
- Frontend: feature-folder architecture (`features/<domain>/`) rather than
  type-based folders, so cart/checkout/admin/etc. each own their components,
  hooks, and API calls.
- Strict TypeScript (`strict: true`) on both sides.

## Phase 2 notes — Database schema

- Full Prisma schema at `backend/prisma/schema.prisma` covering every table
  in the spec's suggested list, normalized to 3NF, with explicit indexes,
  composite unique constraints, check-constraint equivalents (via Postgres
  native constraints added in a follow-up SQL migration since Prisma doesn't
  yet support arbitrary CHECK constraints natively), and cascade rules chosen
  per relationship (e.g. deleting a product's images cascades; deleting a
  category that still has products is restricted).
- Money is stored as `Int` cents (never `Float`) to avoid floating-point
  rounding bugs in totals — a deliberate choice worth calling out in an
  interview.
- `inventory` and `inventory_transactions` are separate: `inventory` holds
  current counters (available/reserved/sold), `inventory_transactions` is an
  append-only audit log of every change, which is what makes stock
  reservation/release safe under concurrent checkouts (Phase 7).
- Since there's no live database here, actual `*_migration.sql` files (which
  Prisma generates by diffing against a running Postgres instance) can't be
  generated in this environment. Instead `database/schema.sql` contains the
  equivalent hand-written DDL as a fallback so the schema is reviewable
  without running anything, and Phase 3 will include instructions to run
  `npx prisma migrate dev --name init` locally to generate the real migration
  once you have Postgres up via Docker Compose.
- **Correction made in Phase 4**: the initial schema left DB columns as bare
  camelCase while `database/schema.sql`'s hand-written DDL assumed
  snake_case — a real inconsistency. Every multi-word field in
  `schema.prisma` now has an explicit `@map("snake_case")`, so Prisma
  Client's TS API stays camelCase while the actual Postgres columns are
  snake_case, matching `database/schema.sql` and making the raw SQL in
  Phase 4's search/filtering and Phase 10's analytics queries correct
  without identifier-quoting gymnastics.

## Phase 3 notes — Authentication & authorization

- **Password hashing**: Argon2id (OWASP's current recommendation) via the
  `argon2` package, not bcrypt — no 72-byte truncation quirk, better
  resistance to GPU/ASIC cracking.
- **Token strategy**: short-lived JWT access token (15m default) carried in
  the `Authorization: Bearer` header and kept in memory only on the frontend
  (Zustand store, never localStorage — see `frontend/src/store/authStore.ts`
  for why); a separate, longer-lived opaque refresh token in an **HTTP-only,
  signed, `SameSite=Lax`** cookie scoped to `/api/auth`. The access token is
  never persisted to disk on the client, so an XSS payload that runs on the
  page still can't read it out of storage — it can only ride along on
  requests made while it's in memory.
- **Refresh tokens are backed by a `Session` row**, not just a signed JWT —
  the JWT only carries the session id. This is what makes server-side
  revocation possible (logout, "logout all devices", password change, and
  disabling an account all revoke sessions) — a bare JWT can't be invalidated
  before its own expiry.
- **Refresh rotation**: every `/auth/refresh` call revokes the presented
  refresh token and issues a brand new pair. If a stolen refresh token is
  ever replayed after the real user has already rotated past it, the replay
  fails loudly (session already revoked) instead of silently working forever.
- **Password reset / email verification** use random opaque tokens (not
  JWTs) — the emailed link is the only copy of the secret, and only its
  SHA-256 hash is stored, the same principle as a password.
- **RBAC**: `authenticate` middleware populates `req.user`; `authorize(...roles)`
  gates specific routes. Enforced only on the backend — the frontend's
  `ProtectedRoute` component is a UX convenience, explicitly documented in
  its own comment as not being the actual security boundary.
- **Email**: `EMAIL_PROVIDER=mock` (the `.env.example` default) logs emails
  instead of sending them, so registration/verification/reset are fully
  testable locally with zero email credentials — the verification/reset
  links show up directly in the server log.
- **Frontend**: Axios response interceptor collapses concurrent 401s into a
  single `/auth/refresh` call and replays queued requests; `RootLayout` runs
  a silent refresh on mount so a hard page reload restores the session from
  the refresh cookie without the access token ever having touched disk.
- **Verification still needed once you have deps installed**: `npm install`
  in both `backend/` and `frontend/`, then `npx prisma generate` in
  `backend/` (the `@prisma/client` types that `auth.service.ts` and others
  import don't exist until that runs), then `npx tsc --noEmit` in both — I
  could not run any of these here (see the environment note above).
- **Deferred to Phase 12 (Testing) on purpose**: no test files were added in
  this phase, matching the original spec's own phase breakdown, which lists
  testing as a separate, later phase rather than something bolted onto every
  feature phase.

## Phase 4 notes — Product / catalog system

- **Listing query is raw SQL** (`backend/src/repositories/product.repository.ts`),
  not Prisma's query builder — it needs a `LATERAL` join (first product
  image only), an aggregation subquery (units sold, for "best selling"
  sort), and full-text ranking (`ts_rank` against the `search_vector`
  generated column from `database/schema.sql`), none of which the query
  builder expresses directly. WHERE conditions are built once as an array
  and shared between the data query and its COUNT query so they can't drift
  apart — a real bug source when those are maintained separately by hand.
- **Everything else** (product detail, related products, category tree,
  brand list, admin CRUD) uses plain Prisma — raw SQL is reserved for where
  it earns its complexity, not used everywhere for its own sake.
- **RBAC on writes**: `POST/PATCH/DELETE /api/products` (and categories/
  brands) require `authenticate` + `authorize("ADMIN", "STAFF")`. The admin
  *UI* for managing products lands in Phase 9 — these endpoints exist now
  because Phase 4's own raw SQL needs real product rows to query against,
  and the eventual seed script (Section 29) will call through this same
  service layer rather than writing to Prisma directly.
- **Frontend**: filters live in the URL (`useSearchParams`), not component
  state, so a filtered/sorted listing is shareable and survives back/forward
  navigation — per Section 3's "URL-based filters" requirement. Search input
  is debounced (350ms) before it touches the URL/query.
- **Recently viewed** is deliberately client-side (`localStorage`), not a DB
  table — it's browsing history, not account data, and doesn't need to sync
  across devices the way cart/wishlist do (Section 3 only requires cart to
  persist server-side for authenticated users; recently-viewed isn't listed
  alongside it).
- **Home page** (Section 3) is built from real endpoints only: hero,
  category cards, "New Arrivals" (`sort=newest`), "Best Sellers"
  (`sort=best_selling`). Flash-sale, testimonials, and newsletter capture
  are intentionally NOT included yet — they need data this schema doesn't
  model (a sale end-time concept, a testimonials source, a subscribers
  table), and faking them with placeholder content would violate the "don't
  replace real functionality with mock data" rule. They'll land once
  there's a real feature behind them, likely alongside Phase 15 polish.
- **Cart/wishlist/Add-to-Cart buttons on the PDP are present but disabled**
  (show a toast) — real behavior lands in Phase 5. Built this way rather
  than omitted so the PDP layout doesn't have to be revisited.
- **Verification still needed**: same as every phase — `npm install`,
  `npx prisma generate`, `npx tsc --noEmit` in both `backend/` and
  `frontend/`. The full-text search feature additionally requires the
  `search_vector` column + GIN index from `database/schema.sql` to actually
  be applied to the database (see that file's header comment for how).

## Phase 5 notes — Cart & wishlist

- **`pricing.service.ts` is now the single source of truth for money math**
  (subtotal/discount/tax/shipping/total) — cart display calls it today, and
  Phase 6 checkout will call the exact same function with the exact same
  inputs to create the order, so the price a customer sees in their cart is
  guaranteed to be the price they're charged. The frontend never computes or
  sends a price/discount amount that gets trusted server-side.
- **Tax and shipping are explicit placeholder flat rates**
  (`backend/src/config/commerce.ts`, 8% tax / $5.99 flat / free over $75) —
  the spec doesn't define real tax jurisdictions or carrier rate lookups, so
  rather than fabricate something that looks real but isn't, this is
  documented as a placeholder swappable for a real tax/shipping API later
  without touching anything that calls `computePricing`.
- **Coupons validate structurally in `coupon.service.ts`** (active window,
  total/per-user usage limits, minimum order value) and their **discount
  math lives in `pricing.service.ts`**, which also handles product/category
  restrictions (a coupon scoped to specific products only discounts the
  eligible line items, not the whole cart) and the max-discount cap.
- **Guest cart is client-only** (`frontend/src/store/guestCartStore.ts`,
  Zustand + localStorage) and deliberately does NOT compute tax/shipping/
  coupon totals — those are backend business rules a guest's browser has no
  business re-implementing. The guest cart page shows a subtotal only, with
  a prompt to log in; full pricing appears once merged into the real cart.
  `mergeGuestCartIfAny` runs right after a successful login/register,
  summing quantities into the DB cart and capping at live stock.
- **Wishlist requires an account** (Section 9 calls for "persistent database
  storage"; there's no guest-wishlist requirement in the spec, unlike cart).
  Move-to-cart is one user action that performs two writes (add to cart,
  remove from wishlist) — implemented as one service method so they can't
  happen out of sync.
- **Stock validation** happens on every add/update against
  `Inventory.availableQty` — this is a display-time check only, not a
  reservation; actual reservation (so two shoppers can't both "successfully"
  buy the last unit) is Phase 7's inventory-transaction work at checkout
  time. Cart-time checks prevent obviously-wrong adds but aren't the final
  word on stock.
- **Schema change**: added `Cart.couponId`/`coupon` relation (wasn't in the
  original Phase 2 schema — a cart needs somewhere to hold an applied
  coupon before an order exists).
- **Verification still needed**: same as every phase — `npm install`,
  `npx prisma generate`, `npx tsc --noEmit` in both `backend/` and
  `frontend/`. Cart/wishlist correctness additionally depends on Phase 3's
  auth and Phase 4's product/inventory data actually existing in the DB.

## Phase 6 notes — Checkout & payments (Stripe)

- **Order creation re-validates everything server-side** — address ownership,
  stock (against live `Inventory`, not the cart's last-fetched snapshot),
  and coupon validity (usage limits/dates could have changed since the
  coupon was applied to the cart) — before computing the authoritative price
  via the same `pricing.service.ts` used by the cart. The frontend sends
  ids and choices (address, delivery method, payment method), never a price.
- **Race-safe stock decrement**: the transaction uses
  `inventory.updateMany({ where: { variantId, availableQty: { gte: qty } },
  ... })` rather than a plain `update` — this makes "decrement only if
  enough stock remains" atomic at the database level, closing the race
  window between the pre-transaction stock check and the actual write. Two
  concurrent checkouts for the last unit can't both succeed.
- **Inventory movement differs by payment method**, using the
  `InventoryTxnType` enum from Phase 2's schema: COD decrements
  `availableQty` and increments `soldQty` immediately (`STOCK_SOLD`) since
  there's no payment gateway step; Stripe decrements `availableQty` and
  increments `reservedQty` (`STOCK_RESERVED`) at order creation, then the
  webhook handler either finalizes it to `soldQty` (`STOCK_SOLD`, on
  `payment_intent.succeeded`) or releases it back to `availableQty`
  (`STOCK_RELEASED`, on `payment_intent.payment_failed`). Both webhook
  handlers are idempotent — Stripe retries webhooks, and a duplicate delivery
  must not double-decrement or double-release.
- **Stripe is the sole source of truth for payment outcome.** The frontend
  never tells the backend "payment succeeded" — `StripePaymentForm` calling
  `stripe.confirmPayment` only tells the *customer's browser* the card was
  accepted; the order only moves from PENDING to CONFIRMED once the
  signature-verified webhook arrives. `OrderConfirmationPage` polls the
  order every 2s while it's still PENDING to reflect that asynchronous
  confirmation instead of assuming success client-side.
- **Webhook route is mounted directly in `app.ts`, ahead of the global
  `express.json()` parser**, with its own `express.raw()` middleware —
  Stripe signature verification needs the exact raw request bytes, which a
  JSON-parsed body can't provide.
- **Deliberate scope decisions**:
  - No separate `POST /api/payments/create-intent` endpoint as sketched in
    the spec's API list — the PaymentIntent is created as part of order
    creation instead, so the order (not a bare intent) is always the atomic
    record of "a checkout was attempted." The spec's endpoint list is
    explicitly an "Example," not a strict contract.
  - Cart is cleared immediately once an order exists (COD) or once a
    PaymentIntent is successfully created (Stripe) — not held in reserve for
    a "resume checkout" flow if Stripe payment later fails. A failed Stripe
    payment cancels the order and releases stock; the customer would need
    to re-add items and check out again. Documented here as a known
    simplification, not an oversight.
  - `GET /api/orders/:id` is the only read endpoint this phase adds — order
    history/listing, cancel, refund, invoice download, and reorder are
    explicitly Phase 7 per the spec's own phase breakdown.
- **Risk flagged, not resolved**: `backend/src/config/stripe.ts` pins
  `apiVersion: "2024-06-20"` as a literal string. The `stripe` npm package
  types that literal against the installed SDK version, and I can't verify
  the two agree without `npm install` in this environment — check this
  first if `tsc` complains about `config/stripe.ts`.
- **Verification still needed**: same as every phase, plus this one
  specifically needs real Stripe test-mode keys in both `backend/.env`
  (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) and `frontend/.env`
  (`VITE_STRIPE_PUBLISHABLE_KEY`), and the Stripe CLI (`stripe listen
  --forward-to localhost:4000/api/payments/webhook`) to receive webhooks
  locally, since Stripe can't reach `localhost` directly.

## Phase 7 notes — Orders & inventory

- **Cancel vs. refund are deliberately different operations**, not the same
  action at different times: `cancelOrder` is pre-shipment
  (PENDING/CONFIRMED/PROCESSING) and DOES restock inventory — nothing has
  physically left the warehouse. `requestRefund` is post-delivery only and
  does NOT restock — the item already shipped, and auto-restocking a
  physical return without inspection isn't modeled here (a real return-merch-
  authorization flow is out of scope for this build). If a cancelled order's
  payment had already succeeded, cancellation refunds it through Stripe and
  the order lands in `REFUNDED` rather than `CANCELLED`, so "money came
  back" is visible in the status itself rather than requiring you to cross-
  reference the payment row.
- **Which pool inventory releases from depends on order state at
  cancellation time**: a Stripe order still `PENDING` releases from
  `reservedQty` (payment never succeeded, so `sold` was never touched); a
  COD order or an already-`CONFIRMED` Stripe order releases from `soldQty`
  (COD sells immediately at creation; Stripe finalizes reserved→sold via the
  Phase 6 webhook). Getting this branch wrong would silently corrupt
  inventory counts, so it's worth calling out explicitly here.
- **Reorder always re-prices at today's rate** — it calls the same
  `cartService.addItem` used everywhere else, never the order's historical
  `unitPriceCents` snapshot. Items that are discontinued, archived, or
  under-stocked are reported back as skipped rather than silently dropped
  or force-added.
- **Admin-gated endpoints added ahead of Phase 9 on purpose**: `PATCH
  /api/orders/:id/status` and the three `/api/admin/inventory/*` routes
  (low-stock list, per-variant transaction history, manual adjustment) have
  no admin UI yet — that's genuinely Phase 9. They exist now because without
  a way to advance an order past CONFIRMED, the whole cancel/refund/timeline
  system built this phase would be untestable end-to-end. Every manual stock
  adjustment requires a note and is logged as `STOCK_ADJUSTED`, never a
  silent number change.
- **Invoice PDF is generated on demand and streamed directly to the
  response** (`invoice.service.ts`, using `pdfkit`) — no temp file, no disk
  write, no async job. Simple hand-drawn table since pdfkit has no table
  primitive; fine at this scale but would need a proper layout library for
  multi-page invoices with many line items.
- **`Order.items[].product`** is now included on every order read except
  the just-created response from `POST /orders` (see the comment on
  `CreateOrderResult` in the frontend types) — used to link back to the
  product page when it's still active, and to gray that out gracefully when
  a product's since been archived.
- **Verification still needed**: same as every phase. The refund/cancel
  paths that touch Stripe additionally need real test-mode keys and won't
  do anything meaningful without at least one order that reached a paid
  state first (i.e., Phase 6's webhook flow working end-to-end).

## Phase 8 notes — Reviews & coupons

- **A review requires a DELIVERED order item, structurally, not a checkbox**
  — `reviewRepository.findReviewableOrderItem` looks for an order item on a
  DELIVERED order for that user+product that isn't already linked to a
  review, and creation fails without one. `isVerifiedPurchase` is therefore
  always `true`; there's no code path that produces an unverified review,
  which matches Section 8 ("Customers can review products they purchased")
  more literally than a self-reported badge would.
- **Editing a review resets it to PENDING** — an approved review's visible
  content shouldn't change without another moderation pass, the same
  principle as the original submission.
- **`Product.avgRating`/`reviewCount` are recomputed from APPROVED reviews
  only**, via `prisma.review.aggregate`, after every create/edit/delete/
  moderation action (`recomputeProductRating` in `review.service.ts`) — a
  PENDING or HIDDEN review never affects what the storefront shows.
- **Rating distribution uses a raw SQL `GROUP BY`**
  (`review.repository.ts`'s `findRatingDistribution`) rather than five
  separate `COUNT` queries — one query, one round trip, and it's the kind
  of aggregation the spec's SQL-analytics emphasis calls for.
- **Coupon admin CRUD lives in the same `coupon.service.ts`** as the
  customer-facing `validateForUser` from Phase 5/6, not a separate admin
  service — both operate on the same entity and the same rules; splitting
  them would just create two files that have to agree on what a "valid
  coupon" looks like.
- **Admin UI is deliberately standalone pages, not a dashboard** — `/admin/
  coupons` and `/admin/reviews` are fully functional (create/edit/delete
  coupons, approve/hide/delete reviews) but aren't wrapped in a shared
  AdminLayout with sidebar nav or metrics; that shell is genuinely Phase 9.
  A small inline nav links the two pages to each other in the meantime.
  Coupon product-level restriction is supported at the API level
  (`productIds`) but the admin form only exposes category-level
  restriction — scoped down for time; product multi-select would need its
  own searchable picker component.
- **Verification still needed**: same as every phase, plus reviews
  specifically need at least one DELIVERED order to exist (via the admin
  `PATCH /orders/:id/status` endpoint from Phase 7) before a review can be
  submitted at all — there's no way to review anything straight out of a
  fresh seed with no order history.

## Phase 9 notes — Admin dashboard

- **`AdminLayout` now wraps every `/admin/*` route** — sidebar nav
  (Dashboard/Products/Orders/Customers/Coupons/Reviews), all gated by one
  `<ProtectedRoute allowedRoles={["ADMIN","STAFF"]}>` at the router level.
  Phase 8's coupon/review pages needed no changes to slot into this — they
  were already standalone pages, just newly wrapped.
- **Dashboard metrics/charts intentionally avoid window functions** — every
  query here is a plain `COUNT`/`SUM`/`AVG`/`GROUP BY`. Phase 10's SQL
  analytics module is where `RANK`/`DENSE_RANK`/`LAG`/CTEs live; this phase
  is "what's true right now," not ranked historical analysis. The one
  exception worth noting: customer list aggregation uses Postgres's
  `FILTER` clause (`COUNT(o.id) FILTER (WHERE ...)`) to get order count and
  lifetime spend in a single query without a subquery.
- **"Conversion rate" is explicitly an approximation, not a real one** — this
  build has no page-view/session tracking, so there's no visitor data to
  divide by. What's shown instead is "customers with ≥1 order ÷ total
  customers," labeled as an approximation directly in the UI rather than
  presented as something it isn't.
- **Admin order management reuses `order.service.ts`'s `updateStatus`
  entirely** (built in Phase 7 as a stopgap) — Phase 9 only added the
  admin-scoped *list* and *get-by-id* (not filtered to `req.user`), moving
  the status-update route from the customer-scoped `order.routes.ts` to the
  new `adminOrder.routes.ts` where it actually belongs now that an admin
  surface exists.
- **Self-lockout guards**: an admin can't disable their own account or
  change their own role away from ADMIN (`customer.service.ts`) — protects
  against a solo-admin deployment locking itself out. Role changes are
  restricted to ADMIN (not STAFF) specifically, since a staff account
  shouldn't be able to promote itself or anyone else.
- **Admin product management is intentionally scoped down**: full CRUD
  create (with one initial variant) works end-to-end through the existing
  Phase 4 `POST /api/products` endpoint, and the backend now supports
  adding further variants/images to an existing product
  (`/api/admin/products/:id/variants`, `/images`) — but the admin *UI* for
  that per-product editing isn't built this phase, only list + activate/
  deactivate + create. Editing an existing product's variants/images
  currently requires calling those endpoints directly. Flagged here rather
  than silently left out.
- **Verification still needed**: same as every phase. The dashboard charts
  specifically need real order/product/customer data to show anything
  meaningful — an empty database renders empty charts, not errors, but
  they won't demonstrate much without the seed data Section 29 covers
  later.

## Phase 10 notes — SQL analytics

- **`docs/sql-analytics.md` documents every query** — what it computes,
  which window function or CTE technique it demonstrates, and why it's
  written the way it is. That's the file to open first when discussing
  this phase; this note is a summary of it, not a replacement.
- **Every window function the spec calls out gets a distinct use case**,
  not just a token appearance: `RANK()` (top customers, category
  performance — ties share a rank), `DENSE_RANK()` (best-selling products
  — deliberately the other ranking function, no gaps after ties),
  `ROW_NUMBER() PARTITION BY` (monthly new-vs-returning — numbering each
  customer's own orders independently), `SUM() OVER()` (monthly revenue's
  running cumulative total), `LAG()` (month-over-month revenue growth —
  the canonical "compare to the previous row" case a plain GROUP BY can't
  express without a self-join).
- **Caught and fixed a real bug while writing this**: an early draft
  embedded a live `prisma.$queryRaw` call (which executes immediately and
  returns a Promise) as an interpolation inside another tagged-template
  query, instead of a reusable `Prisma.sql` fragment. Fixed by defining
  `REVENUE_FILTER_FRAGMENT` as an actual `Prisma.sql` fragment for the
  parameterized-template queries, and keeping a separate plain-string
  `REVENUE_FILTER` for the `$queryRawUnsafe` queries that need a
  limit/months value woven into the query structure itself (still bound as
  `$1`, never string-concatenated).
- **LEFT JOIN filter placement is called out explicitly** (product
  performance, category performance): the status filter lives in the `ON`
  clause of the join, not `WHERE` — putting it in `WHERE` would silently
  turn a LEFT JOIN into an INNER JOIN and drop every product/category with
  zero qualifying sales, which is exactly the "0 units sold" row a
  performance report needs to show.
- **bigint serialization**: Postgres `COUNT`/`SUM` over raw queries return
  `bigint` in Prisma's raw-query results, which `JSON.stringify` can't
  serialize by default. `analytics.controller.ts` converts every bigint
  field to `Number` before sending — safe here since none of these
  aggregates can realistically exceed `Number.MAX_SAFE_INTEGER` at this
  business's scale.
- **Verification still needed**: same as every phase, and more than most —
  these queries only produce meaningful output with real order history
  spanning multiple months. An empty or single-day-old database will
  return empty result sets (not errors), which is correct behavior but
  won't demonstrate much until Section 29's seed data exists.

## Phase 11 notes — Real-time features (+ Section 17 notification center)

- **Folded Section 17's notification center into this phase** rather than
  leaving it unassigned — a persisted, readable/unreadable notification and
  a live Socket.IO push are the same feature end-to-end (the socket event
  is what makes it appear instantly; the DB row is what makes it still be
  there, correctly read/unread, next time the bell is opened on any
  device). Building them separately would've meant revisiting this same
  code twice.
- **Room-based, not connection-tracking**: every authenticated socket joins
  `user:{userId}` and, if admin/staff, also `admins`
  (`backend/src/sockets/index.ts`). Emitting to a user or to every admin is
  then just `io.to(room).emit(...)` — no manual bookkeeping of which
  socket ids belong to which user, and multi-tab/multi-device delivery is
  automatic since all of a user's sockets share their room.
- **Socket auth uses the same JWT access token as REST**, passed via the
  client's `auth` option (a callback, re-evaluated on every reconnect —
  see `frontend/src/lib/socket.ts` — so a token refresh doesn't leave a
  reconnecting socket stuck with a stale one), verified with the same
  `verifyAccessToken` util the HTTP middleware uses. Socket.IO's own cookie
  handling doesn't cleanly share the HTTP-only refresh-token cookie flow
  from Phase 3, so this deliberately uses the bearer token instead.
- **Low-stock alerts fire on threshold *crossing*, not "is currently
  low"** — both trigger points (order checkout in `order.service.ts`,
  manual adjustment in `inventory.service.ts`) compare the quantity before
  and after the change and only notify when it goes from above the
  threshold to at-or-below it. Alerting on every order once an item is
  already low would get noisy within a single busy day.
- **Fire-and-forget notifications**: every `notificationService.notifyX(...)`
  call after an order/status event is `void`'d with a `.catch(() => {})` —
  a failed or slow notification must never fail the order/status update it
  was triggered by. Same pattern Phase 3 used for auth emails.
- **Dev-only wiring worth knowing about**: Vite's dev proxy needed a second
  entry (`/socket.io`, with `ws: true`) alongside the existing `/api` one —
  the WebSocket upgrade doesn't ride along with a plain HTTP proxy rule
  without it.
- **Verification still needed**: same as every phase. Real-time behavior
  specifically needs two things a `tsc`/build check can't catch: an actual
  running backend to connect to, and a second browser tab/session (e.g. an
  admin tab open while a customer places an order) to see the live push
  actually arrive.

## Phase 12 notes — Testing

- **The starkest instance of this project's core constraint**: every test
  in this phase was written carefully against the actual implementation,
  but none of them have been run. There is no Node runtime with installed
  dependencies in this environment, so `npm test` has never actually
  executed here. This phase is where that limitation matters most —
  treat every test file as a well-reasoned draft to run and fix, not a
  proof that the suite is green.
- **Backend unit tests** (`tests/unit/`, `npm test`) mock every dependency
  below the function under test — no DB, no network. Coverage matches the
  spec's explicit list: `pricing.service.test.ts` (pure-function, zero
  mocking — the highest-confidence file here, since `computePricing` takes
  no dependencies at all), `coupon.service.test.ts`, `auth.service.test.ts`,
  `cart.service.test.ts`, `inventory.service.test.ts` (including the
  threshold-crossing alert logic from Phase 11), `order.service.test.ts`
  (the spec's explicit "order creation" case — COD vs. Stripe inventory
  branching, plus the race-condition conflict path), and
  `payment.service.test.ts` (Stripe SDK fully mocked).
- **Backend integration tests** (`tests/integration/`, `npm run
  test:integration`) run the real Express app via `supertest` against a
  real Postgres — nothing mocked below HTTP. Needs a disposable test
  database with migrations applied first; see
  `tests/integration/README.md` for the one-time setup. Covers
  registration/login, product listing/detail, and — the most valuable
  single test in the suite — a full cart→checkout flow that asserts
  inventory was *actually* decremented in the database, not just that the
  API returned 201.
- **A real, small fix made along the way**: `authLimiter`
  (`middleware/rateLimiter.ts`) previously hardcoded a 10-request/15-minute
  cap with no way to relax it, which would have made the integration suite
  self-rate-limit within a single run (multiple test files each register
  at least one account). Now reads `isTest` from `config/env.ts` and only
  relaxes to 1000 when `NODE_ENV=test` — production behavior is completely
  unchanged.
- **Frontend tests** (`frontend/`, `npm test`, Vitest + React Testing
  Library) cover the spec's list at the component level rather than full
  pages where a full page would require mocking too much unrelated
  machinery to be a meaningful unit test: `ProductCard`/`ProductGrid`
  (Product listing), `CartItemRow` (Cart), `LoginForm` (Login),
  `DeliveryMethodStep` (Checkout — the live-priced-shipping-option piece
  specifically, since the full `CheckoutPage` pulls in Stripe Elements,
  which is a poor unit-test target), and `MetricCard` (Admin dashboard).
  A shared `test-utils.tsx` wraps renders in `QueryClientProvider` +
  `MemoryRouter` so individual test files don't repeat that setup.
- **Verification steps, concretely**: `cd backend && npm install && npm
  test` for unit tests (no DB needed); `npm run test:integration` after
  the one-time test-DB setup in `tests/integration/README.md`; `cd
  frontend && npm install && npm test` for frontend tests. Report back
  whatever breaks and it'll get fixed at the root cause, not patched
  around.

## Phase 13 notes — Docker & CI/CD

- **`npm install`, not `npm ci`, everywhere** (both Dockerfiles, both CI
  jobs) — `npm ci` requires an existing `package-lock.json`, and this repo
  has never had `npm install` run against a real registry (no network in
  this environment), so no lockfile exists yet. Every place this matters
  has a comment next to it. Generating and committing a lockfile on first
  real install, then switching to `npm ci`, is a worthwhile follow-up —
  faster installs and fully reproducible builds.
- **`prisma db push`, not `prisma migrate deploy`, in the container
  entrypoint and CI** — same root cause as above, stated plainly in
  `backend/docker-entrypoint.sh`: there are no migration files in
  `backend/prisma/migrations/` to deploy, because generating them needs
  `prisma migrate dev` against a live Postgres this project never had.
  `db push` syncs the schema directly and is what makes `docker compose
  up` work today; the comment marks exactly where to switch back once
  real migrations exist.
- **Multi-stage backend Dockerfile, ordered deliberately**: install → copy
  `prisma/` → `prisma generate` → copy `src/` → `tsc` build → `npm prune
  --omit=dev`. Prisma generate has to happen before the TypeScript build
  (service code imports types from the generated client) and pruning
  after the build (not via a second separate install) keeps the already-
  generated client intact while still shedding devDependencies from the
  final image.
- **Frontend Dockerfile bridges a real Vite gotcha**: `VITE_*` variables
  are inlined into the built JS at *build* time, not read at container
  *runtime* — there's no `process.env` once it's static files behind
  nginx. `VITE_API_URL`/`VITE_SOCKET_URL` are deliberately left unset
  (both already default to a relative path in `src/api/client.ts` /
  `src/lib/socket.ts`, which is exactly right since `nginx.conf` proxies
  `/api` and `/socket.io` to the backend container by service name). Only
  `VITE_STRIPE_PUBLISHABLE_KEY` has no sensible default, so it's threaded
  through as a Docker build ARG from `docker-compose.yml`.
- **CI runs integration tests against a real Postgres service
  container**, not just the mocked unit tests — `.github/workflows/ci.yml`
  spins up `postgres:16-alpine` as a GitHub Actions service, points
  `DATABASE_URL` at it, runs `prisma db push`, then both `npm test` and
  `npm run test:integration`. This is the first point in the whole build
  where the integration suite from Phase 12 actually runs anywhere.
- **`docker-compose.yml` has working dev-only defaults for every secret**
  (`JWT_SECRET`, `COOKIE_SECRET`, etc.), each clearly labeled
  `dev_only...change_me` — `docker compose up` works with zero setup, and
  the root `.env.example` documents how to override any of them (e.g. real
  Stripe test keys) without touching the compose file itself.
- **Verification still needed**: this is the phase where that caveat
  finally gets testable end-to-end rather than deferred again — `docker
  compose up --build` from the repo root is the actual test. I can't run
  it here (no Docker daemon, no network in this sandbox), so this is
  genuinely unverified. If the build fails, the most likely culprits based
  on everything above are: a dependency version mismatch only a real `npm
  install` would surface, or the `prisma db push` step if the schema has
  any issue that only shows up against a real Postgres.

## Phase 14 notes — Performance optimization

- **Full reasoning lives in `docs/performance.md`**, written specifically
  because the spec asks to "explain important performance decisions in
  the documentation" — this note is a summary of it, not a replacement.
- **Most of this phase was already done incrementally**, not bolted on
  now: pagination (every list endpoint since Phase 4), debounced search
  (product listing, admin products/customers), database indexes (schema.prisma
  + database/schema.sql since Phase 2), and avoiding N+1 queries (every
  list endpoint uses either a Prisma `include` or hand-written joined SQL,
  never a per-row query loop) were all built alongside the features that
  needed them. What Phase 14 actually *added*: route-based code splitting,
  an image-loading audit, HTTP `Cache-Control` headers, and targeted
  memoization.
- **Route-based code splitting** (`frontend/src/routes/lazyPages.ts`) —
  every leaf page is `React.lazy`, with `Suspense` boundaries placed
  *inside* `RootLayout`/`AdminLayout` (wrapping just `<Outlet>`) rather
  than around the whole app, so the header/sidebar stay mounted during a
  route transition. `NotFoundPage` is the one deliberate exception — it's
  used as the router's `errorElement`, which renders outside that
  boundary entirely, so a lazy version there would have no `Suspense`
  ancestor to catch it.
- **Image loading**: every below-the-fold image now has `loading="lazy"` —
  audited across product grids, cart, wishlist, reviews, and admin tables.
  The one deliberate exception is the PDP's main gallery image, which is
  the page's Largest Contentful Paint element; lazy-loading the most
  important image on the page it's most important for would be
  self-defeating.
- **HTTP caching** (`middleware/cacheControl.ts`) applied only to public,
  read-only, infrequently-changing endpoints (product listing/detail,
  category tree, brand list) with `stale-while-revalidate` alongside
  `max-age`. Deliberately not global — cart/orders/account/admin all stay
  uncached, since a shared cache must never store per-user or sensitive
  responses.
- **Memoization was targeted, not blanket**: `ProductCard` got
  `React.memo` because it concretely renders up to ~20 times per listing
  page and a filter change re-renders the whole grid;
  `AdminAnalyticsPage`'s three chart-data transforms got `useMemo` because
  they `.map()` over externally-fetched arrays on every render regardless
  of which query actually changed. Left everywhere else alone — most
  components here are cheap enough that memoizing them would trade a real
  dependency-array bug risk for no measurable benefit.
- **Verification still needed**: same as every phase, plus this one
  specifically benefits from an actual Lighthouse/bundle-analyzer run
  once `npm install` has happened for real — I can describe the
  code-splitting boundaries correctly but can't measure the resulting
  bundle sizes or paint timings from here.
