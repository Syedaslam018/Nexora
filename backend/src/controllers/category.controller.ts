import type { Request, Response } from "express";
import { categoryService } from "../services/category.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { CreateCategoryInput } from "../schemas/product.schema.js";

export const categoryController = {
  tree: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await categoryService.listTree(), "Categories retrieved");
  }),

  flat: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await categoryService.listFlat(), "Categories retrieved");
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateCategoryInput;
    const category = await categoryService.create(body);
    sendSuccess(res, category, "Category created", 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const body = req.body as Partial<CreateCategoryInput>;
    const category = await categoryService.update(id, body);
    sendSuccess(res, category, "Category updated");
  }),
};
