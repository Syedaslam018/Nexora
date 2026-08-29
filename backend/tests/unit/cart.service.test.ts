import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  findByUserId: vi.fn(),
  createForUser: vi.fn(),
  findItem: vi.fn(),
  addOrIncrementItem: vi.fn(),
  setItemQuantity: vi.fn(),
  removeItem: vi.fn(),
  productVariantFindUnique: vi.fn(),
}));

vi.mock("../../src/repositories/cart.repository.js", () => ({
  cartRepository: {
    findByUserId: mocks.findByUserId,
    createForUser: mocks.createForUser,
    findItem: mocks.findItem,
    addOrIncrementItem: mocks.addOrIncrementItem,
    setItemQuantity: mocks.setItemQuantity,
    removeItem: mocks.removeItem,
    clearItems: vi.fn(),
    setCoupon: vi.fn(),
  },
}));
vi.mock("../../src/config/db.js", () => ({
  prisma: { productVariant: { findUnique: mocks.productVariantFindUnique } },
}));

const { cartService } = await import("../../src/services/cart.service.js");

const EMPTY_CART = { id: "cart-1", userId: "user-1", couponId: null, coupon: null, items: [] };

function activeVariant(overrides: Record<string, unknown> = {}) {
  return {
    id: "variant-1",
    isActive: true,
    priceCents: null,
    product: { id: "prod-1", isActive: true, basePriceCents: 2_000, categoryId: "cat-1" },
    inventory: { availableQty: 3 },
    ...overrides,
  };
}

describe("cartService.addItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findByUserId.mockResolvedValue(EMPTY_CART);
    mocks.findItem.mockResolvedValue(null);
  });

  it("rejects a variant that doesn't exist", async () => {
    mocks.productVariantFindUnique.mockResolvedValue(null);
    await expect(cartService.addItem("user-1", "variant-x", 1)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("rejects an inactive variant", async () => {
    mocks.productVariantFindUnique.mockResolvedValue(activeVariant({ isActive: false }));
    await expect(cartService.addItem("user-1", "variant-1", 1)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("rejects a variant whose product is inactive", async () => {
    mocks.productVariantFindUnique.mockResolvedValue(
      activeVariant({ product: { id: "prod-1", isActive: false, basePriceCents: 2_000, categoryId: "cat-1" } }),
    );
    await expect(cartService.addItem("user-1", "variant-1", 1)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("rejects when requesting more than available stock", async () => {
    mocks.productVariantFindUnique.mockResolvedValue(activeVariant({ inventory: { availableQty: 2 } }));
    await expect(cartService.addItem("user-1", "variant-1", 5)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining("Only 2 in stock"),
    });
    expect(mocks.addOrIncrementItem).not.toHaveBeenCalled();
  });

  it("reports out-of-stock distinctly when available quantity is zero", async () => {
    mocks.productVariantFindUnique.mockResolvedValue(activeVariant({ inventory: { availableQty: 0 } }));
    await expect(cartService.addItem("user-1", "variant-1", 1)).rejects.toMatchObject({
      message: "This item is out of stock",
    });
  });

  it("accounts for quantity already in the cart when checking stock", async () => {
    mocks.productVariantFindUnique.mockResolvedValue(activeVariant({ inventory: { availableQty: 3 } }));
    mocks.findItem.mockResolvedValue({ quantity: 2 }); // already have 2, requesting 2 more = 4 > 3 available
    await expect(cartService.addItem("user-1", "variant-1", 2)).rejects.toMatchObject({
      message: expect.stringContaining("you already have 2 in your cart"),
    });
  });

  it("adds the item when stock is sufficient", async () => {
    mocks.productVariantFindUnique.mockResolvedValue(activeVariant({ inventory: { availableQty: 5 } }));
    await cartService.addItem("user-1", "variant-1", 2);
    expect(mocks.addOrIncrementItem).toHaveBeenCalledWith("cart-1", "variant-1", 2);
  });
});
