# Build Progress Log

Tracks what's been implemented, phase by phase. Each phase is only marked done
once its files exist and are internally consistent with prior phases.

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Project setup & architecture (monorepo, configs, tooling) | ✅ Done |
| 2 | Database schema & migrations (Prisma schema, ER diagram, SQL docs) | ✅ Done |
| 3 | Authentication & authorization | ✅ Done |
| 4 | Product / catalog system | ⏳ Next |
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
