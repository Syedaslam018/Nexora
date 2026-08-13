import { Router } from "express";
import { categoryController } from "../controllers/category.controller.js";
import { validate } from "../middleware/validate.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { createCategorySchema } from "../schemas/product.schema.js";

export const categoryRouter = Router();

categoryRouter.get("/", categoryController.tree); // nested tree, for nav/filters
categoryRouter.get("/flat", categoryController.flat); // flat list, for admin dropdowns

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
