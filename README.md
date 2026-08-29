# NEXORA — Full-Stack E-Commerce Platform

A production-style e-commerce platform (storefront + admin dashboard) built to
demonstrate full-stack engineering: React/TypeScript frontend, Express/TypeScript
REST API, PostgreSQL with Prisma, Stripe payments, real-time admin updates via
Socket.IO, and Docker Compose orchestration.

> **Status:** Under active build. This README tracks what exists right now —
> it will grow as each phase lands. See `docs/PROGRESS.md` for the phase log.

## Stack

| Layer    | Choices |
|----------|---------|
| Frontend | React 18, TypeScript, Vite, React Router, TanStack Query, Zustand, Tailwind CSS, shadcn/ui, React Hook Form + Zod, Axios, Recharts |
| Backend  | Node.js, TypeScript, Express, Zod, JWT (access + refresh), bcrypt, Helmet, CORS, express-rate-limit |
| Database | PostgreSQL 16, Prisma ORM, raw SQL for analytics |
| Infra    | Docker, Docker Compose, Redis (cache/session/rate-limit/queues), BullMQ, Socket.IO |

## Monorepo layout

```
nexora-ecommerce/
├── backend/          Express API, Prisma schema, tests
├── frontend/          Vite + React storefront & admin dashboard
├── database/          SQL reference docs, ER diagram
├── docs/               API docs, flows, progress log
├── docker-compose.yml
└── .github/workflows/  CI
```

## Getting started

### Option A — Docker (recommended, zero local setup)

```bash
docker compose up --build
```

That's it — Postgres, Redis, the API, and the frontend all start together.
The frontend is at http://localhost:5173, the API at http://localhost:4000.
Every environment variable has a working dev-only default baked into
`docker-compose.yml`; copy `.env.example` to `.env` in the repo root only
if you want to override something (e.g. real Stripe test keys).

**Known limitation, stated plainly**: `backend/prisma/migrations/` has no
migration files yet — this project never had a live database available to
generate them from (see `docs/PROGRESS.md`'s Phase 2 notes). The container
uses `prisma db push` to sync the schema directly instead. Once real
migrations exist, `backend/docker-entrypoint.sh` should switch to
`prisma migrate deploy` — the comment right above that line says the same
thing.

### Option B — Run locally without Docker

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cd backend && npm install && npx prisma generate && npx prisma db push
cd ../frontend && npm install
# two terminals:
cd backend && npm run dev
cd frontend && npm run dev
```

Needs your own local Postgres and Redis (`docker compose up postgres redis`
from the repo root gets you both without running the app containers).

## Testing

```bash
cd backend && npm test                # unit tests, no DB needed
cd backend && npm run test:integration  # needs a real test DB — see tests/integration/README.md
cd frontend && npm test
```

## CI

`.github/workflows/ci.yml` runs on every push/PR to `main`: install, lint,
typecheck, unit tests, integration tests (against a real Postgres service
container), and build — for both `backend/` and `frontend/` as separate
jobs.

## Why this exists

This repo is built as a portfolio piece to demonstrate: relational schema
design, transaction-safe inventory handling, SQL analytics (window functions,
CTEs, aggregations), auth/RBAC, Stripe integration, and clean layered backend
architecture (routes → controllers → services → repositories).
