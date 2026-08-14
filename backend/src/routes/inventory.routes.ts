import { Router } from "express";
import { inventoryController } from "../controllers/inventory.controller.js";
import { validate } from "../middleware/validate.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { adjustStockSchema, variantParamsSchema } from "../schemas/inventory.schema.js";

export const inventoryRouter = Router();

inventoryRouter.use(authenticate, authorize("ADMIN", "STAFF"));

inventoryRouter.get("/low-stock", inventoryController.lowStock);
inventoryRouter.get(
  "/:variantId/history",
  validate({ params: variantParamsSchema }),
  inventoryController.transactions,
);
inventoryRouter.patch(
  "/:variantId/adjust",
  validate({ params: variantParamsSchema, body: adjustStockSchema }),
  inventoryController.adjust,
);
