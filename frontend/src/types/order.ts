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
}

export interface CreateOrderInput {
  shippingAddressId: string;
  billingAddressId?: string;
  paymentMethod: "COD" | "STRIPE";
  deliveryMethod: "STANDARD" | "EXPRESS";
  notes?: string;
}

export interface CreateOrderResult {
  order: Order;
  clientSecret: string | null;
}
