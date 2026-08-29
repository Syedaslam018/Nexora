import type { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function daysParam(req: Request, fallback = 30): number {
  const raw = Number(req.query.days);
  return Number.isFinite(raw) && raw > 0 && raw <= 365 ? raw : fallback;
}

export const dashboardController = {
  metrics: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await dashboardService.getMetrics(), "Metrics retrieved");
  }),

  revenueOverTime: asyncHandler(async (req: Request, res: Response) => {
    const rows = await dashboardService.getRevenueOverTime(daysParam(req));
    sendSuccess(
      res,
      rows.map((r) => ({ date: r.date, revenueCents: Number(r.revenue_cents) })),
      "Revenue over time retrieved",
    );
  }),

  ordersOverTime: asyncHandler(async (req: Request, res: Response) => {
    const rows = await dashboardService.getOrdersOverTime(daysParam(req));
    sendSuccess(
      res,
      rows.map((r) => ({ date: r.date, orderCount: Number(r.order_count) })),
      "Orders over time retrieved",
    );
  }),

  salesByCategory: asyncHandler(async (_req: Request, res: Response) => {
    const rows = await dashboardService.getSalesByCategory();
    sendSuccess(
      res,
      rows.map((r) => ({
        categoryName: r.category_name,
        revenueCents: Number(r.revenue_cents),
        unitsSold: Number(r.units_sold),
      })),
      "Sales by category retrieved",
    );
  }),

  topProducts: asyncHandler(async (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit) || 5, 20);
    const rows = await dashboardService.getTopProducts(limit);
    sendSuccess(
      res,
      rows.map((r) => ({
        productId: r.product_id,
        productName: r.product_name,
        revenueCents: Number(r.revenue_cents),
        unitsSold: Number(r.units_sold),
      })),
      "Top products retrieved",
    );
  }),

  customerGrowth: asyncHandler(async (req: Request, res: Response) => {
    const rows = await dashboardService.getCustomerGrowth(daysParam(req));
    sendSuccess(
      res,
      rows.map((r) => ({ date: r.date, newCustomers: Number(r.new_customers) })),
      "Customer growth retrieved",
    );
  }),

  orderStatusDistribution: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await dashboardService.getOrderStatusDistribution(), "Order status distribution retrieved");
  }),
};
