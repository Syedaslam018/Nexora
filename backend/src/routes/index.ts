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
import { dashboardRouter } from "./dashboard.routes.js";
import { adminProductRouter } from "./adminProduct.routes.js";
import { adminOrderRouter } from "./adminOrder.routes.js";
import { customerRouter } from "./customer.routes.js";
import { analyticsRouter } from "./analytics.routes.js";

/**
 * Every domain router is mounted here. Keeping this file as the single
 * mounting point means app.ts never grows unbounded as the API surface
 * grows. Note: /api/payments/webhook is NOT here — it's mounted directly
 * in app.ts, ahead of the JSON body parser (see that file).
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
apiRouter.use("/admin/dashboard", dashboardRouter);
apiRouter.use("/admin/products", adminProductRouter);
apiRouter.use("/admin/orders", adminOrderRouter);
apiRouter.use("/admin/customers", customerRouter);
apiRouter.use("/admin/analytics", analyticsRouter);
