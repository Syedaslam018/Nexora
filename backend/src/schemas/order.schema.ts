import { z } from "zod";

export const createOrderSchema = z.object({
  shippingAddressId: z.string().uuid(),
  billingAddressId: z.string().uuid().optional(),
  paymentMethod: z.enum(["COD", "STRIPE"]),
  deliveryMethod: z.enum(["STANDARD", "EXPRESS"]).default("STANDARD"),
  notes: z.string().trim().max(500).optional(),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const orderParamsSchema = z.object({ id: z.string().uuid() });

export const orderListQuerySchema = z.object({
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ])
    .optional(),
  search: z.string().trim().max(60).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
});
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;

export const cancelOrderSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
  note: z.string().trim().max(500).optional(),
});
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

