import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "../../src/utils/ApiError.js";

const { findByCode, countTotalUsages, countUserUsages } = vi.hoisted(() => ({
  findByCode: vi.fn(),
  countTotalUsages: vi.fn(),
  countUserUsages: vi.fn(),
}));

vi.mock("../../src/repositories/coupon.repository.js", () => ({
  couponRepository: { findByCode, countTotalUsages, countUserUsages },
}));

const { couponService } = await import("../../src/services/coupon.service.js");

function baseCoupon(overrides: Record<string, unknown> = {}) {
  return {
    id: "coupon-1",
    code: "SAVE10",
    type: "PERCENTAGE",
    value: 10,
    minOrderValueCents: null,
    usageLimit: null,
    perUserLimit: null,
    isActive: true,
    startsAt: new Date("2020-01-01"),
    expiresAt: new Date("2999-01-01"),
    products: [],
    categories: [],
    ...overrides,
  };
}

describe("couponService.validateForUser", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("rejects an unknown code", async () => {
    findByCode.mockResolvedValue(null);
    await expect(couponService.validateForUser("NOPE", "user-1", 10_000)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects an inactive coupon", async () => {
    findByCode.mockResolvedValue(baseCoupon({ isActive: false }));
    await expect(couponService.validateForUser("SAVE10", "user-1", 10_000)).rejects.toBeInstanceOf(
      ApiError,
    );
  });

  it("rejects a coupon that hasn't started yet", async () => {
    findByCode.mockResolvedValue(baseCoupon({ startsAt: new Date("2999-01-01"), expiresAt: new Date("2999-06-01") }));
    await expect(couponService.validateForUser("SAVE10", "user-1", 10_000)).rejects.toMatchObject({
      message: expect.stringContaining("expired or is not yet active"),
    });
  });

  it("rejects an expired coupon", async () => {
    findByCode.mockResolvedValue(baseCoupon({ startsAt: new Date("2020-01-01"), expiresAt: new Date("2020-06-01") }));
    await expect(couponService.validateForUser("SAVE10", "user-1", 10_000)).rejects.toMatchObject({
      message: expect.stringContaining("expired or is not yet active"),
    });
  });

  it("rejects when the total usage limit has been reached", async () => {
    findByCode.mockResolvedValue(baseCoupon({ usageLimit: 5 }));
    countTotalUsages.mockResolvedValue(5);
    await expect(couponService.validateForUser("SAVE10", "user-1", 10_000)).rejects.toMatchObject({
      message: expect.stringContaining("usage limit"),
    });
  });

  it("allows when total usages are below the limit", async () => {
    findByCode.mockResolvedValue(baseCoupon({ usageLimit: 5 }));
    countTotalUsages.mockResolvedValue(4);
    await expect(couponService.validateForUser("SAVE10", "user-1", 10_000)).resolves.toBeDefined();
  });

  it("rejects when this user has already used it the max number of times", async () => {
    findByCode.mockResolvedValue(baseCoupon({ perUserLimit: 1 }));
    countUserUsages.mockResolvedValue(1);
    await expect(couponService.validateForUser("SAVE10", "user-1", 10_000)).rejects.toMatchObject({
      message: expect.stringContaining("maximum number of times"),
    });
  });

  it("rejects when the cart subtotal is below the coupon's minimum order value", async () => {
    findByCode.mockResolvedValue(baseCoupon({ minOrderValueCents: 5_000 }));
    await expect(couponService.validateForUser("SAVE10", "user-1", 4_999)).rejects.toMatchObject({
      message: expect.stringContaining("minimum order"),
    });
  });

  it("allows when the subtotal meets the minimum order value exactly", async () => {
    findByCode.mockResolvedValue(baseCoupon({ minOrderValueCents: 5_000 }));
    await expect(couponService.validateForUser("SAVE10", "user-1", 5_000)).resolves.toBeDefined();
  });

  it("uppercases and trims the code before lookup", async () => {
    findByCode.mockResolvedValue(baseCoupon());
    await couponService.validateForUser("  save10  ", "user-1", 1_000);
    expect(findByCode).toHaveBeenCalledWith("SAVE10");
  });

  it("returns the full coupon (with restrictions) when everything checks out", async () => {
    const coupon = baseCoupon();
    findByCode.mockResolvedValue(coupon);
    const result = await couponService.validateForUser("SAVE10", "user-1", 1_000);
    expect(result).toBe(coupon);
  });
});
