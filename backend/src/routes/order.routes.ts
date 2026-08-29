import { Router } from "express";
import { orderController } from "../controllers/order.controller.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import {
  createOrderSchema,
  orderParamsSchema,
  orderListQuerySchema,
  cancelOrderSchema,
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

// Order status updates (admin/staff only) moved to adminOrder.routes.ts
// (/api/admin/orders/:id/status) now that Phase 9's admin surface exists —
// this file is purely customer-scoped (every route above is implicitly
// filtered to req.user's own orders).
