import { z } from "zod";

export const customerListQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});
export type CustomerListQuery = z.infer<typeof customerListQuerySchema>;

export const customerParamsSchema = z.object({ id: z.string().uuid() });

export const setCustomerActiveSchema = z.object({ isActive: z.boolean() });
export type SetCustomerActiveInput = z.infer<typeof setCustomerActiveSchema>;

export const setCustomerRoleSchema = z.object({ role: z.enum(["CUSTOMER", "STAFF", "ADMIN"]) });
export type SetCustomerRoleInput = z.infer<typeof setCustomerRoleSchema>;
