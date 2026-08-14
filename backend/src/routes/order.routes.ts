import { Router } from "express";
import { orderController } from "../controllers/order.controller.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { createOrderSchema, orderParamsSchema } from "../schemas/order.schema.js";

export const orderRouter = Router();

orderRouter.use(authenticate);

orderRouter.post("/", validate({ body: createOrderSchema }), orderController.create);
orderRouter.get("/:id", validate({ params: orderParamsSchema }), orderController.detail);

// GET / (list with pagination/filtering), PATCH /:id/status, cancel, refund,
// invoice download, and reorder all land in Phase 7 alongside the full
// customer order-management UI.
