import { Router } from "express";
import { adminProductController } from "../controllers/adminProduct.controller.js";
import { validate } from "../middleware/validate.js";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  adminProductListQuerySchema,
  productIdParamsSchema,
  variantIdParamsSchema,
  imageIdParamsSchema,
  setActiveSchema,
  addVariantSchema,
  updateVariantSchema,
  addImageSchema,
} from "../schemas/product.schema.js";

export const adminProductRouter = Router();

adminProductRouter.use(authenticate, authorize("ADMIN", "STAFF"));

adminProductRouter.get("/", validate({ query: adminProductListQuerySchema }), adminProductController.list);

adminProductRouter.patch(
  "/:productId/active",
  validate({ params: productIdParamsSchema, body: setActiveSchema }),
  adminProductController.setActive,
);

adminProductRouter.post(
  "/:productId/variants",
  validate({ params: productIdParamsSchema, body: addVariantSchema }),
  adminProductController.addVariant,
);
adminProductRouter.patch(
  "/variants/:variantId",
  validate({ params: variantIdParamsSchema, body: updateVariantSchema }),
  adminProductController.updateVariant,
);

adminProductRouter.post(
  "/:productId/images",
  validate({ params: productIdParamsSchema, body: addImageSchema }),
  adminProductController.addImage,
);
adminProductRouter.delete(
  "/images/:imageId",
  validate({ params: imageIdParamsSchema }),
  adminProductController.removeImage,
);
