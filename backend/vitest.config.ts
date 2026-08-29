import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    testTimeout: 15_000,
    hookTimeout: 15_000,
    // Unit tests (tests/unit) mock every dependency and need no external
    // services. Integration tests (tests/integration) hit a real Postgres
    // via Prisma and are run separately — see package.json's
    // `test` vs `test:integration` scripts and tests/integration/README.md.
    include: ["tests/unit/**/*.test.ts"],
    // Every src module (even ones we mock out most of) imports
    // config/env.ts at the top, which validates process.env on import —
    // .env.test supplies dummy-but-schema-valid values so that import
    // never throws, without needing any real secrets for unit tests.
    env: {
      NODE_ENV: "test",
      CLIENT_URL: "http://localhost:5173",
      SERVER_URL: "http://localhost:4001",
      DATABASE_URL: "postgresql://nexora:nexora_dev_password@localhost:5432/nexora_test?schema=public",
      REDIS_URL: "redis://localhost:6379",
      JWT_SECRET: "test_jwt_secret_at_least_16_chars",
      JWT_REFRESH_SECRET: "test_refresh_secret_at_least_16_chars",
      COOKIE_SECRET: "test_cookie_secret_at_least_16_chars",
      STRIPE_SECRET_KEY: "sk_test_dummy",
      STRIPE_WEBHOOK_SECRET: "whsec_dummy",
      STRIPE_PUBLISHABLE_KEY: "pk_test_dummy",
      EMAIL_PROVIDER: "mock",
    },
  },
});
