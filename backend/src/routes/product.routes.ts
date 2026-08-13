import { Router } from "express";
import { productController } from "../controllers/product.controller.js";
import { validate } from "../middleware/validate.js";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  productListQuerySchema,
  productIdentifierParamsSchema,
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.schema.js";

export const productRouter = Router();

// Public storefront reads
productRouter.get("/", validate({ query: productListQuerySchema }), productController.list);
productRouter.get("/by-ids", productController.byIds); // for "recently viewed" hydration
productRouter.get(
  "/:idOrSlug",
  validate({ params: productIdentifierParamsSchema }),
  productController.detail,
);

// Admin/staff writes — backend is the RBAC boundary regardless of what the
// frontend shows (see middleware/auth.ts).
productRouter.post(
  "/",
  authenticate,
  authorize("ADMIN", "STAFF"),
  validate({ body: createProductSchema }),
  productController.create,
);
productRouter.patch(
  "/:idOrSlug",
  authenticate,
  authorize("ADMIN", "STAFF"),
  validate({ params: productIdentifierParamsSchema, body: updateProductSchema }),
  productController.update,
);
productRouter.delete(
  "/:idOrSlug",
  authenticate,
  authorize("ADMIN", "STAFF"),
  validate({ params: productIdentifierParamsSchema }),
  productController.archive,
);
