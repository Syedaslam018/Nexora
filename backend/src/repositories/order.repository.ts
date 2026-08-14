import { prisma } from "../config/db.js";
import { randomBytes } from "node:crypto";

const orderInclude = {
  items: true,
  payments: true,
  statusHistory: { orderBy: { createdAt: "asc" as const } },
  shippingAddress: true,
  billingAddress: true,
} as const;

export const orderRepository = {
  findByIdForUser(id: string, userId: string) {
    return prisma.order.findFirst({ where: { id, userId }, include: orderInclude });
  },

  /** No `userId` filter — used by admin views (Phase 9) and internally by
   * the webhook handler, which has no request-scoped user at all. */
  findById(id: string) {
    return prisma.order.findUnique({ where: { id }, include: orderInclude });
  },

  findByStripePaymentIntentId(paymentIntentId: string) {
    return prisma.order.findFirst({
      where: { payments: { some: { stripePaymentIntentId: paymentIntentId } } },
      include: orderInclude,
    });
  },

  generateOrderNumber(): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = randomBytes(3).toString("hex").toUpperCase();
    return `NEX-${datePart}-${randomPart}`;
  },
};
