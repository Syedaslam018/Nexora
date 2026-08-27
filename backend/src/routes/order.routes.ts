import { Router } from "express";
import { orderController } from "../controllers/order.controller.js";
import { validate } from "../middleware/validate.js";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  createOrderSchema,
  orderParamsSchema,
  orderListQuerySchema,
  cancelOrderSchema,
  updateOrderStatusSchema,
} from "../schemas/order.schema.js";

export const orderRouter = Router();

orderRouter.use(authenticate);

orderRouter.post("/", validate({ body: createOrderSchema }), orderController.create);
orderRouter.get("/", validate({ query: orderListQuerySchema }), orderController.list);
orderRouter.get("/:id", validate({ params: orderParamsSchema }), orderController.detail);
orderRouter.get("/:id/invoice", validate({ params: orderParamsSchema }), orderController.invoice);

orderRouter.post(
  "/:id/cancel",
  validate({ params: orderParamsSchema, body: cancelOrderSchema }),
  orderController.cancel,
);
orderRouter.post(
  "/:id/refund-request",
  validate({ params: orderParamsSchema, body: cancelOrderSchema }),
  orderController.requestRefund,
);
orderRouter.post("/:id/reorder", validate({ params: orderParamsSchema }), orderController.reorder);

// Admin/staff only — see order.service.ts's updateStatus doc comment for
// why this exists ahead of the full admin dashboard (Phase 9).
orderRouter.patch(
  "/:id/status",
  authorize("ADMIN", "STAFF"),
  validate({ params: orderParamsSchema, body: updateOrderStatusSchema }),
  orderController.updateStatus,
);
