import type { Request, Response } from "express";
import { inventoryService } from "../services/inventory.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { AdjustStockInput } from "../schemas/inventory.schema.js";

export const inventoryController = {
  lowStock: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await inventoryService.listLowStock(), "Low-stock variants retrieved");
  }),

  transactions: asyncHandler(async (req: Request, res: Response) => {
    const { variantId } = req.params as { variantId: string };
    sendSuccess(res, await inventoryService.listTransactions(variantId), "Inventory history retrieved");
  }),

  adjust: asyncHandler(async (req: Request, res: Response) => {
    const { variantId } = req.params as { variantId: string };
    const { delta, note } = req.body as AdjustStockInput;
    const inventory = await inventoryService.adjustStock(variantId, delta, note, req.user!.id);
    sendSuccess(res, inventory, "Stock adjusted");
  }),
};
