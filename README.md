# Nexora

Nexora is a full-stack e-commerce platform with a customer storefront and an
operations-focused admin dashboard. It is built as a portfolio-quality example
of a layered TypeScript application: React on the client, Express and Prisma on
the API, PostgreSQL for relational data, Redis for infrastructure concerns, and
Stripe for payments.

## What’s included

### Storefront

- Responsive home page, product listing, search, sorting, pagination, and filters
- Product detail pages with variants, stock status, image galleries, ratings, and reviews
- Guest cart plus persistent account cart, coupon application, and live totals
- Wishlist management for signed-in customers
- Address book, delivery selection, Stripe test checkout, and cash on delivery
- Order confirmation, order history, order timelines, and invoice PDF download
- Registration, login, refresh-token sessions, email verification, and password reset
- Persistent notifications with real-time Socket.IO updates

### Admin dashboard

- Sales and order overview with revenue, order, customer, and inventory metrics
- Revenue and product-performance analytics backed by SQL queries
- Product, variant, image, inventory, order, customer, review, and coupon management
- Review moderation and order-status updates
- Low-stock visibility and live admin notifications
- Role-based access for `ADMIN` and `STAFF` users

### Engineering features

- Strict TypeScript across the frontend and backend
- Layered API structure: routes → controllers → services → repositories
- Zod request validation and consistent API error responses
- Argon2id password hashing, JWT access/refresh tokens, secure cookies, CORS, Helmet, and rate limiting
- Transaction-safe inventory reservation, release, and sale flows
- Prisma schema with soft deletion, relational constraints, and indexed queries
- Vitest unit and integration test suites
- Docker Compose orchestration for PostgreSQL, Redis, API, and frontend

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, React Router, TanStack Query, Zustand, Tailwind CSS, shadcn/ui, Recharts |
| Backend | Node.js 20+, Express, TypeScript, Zod, Prisma, JWT, Argon2id |
| Data and infrastructure | PostgreSQL 16, Redis 7, BullMQ, Socket.IO |
| Payments and email | Stripe test mode, Nodemailer (mock transport by default) |
| Quality | ESLint, Prettier, Vitest, Docker |

## Project structure

```text
.
├── backend/                 Express API, Prisma schema, seed script, tests
├── frontend/                Vite React storefront and admin dashboard
├── database/                SQL reference schema and analytics documentation
├── docs/                    Design, API, performance, and progress notes
├── docker-compose.yml       PostgreSQL, Redis, backend, and frontend services
└── .github/workflows/       CI configuration
```

## Quick start with Docker

Requirements: Docker Desktop with Compose support.

```bash
docker compose up --build
```

The compose file defaults to `NODE_ENV=development` for a safe local demo. It
uses `prisma db push` in that mode and the mock email provider, so no production
credentials are required locally.

Open:

- Storefront: <http://localhost:5173>
- Admin dashboard: <http://localhost:5173/admin>
- API: <http://localhost:4000>
- Health check: <http://localhost:4000/api/health>

The backend container automatically runs `prisma db push` to synchronize the
schema. To load the demo catalog and accounts, install backend dependencies on
your host and run the seed against the Docker Postgres service:

```bash
cd backend
npm install
DATABASE_URL='postgresql://nexora:nexora_dev_password@localhost:5432/nexora?schema=public' npm run db:seed
```

The seed is idempotent, so it is safe to run more than once.

## Local development without Docker

Requirements: Node.js 20+, PostgreSQL 16+, and Redis 7+.

1. Create environment files:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. Start PostgreSQL and Redis, then install dependencies and prepare Prisma:

   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

3. Start the API and frontend in separate terminals:

   ```bash
   # terminal 1
   cd backend && npm run dev

   # terminal 2
   cd frontend && npm install && npm run dev
   ```

The Vite dev server proxies `/api` and `/socket.io` to the API at
`http://localhost:4000`.

## Demo accounts

All seeded accounts use the password `NexoraDemo123!`.

| Role | Email |
| --- | --- |
| Admin | `admin@nexora.dev` |
| Customer | `alex@nexora.dev` |
| Customer | `jamie@nexora.dev` |
| Customer | `sam@nexora.dev` |

The seed also creates 30 products with image URLs, categories, brands, product
variants, inventory, reviews, carts, wishlists, coupons (`WELCOME15` and
`FREESHIP`), sample orders, payments, order timelines, and notifications.

## Useful commands

Run commands from the relevant package directory.

```bash
# Backend
npm run dev
npm run build
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run db:generate
npm run db:seed
npm run db:studio

# Frontend
npm run dev
npm run build
npm run lint
npm run typecheck
npm test
```

Integration tests require a disposable PostgreSQL database configured through
`backend/.env.test`; unit tests do not require a database.

## Configuration

Backend configuration lives in [`backend/.env.example`](backend/.env.example).
Important values include:

- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `COOKIE_SECRET` — development secrets
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `STRIPE_PUBLISHABLE_KEY` — Stripe test-mode keys
- `EMAIL_PROVIDER=mock` — logs email actions without sending mail

Frontend configuration lives in [`frontend/.env.example`](frontend/.env.example).
Only `VITE_*` variables are exposed to the browser.

## Production deployment checklist

1. Use [`backend/.env.example`](backend/.env.example) as a variable checklist,
   but configure the values in the root Compose environment/secret manager.
   Set `NODE_ENV=production`, use HTTPS URLs for `CLIENT_URL` and
   `SERVER_URL`, provide long unique JWT/cookie secrets, configure SMTP, and
   use real Stripe credentials. The API refuses to start if placeholder
   secrets, localhost URLs, or the mock email provider are used in production.
2. Set `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, and the backend
   secrets in the environment consumed by Compose. Do not commit `.env` files.
   When using the bundled services, omit `DATABASE_URL` and `REDIS_URL` so
   Compose supplies the internal `postgres` and `redis` service URLs. Set
   those two variables only when using managed services. The database and
   cache ports bind to `127.0.0.1` by default.
3. Build and start with `docker compose up -d --build`. Production startup
   applies the reviewed migration in `backend/prisma/migrations/` with
   `prisma migrate deploy`; it never runs a destructive `db push`.
4. Set `VITE_STRIPE_PUBLISHABLE_KEY` at frontend image build time and expose
   only the frontend through your public reverse proxy. Set
   `EMAIL_PROVIDER=smtp` plus the SMTP variables for real email delivery. Keep
   PostgreSQL and Redis on a private network and terminate TLS at the proxy.
5. Verify `GET /api/health`, sign in with a non-demo account, and configure
   backups, log collection, alerting, and Stripe's webhook endpoint before
   accepting real orders.

## Documentation

- [`docs/PROGRESS.md`](docs/PROGRESS.md) — implementation phases and known limitations
- [`docs/design-system.md`](docs/design-system.md) — visual language and UI conventions
- [`docs/sql-analytics.md`](docs/sql-analytics.md) — analytics query notes
- [`docs/er-diagram.md`](docs/er-diagram.md) — data model reference
- [`backend/tests/integration/README.md`](backend/tests/integration/README.md) — integration-test setup

## Database note

The repository includes a reviewed initial Prisma migration. Development uses
`prisma db push`; production containers use `prisma migrate deploy` so schema
changes are versioned and cannot silently remove data during startup.

## License

This project is intended for demonstration and development use.
