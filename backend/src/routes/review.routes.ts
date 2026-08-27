import { Router } from "express";
import { reviewController } from "../controllers/review.controller.js";
import { validate } from "../middleware/validate.js";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  createReviewSchema,
  updateReviewSchema,
  reviewParamsSchema,
  productIdParamsSchema,
  reviewListQuerySchema,
  adminReviewListQuerySchema,
} from "../schemas/review.schema.js";

export const reviewRouter = Router();

reviewRouter.get(
  "/product/:productId",
  validate({ params: productIdParamsSchema, query: reviewListQuerySchema }),
  reviewController.listForProduct,
);

reviewRouter.get(
  "/product/:productId/mine",
  authenticate,
  validate({ params: productIdParamsSchema }),
  reviewController.myReviewForProduct,
);
reviewRouter.post("/", authenticate, validate({ body: createReviewSchema }), reviewController.create);
reviewRouter.patch(
  "/:id",
  authenticate,
  validate({ params: reviewParamsSchema, body: updateReviewSchema }),
  reviewController.update,
);
reviewRouter.delete(
  "/:id",
  authenticate,
  validate({ params: reviewParamsSchema }),
  reviewController.remove,
);

reviewRouter.get(
  "/admin/all",
  authenticate,
  authorize("ADMIN", "STAFF"),
  validate({ query: adminReviewListQuerySchema }),
  reviewController.adminList,
);
reviewRouter.patch(
  "/admin/:id/approve",
  authenticate,
  authorize("ADMIN", "STAFF"),
  validate({ params: reviewParamsSchema }),
  reviewController.approve,
);
reviewRouter.patch(
  "/admin/:id/hide",
  authenticate,
  authorize("ADMIN", "STAFF"),
  validate({ params: reviewParamsSchema }),
  reviewController.hide,
);
reviewRouter.delete(
  "/admin/:id",
  authenticate,
  authorize("ADMIN", "STAFF"),
  validate({ params: reviewParamsSchema }),
  reviewController.adminRemove,
);
