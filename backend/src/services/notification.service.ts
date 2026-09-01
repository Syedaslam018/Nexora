import { notificationRepository } from "../repositories/notification.repository.js";
import { prisma } from "../config/db.js";
import { emitToUser, emitToAdmins } from "../sockets/index.js";
import { paginationMeta } from "../utils/pagination.js";
import { ApiError } from "../utils/ApiError.js";
import type { NotificationType, Prisma } from "@prisma/client";

/**
 * Every notification is both persisted (Section 17: "unread/read states
 * should be persisted") AND pushed live over the socket the user's already
 * connected on — the socket push is what makes it show up instantly
 * without a refresh; the DB row is what makes it still be there, correctly
 * marked read/unread, the next time they open the notification center on
 * any device.
 */
export const notificationService = {
  async notifyUser(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    const notification = await notificationRepository.create(
      userId,
      type,
      title,
      message,
      metadata,
    );
    emitToUser(userId, "notification:new", notification);
    return notification;
  },

  /** Broadcasts to every admin/staff account: one persisted Notification
   * row per recipient (so each admin has their own independent read
   * state) plus one live socket event to the shared `admins` room. */
  async notifyAdmins(
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "STAFF"] }, isActive: true },
      select: { id: true },
    });
    await notificationRepository.createMany(
      admins.map((a) => a.id),
      type,
      title,
      message,
      metadata,
    );
    emitToAdmins("notification:new", {
      type,
      title,
      message,
      metadata,
      createdAt: new Date(),
    });
  },

  async listForUser(
    userId: string,
    unreadOnly: boolean,
    pagination: { page: number; pageSize: number },
  ) {
    const { items, totalItems } = await notificationRepository.findManyForUser(
      userId,
      unreadOnly,
      pagination,
    );
    return { items, meta: paginationMeta(totalItems, pagination) };
  },

  unreadCount(userId: string) {
    return notificationRepository.unreadCount(userId);
  },

  async markRead(userId: string, id: string) {
    const updated = await notificationRepository.markRead(userId, id);
    if (!updated) throw ApiError.notFound("Notification not found");
  },

  markAllRead(userId: string) {
    return notificationRepository.markAllRead(userId);
  },
};
