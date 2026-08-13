import { Router } from "express";
import { healthRouter } from "./health.routes.js";

/**
 * Every domain router (auth, products, cart, orders, admin, ...) is mounted
 * here as it's built in later phases, e.g.:
 *   apiRouter.use("/auth", authRouter);
 *   apiRouter.use("/products", productsRouter);
 * Keeping this file as the single mounting point means app.ts never grows
 * unbounded as the API surface grows.
 */
export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
