import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  findInventoryByVariant: vi.fn(),
  adjustStock: vi.fn(),
  notifyAdmins: vi.fn(),
  emitToAdmins: vi.fn(),
}));

vi.mock("../../src/repositories/inventory.repository.js", () => ({
  inventoryRepository: {
    findLowStock: vi.fn(),
    findTransactionsForVariant: vi.fn(),
    findInventoryByVariant: mocks.findInventoryByVariant,
    adjustStock: mocks.adjustStock,
  },
}));
vi.mock("../../src/services/notification.service.js", () => ({
  notificationService: { notifyAdmins: mocks.notifyAdmins },
}));
vi.mock("../../src/sockets/index.js", () => ({
  emitToAdmins: mocks.emitToAdmins,
}));

const { inventoryService } = await import("../../src/services/inventory.service.js");

function inventoryFixture(overrides: Record<string, unknown> = {}) {
  return {
    variantId: "variant-1",
    availableQty: 10,
    lowStockThreshold: 5,
    variant: { name: "Black / 256GB", product: { name: "NEXORA Phone" } },
    ...overrides,
  };
}

describe("inventoryService.adjustStock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.adjustStock.mockResolvedValue({ availableQty: 0 });
  });

  it("rejects adjusting a variant with no inventory record", async () => {
    mocks.findInventoryByVariant.mockResolvedValue(null);
    await expect(inventoryService.adjustStock("variant-x", -1, "recount", "admin-1")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("rejects an adjustment that would push stock negative", async () => {
    mocks.findInventoryByVariant.mockResolvedValue(inventoryFixture({ availableQty: 3 }));
    await expect(inventoryService.adjustStock("variant-1", -10, "damaged units", "admin-1")).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining("negative"),
    });
    expect(mocks.adjustStock).not.toHaveBeenCalled();
  });

  it("requires a note (enforced by the route schema, but the service also always logs one)", async () => {
    mocks.findInventoryByVariant.mockResolvedValue(inventoryFixture());
    await inventoryService.adjustStock("variant-1", -2, "recount adjustment", "admin-1");
    expect(mocks.adjustStock).toHaveBeenCalledWith("variant-1", -2, "recount adjustment", "admin-1");
  });

  it("does NOT alert admins when stock stays above the low-stock threshold", async () => {
    mocks.findInventoryByVariant.mockResolvedValue(inventoryFixture({ availableQty: 10, lowStockThreshold: 5 }));
    await inventoryService.adjustStock("variant-1", -2, "sold at market", "admin-1"); // 10 -> 8, still > 5
    expect(mocks.notifyAdmins).not.toHaveBeenCalled();
    expect(mocks.emitToAdmins).not.toHaveBeenCalled();
  });

  it("alerts admins when an adjustment crosses the low-stock threshold", async () => {
    mocks.findInventoryByVariant.mockResolvedValue(inventoryFixture({ availableQty: 6, lowStockThreshold: 5 }));
    await inventoryService.adjustStock("variant-1", -3, "damaged units", "admin-1"); // 6 -> 3, crosses below 5
    expect(mocks.notifyAdmins).toHaveBeenCalledWith(
      "LOW_INVENTORY",
      expect.any(String),
      expect.stringContaining("3 units"),
      expect.objectContaining({ variantId: "variant-1", availableQty: 3 }),
    );
    expect(mocks.emitToAdmins).toHaveBeenCalledWith("inventory:low-stock", expect.objectContaining({ availableQty: 3 }));
  });

  it("does NOT re-alert when stock was already at/below the threshold before this adjustment", async () => {
    mocks.findInventoryByVariant.mockResolvedValue(inventoryFixture({ availableQty: 4, lowStockThreshold: 5 }));
    await inventoryService.adjustStock("variant-1", -1, "sold one more", "admin-1"); // 4 -> 3, already was <= 5
    expect(mocks.notifyAdmins).not.toHaveBeenCalled();
  });
});
