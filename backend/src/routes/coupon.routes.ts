import { Router } from "express";
import { couponController } from "../controllers/coupon.controller.js";
import { validate } from "../middleware/validate.js";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  createCouponSchema,
  updateCouponSchema,
  couponParamsSchema,
  couponListQuerySchema,
} from "../schemas/coupon.schema.js";

export const adminCouponRouter = Router();

adminCouponRouter.use(authenticate, authorize("ADMIN", "STAFF"));

adminCouponRouter.get("/", validate({ query: couponListQuerySchema }), couponController.list);
adminCouponRouter.post("/", validate({ body: createCouponSchema }), couponController.create);
adminCouponRouter.patch(
  "/:id",
  validate({ params: couponParamsSchema, body: updateCouponSchema }),
  couponController.update,
);
adminCouponRouter.delete("/:id", validate({ params: couponParamsSchema }), couponController.remove);
