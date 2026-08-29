import { Router } from "express";
import { notificationController } from "../controllers/notification.controller.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { notificationListQuerySchema, notificationParamsSchema } from "../schemas/notification.schema.js";

export const notificationRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.get("/", validate({ query: notificationListQuerySchema }), notificationController.list);
notificationRouter.get("/unread-count", notificationController.unreadCount);
notificationRouter.patch(
  "/:id/read",
  validate({ params: notificationParamsSchema }),
  notificationController.markRead,
);
notificationRouter.patch("/read-all", notificationController.markAllRead);
