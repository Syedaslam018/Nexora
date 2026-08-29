import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, resetDatabase, seedProductWithVariant } from "./helpers.js";

describe("Product API", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("returns an empty list with correct pagination shape when there are no products", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body.data.items).toEqual([]);
    expect(res.body.data.meta).toMatchObject({ page: 1, totalItems: 0 });
  });

  it("lists an active product", async () => {
    const { product } = await seedProductWithVariant();
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].id).toBe(product.id);
  });

  it("fetches a product by slug with its variants", async () => {
    const { product, variant } = await seedProductWithVariant({ availableQty: 7 });
    const res = await request(app).get(`/api/products/${product.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe(product.slug);
    expect(res.body.data.variants).toHaveLength(1);
    expect(res.body.data.variants[0].id).toBe(variant.id);
    expect(res.body.data.variants[0].availableQty).toBe(7);
  });

  it("returns 404 for an unknown product slug", async () => {
    const res = await request(app).get("/api/products/does-not-exist");
    expect(res.status).toBe(404);
  });

  it("filters listing results by price range", async () => {
    await seedProductWithVariant({ priceCents: 5_000 }); // $50 — below range, should be excluded
    await seedProductWithVariant({ priceCents: 50_000 }); // $500 — within range
    const res = await request(app).get("/api/products").query({ minPrice: 100, maxPrice: 1000 });
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].priceCents).toBe(50_000);
  });

  it("rejects creating a product without authentication", async () => {
    const res = await request(app).post("/api/products").send({});
    expect(res.status).toBe(401);
  });
});
