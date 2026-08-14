export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  productNameSnapshot: string;
  variantNameSnapshot: string;
  skuSnapshot: string;
  unitPriceCents: number;
  quantity: number;
  totalCents: number;
  product: { slug: string; isActive: boolean; isArchived: boolean };
}

export interface OrderStatusHistoryEntry {
  id: string;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  provider: "STRIPE" | "COD";
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
  amountCents: number;
}

export interface OrderAddress {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: "COD" | "STRIPE";
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
  payments: Payment[];
  statusHistory: OrderStatusHistoryEntry[];
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress | null;
}

export interface CreateOrderInput {
  shippingAddressId: string;
  billingAddressId?: string;
  paymentMethod: "COD" | "STRIPE";
  deliveryMethod: "STANDARD" | "EXPRESS";
  notes?: string;
}

export interface CreateOrderResult {
  /**
   * NOTE: this is NOT the full `Order` shape at runtime — the backend's
   * `POST /orders` response only includes `id`, `orderNumber`, `status`,
   * `paymentMethod`, the totals, and `items` (without `item.product`).
   * `shippingAddress`, `billingAddress`, `payments`, and `statusHistory`
   * are NOT populated here — only `GET /orders/:id` (used by
   * OrderConfirmationPage and OrderDetailPage) returns those. Don't read
   * them off this specific response; re-fetch the order by id instead.
   */
  order: Order;
  clientSecret: string | null;
}
