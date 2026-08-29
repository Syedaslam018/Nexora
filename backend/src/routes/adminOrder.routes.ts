import { Router } from "express";
import { adminOrderController } from "../controllers/adminOrder.controller.js";
import { validate } from "../middleware/validate.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { orderListQuerySchema, orderParamsSchema, updateOrderStatusSchema } from "../schemas/order.schema.js";

export const adminOrderRouter = Router();

adminOrderRouter.use(authenticate, authorize("ADMIN", "STAFF"));

adminOrderRouter.get("/", validate({ query: orderListQuerySchema }), adminOrderController.list);
adminOrderRouter.get("/:id", validate({ params: orderParamsSchema }), adminOrderController.detail);
adminOrderRouter.patch(
  "/:id/status",
  validate({ params: orderParamsSchema, body: updateOrderStatusSchema }),
  adminOrderController.updateStatus,
);
