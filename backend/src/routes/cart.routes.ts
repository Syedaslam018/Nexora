import { Router } from "express";
import { cartController } from "../controllers/cart.controller.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import {
  addCartItemSchema,
  updateCartItemSchema,
  cartItemParamsSchema,
  applyCouponSchema,
  mergeGuestCartSchema,
} from "../schemas/cart.schema.js";

export const cartRouter = Router();

cartRouter.use(authenticate); // every cart route requires a logged-in user

cartRouter.get("/", cartController.get);
cartRouter.post("/items", validate({ body: addCartItemSchema }), cartController.addItem);
cartRouter.patch(
  "/items/:variantId",
  validate({ params: cartItemParamsSchema, body: updateCartItemSchema }),
  cartController.updateItem,
);
cartRouter.delete(
  "/items/:variantId",
  validate({ params: cartItemParamsSchema }),
  cartController.removeItem,
);
cartRouter.post("/coupon", validate({ body: applyCouponSchema }), cartController.applyCoupon);
cartRouter.delete("/coupon", cartController.removeCoupon);
cartRouter.post("/merge", validate({ body: mergeGuestCartSchema }), cartController.merge);
