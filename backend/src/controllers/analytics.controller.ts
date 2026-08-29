import type { Request, Response } from "express";
import { analyticsService } from "../services/analytics.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function limitParam(req: Request, fallback = 10, max = 50): number {
  const raw = Number(req.query.limit);
  return Number.isFinite(raw) && raw > 0 && raw <= max ? raw : fallback;
}

function monthsParam(req: Request, fallback = 12): number {
  const raw = Number(req.query.months);
  return Number.isFinite(raw) && raw > 0 && raw <= 36 ? raw : fallback;
}

// bigint doesn't serialize through JSON.stringify by default — every row
// coming out of a raw query goes through this before sendSuccess.
function serializeBigInts<T>(rows: T[]): unknown[] {
  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row as Record<string, unknown>).map(([k, v]) => [
        k,
        typeof v === "bigint" ? Number(v) : v,
      ]),
    ),
  );
}

export const analyticsController = {
  topCustomers: asyncHandler(async (req: Request, res: Response) => {
    const rows = await analyticsService.getTopCustomers(limitParam(req));
    sendSuccess(res, serializeBigInts(rows), "Top customers retrieved");
  }),

  monthlyRevenue: asyncHandler(async (req: Request, res: Response) => {
    const rows = await analyticsService.getMonthlyRevenue(monthsParam(req));
    sendSuccess(res, serializeBigInts(rows), "Monthly revenue retrieved");
  }),

  bestSellingProducts: asyncHandler(async (req: Request, res: Response) => {
    const rows = await analyticsService.getBestSellingProducts(limitParam(req));
    sendSuccess(res, serializeBigInts(rows), "Best-selling products retrieved");
  }),

  averageOrderValueByMonth: asyncHandler(async (req: Request, res: Response) => {
    const rows = await analyticsService.getAverageOrderValueByMonth(monthsParam(req));
    sendSuccess(res, serializeBigInts(rows), "Average order value by month retrieved");
  }),

  monthlyNewVsReturning: asyncHandler(async (req: Request, res: Response) => {
    const rows = await analyticsService.getMonthlyNewVsReturning(monthsParam(req));
    sendSuccess(res, serializeBigInts(rows), "Monthly new-vs-returning retrieved");
  }),

  retentionSummary: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await analyticsService.getRetentionSummary(), "Retention summary retrieved");
  }),

  averageCLV: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await analyticsService.getAverageCustomerLifetimeValue(), "Average CLV retrieved");
  }),

  productPerformance: asyncHandler(async (req: Request, res: Response) => {
    const rows = await analyticsService.getProductPerformance(limitParam(req, 20));
    sendSuccess(res, serializeBigInts(rows), "Product performance retrieved");
  }),

  categoryPerformance: asyncHandler(async (_req: Request, res: Response) => {
    const rows = await analyticsService.getCategoryPerformance();
    sendSuccess(res, serializeBigInts(rows), "Category performance retrieved");
  }),

  revenueGrowth: asyncHandler(async (req: Request, res: Response) => {
    const rows = await analyticsService.getRevenueGrowth(monthsParam(req));
    sendSuccess(res, serializeBigInts(rows), "Revenue growth retrieved");
  }),
};
