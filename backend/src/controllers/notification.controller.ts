import type { Request, Response } from "express";
import { notificationService } from "../services/notification.service.js";
import { sendSuccess, sendPaginated } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { NotificationListQuery } from "../schemas/notification.schema.js";

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as NotificationListQuery;
    const { items, meta } = await notificationService.listForUser(req.user!.id, query.unreadOnly, {
      page: query.page,
      pageSize: query.pageSize,
    });
    sendPaginated(res, items, meta, "Notifications retrieved");
  }),

  unreadCount: asyncHandler(async (req: Request, res: Response) => {
    const count = await notificationService.unreadCount(req.user!.id);
    sendSuccess(res, { count }, "Unread count retrieved");
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await notificationService.markRead(req.user!.id, id);
    sendSuccess(res, null, "Notification marked as read");
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markAllRead(req.user!.id);
    sendSuccess(res, null, "All notifications marked as read");
  }),
};
