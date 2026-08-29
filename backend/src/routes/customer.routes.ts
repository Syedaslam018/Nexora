import { Router } from "express";
import { customerController } from "../controllers/customer.controller.js";
import { validate } from "../middleware/validate.js";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  customerListQuerySchema,
  customerParamsSchema,
  setCustomerActiveSchema,
  setCustomerRoleSchema,
} from "../schemas/customer.schema.js";

export const customerRouter = Router();

customerRouter.use(authenticate, authorize("ADMIN", "STAFF"));

customerRouter.get("/", validate({ query: customerListQuerySchema }), customerController.list);
customerRouter.get("/:id", validate({ params: customerParamsSchema }), customerController.detail);
customerRouter.patch(
  "/:id/active",
  validate({ params: customerParamsSchema, body: setCustomerActiveSchema }),
  customerController.setActive,
);

// Role changes are sensitive enough to restrict to ADMIN even though the
// rest of this router allows STAFF.
customerRouter.patch(
  "/:id/role",
  authorize("ADMIN"),
  validate({ params: customerParamsSchema, body: setCustomerRoleSchema }),
  customerController.setRole,
);
