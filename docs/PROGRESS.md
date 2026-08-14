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
| 6 | Checkout & payments (Stripe) | ⏳ Next |
| 7 | Orders & inventory | ⏳ Pending |
| 8 | Reviews & coupons | ⏳ Pending |
| 9 | Admin dashboard | ⏳ Pending |
| 10 | SQL analytics | ⏳ Pending |
| 11 | Real-time features (Socket.IO) | ⏳ Pending |
| 12 | Testing | ⏳ Pending |
| 13 | Docker & CI/CD | ⏳ Pending |
| 14 | Performance optimization | ⏳ Pending |
| 15 | Final UI polish & documentation | ⏳ Pending |

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
