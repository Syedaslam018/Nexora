import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { authRouter } from "./auth.routes.js";
import { productRouter } from "./product.routes.js";
import { categoryRouter } from "./category.routes.js";
import { brandRouter } from "./brand.routes.js";

/**
 * Every domain router (cart, orders, admin, ...) is mounted here as it's
 * built in later phases, e.g. `apiRouter.use("/cart", cartRouter)`.
 * Keeping this file as the single mounting point means app.ts never grows
 * unbounded as the API surface grows.
 */
export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/brands", brandRouter);
