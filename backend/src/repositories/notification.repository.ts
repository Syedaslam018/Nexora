import { prisma } from "../config/db.js";
import type { NotificationType } from "@prisma/client";

export const notificationRepository = {
  create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, unknown>,
  ) {
    return prisma.notification.create({ data: { userId, type, title, message, metadata } });
  },

  /** One row per recipient — used for broadcast-style notifications (e.g.
   * low-stock alerts going to every admin/staff account) where each
   * recipient needs their own independent read state. */
  createMany(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, unknown>,
  ) {
    if (userIds.length === 0) return Promise.resolve({ count: 0 });
    return prisma.notification.createMany({
      data: userIds.map((userId) => ({ userId, type, title, message, metadata })),
    });
  },

  async findManyForUser(userId: string, unreadOnly: boolean, pagination: { page: number; pageSize: number }) {
    const where = { userId, ...(unreadOnly ? { isRead: false } : {}) };
    const [items, totalItems] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      prisma.notification.count({ where }),
    ]);
    return { items, totalItems };
  },

  unreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  },

  async markRead(userId: string, id: string) {
    const result = await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    return result.count > 0;
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  },
};
