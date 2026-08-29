import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  assertBelongsToUser: vi.fn(),
  findByUserId: vi.fn(),
  generateOrderNumber: vi.fn(),
  transaction: vi.fn(),
  clearCart: vi.fn(),
  createPaymentIntent: vi.fn(),
  notifyUser: vi.fn(),
  notifyAdmins: vi.fn(),
  emitToAdmins: vi.fn(),
  txOrderCreate: vi.fn(),
  txStatusHistoryCreate: vi.fn(),
  txInventoryUpdateMany: vi.fn(),
  txInventoryTransactionCreate: vi.fn(),
  txCouponUsageCreate: vi.fn(),
  txPaymentCreate: vi.fn(),
}));

vi.mock("../../src/services/address.service.js", () => ({
  addressService: { assertBelongsToUser: mocks.assertBelongsToUser },
}));
vi.mock("../../src/repositories/cart.repository.js", () => ({
  cartRepository: { findByUserId: mocks.findByUserId },
}));
vi.mock("../../src/repositories/order.repository.js", () => ({
  orderRepository: {
    generateOrderNumber: mocks.generateOrderNumber,
    findById: vi.fn(),
    findByIdForUser: vi.fn(),
  },
}));
vi.mock("../../src/services/cart.service.js", () => ({
  cartService: { clearCart: mocks.clearCart },
}));
vi.mock("../../src/services/payment.service.js", () => ({
  paymentService: { createPaymentIntent: mocks.createPaymentIntent },
}));
vi.mock("../../src/services/notification.service.js", () => ({
  notificationService: { notifyUser: mocks.notifyUser, notifyAdmins: mocks.notifyAdmins },
}));
vi.mock("../../src/sockets/index.js", () => ({ emitToAdmins: mocks.emitToAdmins }));
vi.mock("../../src/config/db.js", () => ({
  prisma: {
    $transaction: mocks.transaction,
    payment: { update: vi.fn() },
  },
}));

const { orderService } = await import("../../src/services/order.service.js");

const ADDRESS = { id: "addr-1", userId: "user-1" };

function cartItem(overrides: Record<string, unknown> = {}) {
  return {
    variantId: "variant-1",
    quantity: 1,
    variant: {
      id: "variant-1",
      isActive: true,
      priceCents: null,
      name: "Default",
      sku: "SKU-1",
      product: { id: "prod-1", name: "NEXORA Widget", isActive: true, basePriceCents: 2_000, categoryId: "cat-1" },
      inventory: { availableQty: 5, lowStockThreshold: 2 },
    },
    ...overrides,
  };
}

function cartFixture(items: ReturnType<typeof cartItem>[]) {
  return { id: "cart-1", userId: "user-1", couponId: null, coupon: null, items };
}

const txMock = {
  order: { create: mocks.txOrderCreate },
  orderStatusHistory: { create: mocks.txStatusHistoryCreate },
  inventory: { updateMany: mocks.txInventoryUpdateMany, update: vi.fn() },
  inventoryTransaction: { create: mocks.txInventoryTransactionCreate },
  couponUsage: { create: mocks.txCouponUsageCreate },
  payment: { create: mocks.txPaymentCreate },
};

describe("orderService.createOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertBelongsToUser.mockResolvedValue(ADDRESS);
    mocks.generateOrderNumber.mockReturnValue("NEX-20260101-ABC123");
    mocks.transaction.mockImplementation(async (callback: (tx: typeof txMock) => unknown) => callback(txMock));
    mocks.txOrderCreate.mockResolvedValue({
      id: "order-1",
      items: [
        {
          variantId: "variant-1",
          quantity: 1,
          productNameSnapshot: "NEXORA Widget",
        },
      ],
    });
    mocks.txInventoryUpdateMany.mockResolvedValue({ count: 1 });
    mocks.txPaymentCreate.mockResolvedValue({ id: "payment-1" });
    mocks.clearCart.mockResolvedValue(undefined);
  });

  it("rejects when the cart is empty", async () => {
    mocks.findByUserId.mockResolvedValue(cartFixture([]));
    await expect(
      orderService.createOrder("user-1", {
        shippingAddressId: "addr-1",
        paymentMethod: "COD",
        deliveryMethod: "STANDARD",
      }),
    ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("empty") });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects when a cart item's variant is no longer active", async () => {
    mocks.findByUserId.mockResolvedValue(cartFixture([cartItem({ variant: { ...cartItem().variant, isActive: false } })]));
    await expect(
      orderService.createOrder("user-1", {
        shippingAddressId: "addr-1",
        paymentMethod: "COD",
        deliveryMethod: "STANDARD",
      }),
    ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("no longer available") });
  });

  it("rejects when requested quantity exceeds current stock", async () => {
    mocks.findByUserId.mockResolvedValue(
      cartFixture([cartItem({ quantity: 10, variant: { ...cartItem().variant, inventory: { availableQty: 2, lowStockThreshold: 1 } } })]),
    );
    await expect(
      orderService.createOrder("user-1", {
        shippingAddressId: "addr-1",
        paymentMethod: "COD",
        deliveryMethod: "STANDARD",
      }),
    ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("left in stock") });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("creates a COD order, decrements stock as SOLD immediately, and clears the cart", async () => {
    mocks.findByUserId.mockResolvedValue(cartFixture([cartItem()]));

    const result = await orderService.createOrder("user-1", {
      shippingAddressId: "addr-1",
      paymentMethod: "COD",
      deliveryMethod: "STANDARD",
    });

    expect(mocks.txOrderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "CONFIRMED", paymentMethod: "COD" }),
      }),
    );
    expect(mocks.txInventoryUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          availableQty: { decrement: 1 },
          soldQty: { increment: 1 },
        }),
      }),
    );
    expect(mocks.txInventoryTransactionCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: "STOCK_SOLD" }) }),
    );
    expect(mocks.clearCart).toHaveBeenCalledWith("user-1");
    expect(result.clientSecret).toBeNull();
    expect(result.order.id).toBe("order-1");
  });

  it("reserves stock (not sold) for a Stripe order pending payment", async () => {
    mocks.findByUserId.mockResolvedValue(cartFixture([cartItem()]));
    mocks.createPaymentIntent.mockResolvedValue({ id: "pi_123", client_secret: "secret_abc" });

    const result = await orderService.createOrder("user-1", {
      shippingAddressId: "addr-1",
      paymentMethod: "STRIPE",
      deliveryMethod: "STANDARD",
    });

    expect(mocks.txOrderCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "PENDING", paymentMethod: "STRIPE" }) }),
    );
    expect(mocks.txInventoryUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          availableQty: { decrement: 1 },
          reservedQty: { increment: 1 },
        }),
      }),
    );
    expect(mocks.txInventoryTransactionCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: "STOCK_RESERVED" }) }),
    );
    expect(result.clientSecret).toBe("secret_abc");
  });

  it("surfaces a conflict when stock changes underneath a concurrent checkout", async () => {
    mocks.findByUserId.mockResolvedValue(cartFixture([cartItem()]));
    mocks.txInventoryUpdateMany.mockResolvedValue({ count: 0 }); // the atomic guard found insufficient stock

    await expect(
      orderService.createOrder("user-1", {
        shippingAddressId: "addr-1",
        paymentMethod: "COD",
        deliveryMethod: "STANDARD",
      }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});
