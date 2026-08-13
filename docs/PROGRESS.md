# Build Progress Log

Tracks what's been implemented, phase by phase. Each phase is only marked done
once its files exist and are internally consistent with prior phases.

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Project setup & architecture (monorepo, configs, tooling) | ✅ Done |
| 2 | Database schema & migrations (Prisma schema, ER diagram, SQL docs) | ✅ Done |
| 3 | Authentication & authorization | ⏳ Next |
| 4 | Product / catalog system | ⏳ Pending |
| 5 | Cart & wishlist | ⏳ Pending |
| 6 | Checkout & payments (Stripe) | ⏳ Pending |
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
