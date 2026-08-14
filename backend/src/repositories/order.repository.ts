import { prisma } from "../config/db.js";
import { randomBytes } from "node:crypto";
import type { OrderStatus, Prisma } from "@prisma/client";

const orderInclude = {
  items: { include: { product: { select: { slug: true, isActive: true, isArchived: true } } } },
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

  async findManyForUser(
    userId: string,
    filters: { status?: OrderStatus; search?: string },
    pagination: { page: number; pageSize: number },
  ) {
    const where: Prisma.OrderWhereInput = {
      userId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.search ? { orderNumber: { contains: filters.search, mode: "insensitive" } } : {}),
    };

    const [items, totalItems] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    return { items, totalItems };
  },

  generateOrderNumber(): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = randomBytes(3).toString("hex").toUpperCase();
    return `NEX-${datePart}-${randomPart}`;
  },
};
