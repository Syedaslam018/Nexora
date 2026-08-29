import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/config/db.js";

export const app = createApp();

/** Truncates every application table and restarts identity sequences —
 * called at the top of each test file's `beforeEach` so tests never
 * depend on leftover state from a previous test or file. `_prisma_migrations`
 * is deliberately excluded (it's Prisma's own bookkeeping, not app data). */
export async function resetDatabase() {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations'
  `;
  if (tables.length === 0) return;
  const names = tables.map((t) => `"${t.tablename}"`).join(", ");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${names} RESTART IDENTITY CASCADE`);
}

export async function registerAndLogin(overrides: Partial<{ email: string; password: string }> = {}) {
  const email = overrides.email ?? `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  const password = overrides.password ?? "Password123";

  const res = await request(app).post("/api/auth/register").send({
    email,
    password,
    firstName: "Test",
    lastName: "User",
  });

  return {
    email,
    password,
    userId: res.body.data.user.id as string,
    accessToken: res.body.data.accessToken as string,
    cookies: res.headers["set-cookie"] as unknown as string[],
  };
}

export async function seedCategory(name = "Laptops") {
  return prisma.category.create({
    data: { name, slug: name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now() },
  });
}

export async function seedBrand(name = "NEXORA") {
  return prisma.brand.create({
    data: { name, slug: name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now() },
  });
}

/** One product with one variant and a set amount of stock — the minimum
 * fixture most cart/checkout tests need. */
export async function seedProductWithVariant(overrides: { availableQty?: number; priceCents?: number } = {}) {
  const category = await seedCategory();
  const brand = await seedBrand();
  const product = await prisma.product.create({
    data: {
      name: "Test Laptop",
      slug: `test-laptop-${Date.now()}`,
      description: "A laptop for testing.",
      sku: `SKU-${Date.now()}`,
      basePriceCents: overrides.priceCents ?? 99_999,
      brandId: brand.id,
      categoryId: category.id,
      isActive: true,
      variants: {
        create: {
          sku: `VAR-${Date.now()}`,
          name: "Default",
          attributes: {},
          inventory: { create: { availableQty: overrides.availableQty ?? 10, lowStockThreshold: 2 } },
        },
      },
    },
    include: { variants: { include: { inventory: true } } },
  });
  return { product, variant: product.variants[0]! };
}

export async function seedAddress(userId: string) {
  return prisma.address.create({
    data: {
      userId,
      fullName: "Test User",
      phone: "5555555555",
      line1: "1 Test St",
      city: "Testville",
      state: "TS",
      postalCode: "00000",
      country: "United States",
      isDefault: true,
    },
  });
}
