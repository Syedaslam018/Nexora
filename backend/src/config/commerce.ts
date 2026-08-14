/**
 * These are deliberately simple, documented placeholder rules — the spec
 * doesn't define real tax jurisdictions or carrier-rate shipping, and
 * fabricating a fake "real" tax engine would be worse than being explicit
 * about a flat-rate placeholder. Swapping this for a real tax API (e.g.
 * Stripe Tax, TaxJar) or carrier rate lookup later only touches this file
 * and `pricing.service.ts` — nothing else assumes how these numbers are
 * derived.
 */
export const COMMERCE_RULES = {
  FLAT_TAX_RATE: 0.08, // 8% flat rate on the post-discount subtotal
  FLAT_SHIPPING_CENTS: 599, // $5.99 standard shipping
  FREE_SHIPPING_THRESHOLD_CENTS: 7500, // orders over $75 ship free (standard only)
  EXPRESS_SHIPPING_CENTS: 1999, // $19.99 flat — express ignores the free-shipping threshold
} as const;
