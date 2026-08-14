import { Router } from "express";
import { wishlistController } from "../controllers/wishlist.controller.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { wishlistProductParamsSchema, moveToCartSchema } from "../schemas/wishlist.schema.js";

export const wishlistRouter = Router();

wishlistRouter.use(authenticate);

wishlistRouter.get("/", wishlistController.get);
wishlistRouter.post(
  "/:productId",
  validate({ params: wishlistProductParamsSchema }),
  wishlistController.add,
);
wishlistRouter.delete(
  "/:productId",
  validate({ params: wishlistProductParamsSchema }),
  wishlistController.remove,
);
wishlistRouter.post(
  "/:productId/move-to-cart",
  validate({ params: wishlistProductParamsSchema, body: moveToCartSchema }),
  wishlistController.moveToCart,
);
