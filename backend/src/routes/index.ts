import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { authRouter } from "./auth.routes.js";
import { productRouter } from "./product.routes.js";
import { categoryRouter } from "./category.routes.js";
import { brandRouter } from "./brand.routes.js";
import { cartRouter } from "./cart.routes.js";
import { wishlistRouter } from "./wishlist.routes.js";
import { addressRouter } from "./address.routes.js";
import { orderRouter } from "./order.routes.js";
import { inventoryRouter } from "./inventory.routes.js";
import { reviewRouter } from "./review.routes.js";
import { adminCouponRouter } from "./coupon.routes.js";

/**
 * Every domain router (admin dashboard/customers, ...) is mounted here as
 * it's built in later phases, e.g. `apiRouter.use("/admin/analytics",
 * analyticsRouter)`. Keeping this file as the single mounting point means
 * app.ts never grows unbounded as the API surface grows. Note:
 * /api/payments/webhook is NOT here — it's mounted directly in app.ts,
 * ahead of the JSON body parser (see that file).
 */
export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/brands", brandRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/wishlist", wishlistRouter);
apiRouter.use("/addresses", addressRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/admin/inventory", inventoryRouter);
apiRouter.use("/reviews", reviewRouter);
apiRouter.use("/admin/coupons", adminCouponRouter);
