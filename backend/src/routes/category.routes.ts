import { Router } from "express";
import { categoryController } from "../controllers/category.controller.js";
import { validate } from "../middleware/validate.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { cacheControl } from "../middleware/cacheControl.js";
import { createCategorySchema } from "../schemas/product.schema.js";

export const categoryRouter = Router();

// Categories change rarely (an admin action, not every checkout) — a
// longer cache window than products is appropriate here.
categoryRouter.get("/", cacheControl(300), categoryController.tree); // nested tree, for nav/filters
categoryRouter.get("/flat", cacheControl(300), categoryController.flat); // flat list, for admin dropdowns

categoryRouter.post(
  "/",
  authenticate,
  authorize("ADMIN", "STAFF"),
  validate({ body: createCategorySchema }),
  categoryController.create,
);
categoryRouter.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "STAFF"),
  categoryController.update,
);
