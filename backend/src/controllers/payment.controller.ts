import type { Request, Response } from "express";
import type Stripe from "stripe";
import { paymentService } from "../services/payment.service.js";
import { orderService } from "../services/order.service.js";
import { logger } from "../config/logger.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const paymentController = {
  /**
   * Stripe is the source of truth for payment outcome — the frontend never
   * tells the backend "payment succeeded"; only a signature-verified event
   * from Stripe itself can move an order from PENDING to CONFIRMED/CANCELLED.
   * Mounted with `express.raw()` in app.ts (before the global JSON parser)
   * because signature verification needs the exact raw request bytes.
   */
  webhook: asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"];
    if (typeof signature !== "string") {
      res.status(400).json({ success: false, message: "Missing Stripe signature" });
      return;
    }

    const event = paymentService.constructWebhookEvent(req.body as Buffer, signature);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await orderService.confirmStripePayment(intent.id);
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const reason = intent.last_payment_error?.message ?? "Payment declined";
        await orderService.failStripePayment(intent.id, reason);
        break;
      }
      default:
        logger.debug({ type: event.type }, "Unhandled Stripe webhook event type");
    }

    // Stripe retries on any non-2xx — always acknowledge once we've
    // successfully parsed and routed the event, even if the event type
    // itself was one we ignore.
    res.status(200).json({ received: true });
  }),
};
