import type { Request, Response } from "express";
import { brandService } from "../services/brand.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { CreateBrandInput } from "../schemas/product.schema.js";

export const brandController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await brandService.list(), "Brands retrieved");
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateBrandInput;
    const brand = await brandService.create(body);
    sendSuccess(res, brand, "Brand created", 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const body = req.body as Partial<CreateBrandInput>;
    const brand = await brandService.update(id, body);
    sendSuccess(res, brand, "Brand updated");
  }),
};
