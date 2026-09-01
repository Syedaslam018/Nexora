import { Router } from "express";
import { brandController } from "../controllers/brand.controller.js";
import { validate } from "../middleware/validate.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { cacheControl } from "../middleware/cacheControl.js";
import { createBrandSchema } from "../schemas/product.schema.js";

export const brandRouter = Router();

brandRouter.get("/", cacheControl(300), brandController.list);

brandRouter.post(
  "/",
  authenticate,
  authorize("ADMIN", "STAFF"),
  validate({ body: createBrandSchema }),
  brandController.create,
);
brandRouter.patch("/:id", authenticate, authorize("ADMIN", "STAFF"), brandController.update);
