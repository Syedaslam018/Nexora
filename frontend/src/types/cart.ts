export interface CartItem {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  sku: string;
  thumbnailUrl: string | null;
  unitPriceCents: number;
  quantity: number;
  availableQty: number;
  lineTotalCents: number;
}

export interface CartPricing {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  freeShippingApplied: boolean;
}

export interface Cart {
  id: string;
  items: CartItem[];
  coupon: { code: string; type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING" } | null;
  pricing: CartPricing;
}

/** A guest cart line — denormalized/snapshotted at add-time since there's
 * no server-side cart to join against for a logged-out user. */
export interface GuestCartItem {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  sku: string;
  thumbnailUrl: string | null;
  unitPriceCents: number;
  quantity: number;
  maxQty: number;
}
