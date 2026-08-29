import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
    include: ["tests/integration/**/*.test.ts"],
    // Integration tests share one Postgres connection/schema and mutate
    // shared tables (users, products, orders, ...) — running files in
    // parallel would cause them to trample each other's fixtures.
    fileParallelism: false,
    // DATABASE_URL here is a sensible default for local dev (matches the
    // `nexora_test` database docker-compose.yml can also spin up) — export
    // a different DATABASE_URL in your shell before running this script to
    // point at any other disposable Postgres instance. Never point this at
    // a database with real data: these tests truncate tables between runs.
    env: {
      NODE_ENV: "test",
      CLIENT_URL: "http://localhost:5173",
      SERVER_URL: "http://localhost:4001",
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgresql://nexora:nexora_dev_password@localhost:5432/nexora_test?schema=public",
      REDIS_URL: "redis://localhost:6379",
      JWT_SECRET: "test_jwt_secret_at_least_16_chars",
      JWT_REFRESH_SECRET: "test_refresh_secret_at_least_16_chars",
      COOKIE_SECRET: "test_cookie_secret_at_least_16_chars",
      STRIPE_SECRET_KEY: "sk_test_dummy",
      STRIPE_WEBHOOK_SECRET: "whsec_dummy",
      STRIPE_PUBLISHABLE_KEY: "pk_test_dummy",
      EMAIL_PROVIDER: "mock",
      RATE_LIMIT_MAX: "5000",
    },
  },
});
