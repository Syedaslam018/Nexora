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

## Getting started (once Phase 3+ lands)

```bash
cp .env.example .env        # in backend/ and frontend/
docker compose up --build
```

Full setup, seeding, and demo credentials instructions will be added as those
phases are completed — see `docs/PROGRESS.md`.

## Why this exists

This repo is built as a portfolio piece to demonstrate: relational schema
design, transaction-safe inventory handling, SQL analytics (window functions,
CTEs, aggregations), auth/RBAC, Stripe integration, and clean layered backend
architecture (routes → controllers → services → repositories).
