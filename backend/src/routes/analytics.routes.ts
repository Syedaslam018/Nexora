import { Router } from "express";
import { analyticsController } from "../controllers/analytics.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

export const analyticsRouter = Router();

analyticsRouter.use(authenticate, authorize("ADMIN", "STAFF"));

analyticsRouter.get("/top-customers", analyticsController.topCustomers);
analyticsRouter.get("/monthly-revenue", analyticsController.monthlyRevenue);
analyticsRouter.get("/best-selling-products", analyticsController.bestSellingProducts);
analyticsRouter.get("/average-order-value-by-month", analyticsController.averageOrderValueByMonth);
analyticsRouter.get("/monthly-new-vs-returning", analyticsController.monthlyNewVsReturning);
analyticsRouter.get("/retention-summary", analyticsController.retentionSummary);
analyticsRouter.get("/average-clv", analyticsController.averageCLV);
analyticsRouter.get("/product-performance", analyticsController.productPerformance);
analyticsRouter.get("/category-performance", analyticsController.categoryPerformance);
analyticsRouter.get("/revenue-growth", analyticsController.revenueGrowth);
