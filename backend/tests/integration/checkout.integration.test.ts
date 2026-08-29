import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, resetDatabase, registerAndLogin, seedProductWithVariant, seedAddress } from "./helpers.js";
import { prisma } from "../../src/config/db.js";

function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

describe("Cart + Checkout flow", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("starts with an empty cart for a new user", async () => {
    const { accessToken } = await registerAndLogin();
    const res = await request(app).get("/api/cart").set(auth(accessToken));
    expect(res.status).toBe(200);
    expect(res.body.data.items).toEqual([]);
    expect(res.body.data.pricing.totalCents).toBe(0);
  });

  it("adds an item to the cart and computes pricing", async () => {
    const { accessToken } = await registerAndLogin();
    const { variant } = await seedProductWithVariant({ priceCents: 10_000, availableQty: 5 });

    const res = await request(app)
      .post("/api/cart/items")
      .set(auth(accessToken))
      .send({ variantId: variant.id, quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.pricing.subtotalCents).toBe(20_000);
  });

  it("rejects adding more than available stock", async () => {
    const { accessToken } = await registerAndLogin();
    const { variant } = await seedProductWithVariant({ availableQty: 2 });

    const res = await request(app)
      .post("/api/cart/items")
      .set(auth(accessToken))
      .send({ variantId: variant.id, quantity: 5 });

    expect(res.status).toBe(400);
  });

  it("places a Cash-on-Delivery order end-to-end and decrements real inventory", async () => {
    const { accessToken, userId } = await registerAndLogin();
    const { variant } = await seedProductWithVariant({ priceCents: 15_000, availableQty: 10 });
    const address = await seedAddress(userId);

    await request(app)
      .post("/api/cart/items")
      .set(auth(accessToken))
      .send({ variantId: variant.id, quantity: 3 });

    const orderRes = await request(app)
      .post("/api/orders")
      .set(auth(accessToken))
      .send({
        shippingAddressId: address.id,
        paymentMethod: "COD",
        deliveryMethod: "STANDARD",
      });

    expect(orderRes.status).toBe(201);
    expect(orderRes.body.data.order.status).toBe("CONFIRMED");
    expect(orderRes.body.data.clientSecret).toBeNull();

    // Inventory really decremented in the database, not just in the response.
    const inventory = await prisma.inventory.findUnique({ where: { variantId: variant.id } });
    expect(inventory?.availableQty).toBe(7); // 10 - 3
    expect(inventory?.soldQty).toBe(3);

    // The cart is empty again after checkout.
    const cartRes = await request(app).get("/api/cart").set(auth(accessToken));
    expect(cartRes.body.data.items).toEqual([]);

    // The order shows up in the user's own order history.
    const historyRes = await request(app).get("/api/orders").set(auth(accessToken));
    expect(historyRes.body.data.items).toHaveLength(1);
    expect(historyRes.body.data.items[0].id).toBe(orderRes.body.data.order.id);
  });

  it("rejects checkout with an empty cart", async () => {
    const { accessToken, userId } = await registerAndLogin();
    const address = await seedAddress(userId);

    const res = await request(app)
      .post("/api/orders")
      .set(auth(accessToken))
      .send({ shippingAddressId: address.id, paymentMethod: "COD", deliveryMethod: "STANDARD" });

    expect(res.status).toBe(400);
  });

  it("rejects checkout with another user's address", async () => {
    const { accessToken } = await registerAndLogin();
    const otherUser = await registerAndLogin();
    const otherUsersAddress = await seedAddress(otherUser.userId);
    const { variant } = await seedProductWithVariant();

    await request(app).post("/api/cart/items").set(auth(accessToken)).send({ variantId: variant.id, quantity: 1 });

    const res = await request(app)
      .post("/api/orders")
      .set(auth(accessToken))
      .send({ shippingAddressId: otherUsersAddress.id, paymentMethod: "COD", deliveryMethod: "STANDARD" });

    expect(res.status).toBe(404);
  });

  it("applies a valid coupon to the cart and reflects the discount in order totals", async () => {
    const { accessToken, userId } = await registerAndLogin();
    const { variant } = await seedProductWithVariant({ priceCents: 20_000, availableQty: 5 });
    const address = await seedAddress(userId);

    await prisma.coupon.create({
      data: {
        code: "TESTSAVE",
        type: "PERCENTAGE",
        value: 10,
        startsAt: new Date(Date.now() - 86_400_000),
        expiresAt: new Date(Date.now() + 86_400_000),
        isActive: true,
      },
    });

    await request(app).post("/api/cart/items").set(auth(accessToken)).send({ variantId: variant.id, quantity: 1 });
    const couponRes = await request(app).post("/api/cart/coupon").set(auth(accessToken)).send({ code: "testsave" });
    expect(couponRes.status).toBe(200);
    expect(couponRes.body.data.pricing.discountCents).toBe(2_000); // 10% of 20,000

    const orderRes = await request(app)
      .post("/api/orders")
      .set(auth(accessToken))
      .send({ shippingAddressId: address.id, paymentMethod: "COD", deliveryMethod: "STANDARD" });

    expect(orderRes.status).toBe(201);
    expect(orderRes.body.data.order.discountCents).toBe(2_000);

    const usage = await prisma.couponUsage.findFirst({ where: { orderId: orderRes.body.data.order.id } });
    expect(usage).not.toBeNull();
  });
});
