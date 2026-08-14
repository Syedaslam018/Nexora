import type Stripe from "stripe";
import { stripe } from "../config/stripe.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export const paymentService = {
  /**
   * Amount is always computed server-side (`pricing.service.ts`) and passed
   * in — this function never accepts a client-supplied amount, so there's
   * no path where a tampered frontend request changes what Stripe charges.
   */
  async createPaymentIntent(amountCents: number, orderId: string, orderNumber: string) {
    return stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      metadata: { orderId, orderNumber },
      automatic_payment_methods: { enabled: true },
    });
  },

  async cancelPaymentIntent(paymentIntentId: string) {
    try {
      await stripe.paymentIntents.cancel(paymentIntentId);
    } catch {
      // Already succeeded/canceled/doesn't exist — nothing more to do; the
      // caller's own state (Order/Payment rows) is the source of truth.
    }
  },

  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    try {
      return stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      throw ApiError.badRequest(
        `Webhook signature verification failed: ${(err as Error).message}`,
      );
    }
  },
};
