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
