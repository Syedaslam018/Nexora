import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  paymentIntentsCreate: vi.fn(),
  paymentIntentsCancel: vi.fn(),
  refundsCreate: vi.fn(),
  webhooksConstructEvent: vi.fn(),
}));

vi.mock("../../src/config/stripe.js", () => ({
  stripe: {
    paymentIntents: { create: mocks.paymentIntentsCreate, cancel: mocks.paymentIntentsCancel },
    refunds: { create: mocks.refundsCreate },
    webhooks: { constructEvent: mocks.webhooksConstructEvent },
  },
}));

const { paymentService } = await import("../../src/services/payment.service.js");

describe("paymentService.createPaymentIntent", () => {
  beforeEach(() => vi.clearAllMocks());

  it("passes the exact server-computed amount through to Stripe, in cents", async () => {
    mocks.paymentIntentsCreate.mockResolvedValue({ id: "pi_123", client_secret: "secret" });
    await paymentService.createPaymentIntent(15_999, "order-1", "NEX-20260101-ABC");
    expect(mocks.paymentIntentsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 15_999, currency: "usd" }),
    );
  });

  it("tags the PaymentIntent with order metadata for webhook lookup", async () => {
    mocks.paymentIntentsCreate.mockResolvedValue({ id: "pi_123" });
    await paymentService.createPaymentIntent(1_000, "order-42", "NEX-ORDER-42");
    expect(mocks.paymentIntentsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: { orderId: "order-42", orderNumber: "NEX-ORDER-42" } }),
    );
  });
});

describe("paymentService.constructWebhookEvent", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the verified event on a valid signature", () => {
    const fakeEvent = { type: "payment_intent.succeeded" };
    mocks.webhooksConstructEvent.mockReturnValue(fakeEvent);
    const result = paymentService.constructWebhookEvent(Buffer.from("{}"), "valid-sig");
    expect(result).toBe(fakeEvent);
  });

  it("wraps a signature verification failure in an ApiError instead of throwing Stripe's raw error", () => {
    mocks.webhooksConstructEvent.mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature for payload");
    });
    expect(() => paymentService.constructWebhookEvent(Buffer.from("{}"), "bad-sig")).toThrowError(
      expect.objectContaining({ statusCode: 400 }),
    );
  });
});

describe("paymentService.cancelPaymentIntent", () => {
  it("swallows errors — an already-terminal PaymentIntent is not this function's problem to report", async () => {
    mocks.paymentIntentsCancel.mockRejectedValue(new Error("already succeeded"));
    await expect(paymentService.cancelPaymentIntent("pi_123")).resolves.toBeUndefined();
  });
});

describe("paymentService.refundPayment", () => {
  it("refunds by PaymentIntent id", async () => {
    mocks.refundsCreate.mockResolvedValue({ id: "re_123", status: "succeeded" });
    const result = await paymentService.refundPayment("pi_123");
    expect(mocks.refundsCreate).toHaveBeenCalledWith({ payment_intent: "pi_123" });
    expect(result.id).toBe("re_123");
  });
});
