import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | undefined;

/** Loads Stripe.js exactly once and caches the promise — every component
 * that needs Stripe imports this instead of calling loadStripe directly. */
export function getStripe() {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      // eslint-disable-next-line no-console
      console.warn("VITE_STRIPE_PUBLISHABLE_KEY is not set — Stripe checkout will not work.");
    }
    stripePromise = loadStripe(key ?? "");
  }
  return stripePromise;
}
