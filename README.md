# Nexora

Nexora is a full-stack e-commerce platform built to provide a realistic shopping experience alongside an admin dashboard for managing the store.

### Live Demo

- **Storefront:** https://nexora-1-z50y.onrender.com
- **Admin Dashboard:** https://nexora-1-z50y.onrender.com/admin
- **API:** https://nexora-4hgs.onrender.com
- **GitHub:** https://github.com/Syedaslam018/Nexora

## What you can do

### Storefront
- Browse, search, filter, and sort products
- View product details, variants, stock, ratings, and reviews
- Manage cart, wishlist, addresses, and coupons
- Checkout with Stripe test payments or Cash on Delivery
- Track orders and download invoices
- Create an account with email verification and password reset
- Receive real-time notifications

### Admin Dashboard
- View sales, orders, customers, and inventory
- Manage products, variants, inventory, orders, reviews, and coupons
- Monitor low-stock products
- Manage Admin and Staff access

## Tech Stack

- **Frontend:** React, TypeScript, Vite, React Router, TanStack Query, Zustand, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript, Prisma, Zod, JWT
- **Database & Infrastructure:** PostgreSQL, Redis, BullMQ, Socket.IO
- **Payments & Email:** Stripe, Nodemailer
- **Testing & Tooling:** Vitest, ESLint, Prettier, Docker

## Run Locally

### Requirements

Node.js 20+, PostgreSQL 16+, and Redis 7+.

```bash
git clone https://github.com/Syedaslam018/Nexora.git
cd Nexora

# Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev

# Frontend (in a separate terminal)
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the API runs on `http://localhost:4000` during local development.

## Demo Account

**Admin**
- Email: `admin@nexora.dev`
- Password: `NexoraDemo123!`

## Project Structure

```text
Nexora/
├── backend/       # Express API, Prisma and database logic
├── frontend/      # React storefront and admin dashboard
├── database/      # SQL reference files
├── docs/          # Project documentation
└── docker-compose.yml
```

## License

This project is intended for demonstration and development use.
