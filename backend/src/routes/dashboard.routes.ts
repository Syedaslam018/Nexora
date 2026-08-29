import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

export const dashboardRouter = Router();

dashboardRouter.use(authenticate, authorize("ADMIN", "STAFF"));

dashboardRouter.get("/metrics", dashboardController.metrics);
dashboardRouter.get("/revenue-over-time", dashboardController.revenueOverTime);
dashboardRouter.get("/orders-over-time", dashboardController.ordersOverTime);
dashboardRouter.get("/sales-by-category", dashboardController.salesByCategory);
dashboardRouter.get("/top-products", dashboardController.topProducts);
dashboardRouter.get("/customer-growth", dashboardController.customerGrowth);
dashboardRouter.get("/order-status-distribution", dashboardController.orderStatusDistribution);
