import type { Request, Response } from "express";
import { productService } from "../services/product.service.js";
import { sendSuccess, sendPaginated } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { ProductListQuery, CreateProductInput, UpdateProductInput } from "../schemas/product.schema.js";

export const productController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ProductListQuery;
    const { items, meta } = await productService.list(query);
    sendPaginated(res, items, meta, "Products retrieved");
  }),

  detail: asyncHandler(async (req: Request, res: Response) => {
    const { idOrSlug } = req.params as { idOrSlug: string };
    const product = await productService.getDetail(idOrSlug);
    sendSuccess(res, product, "Product retrieved");
  }),

  byIds: asyncHandler(async (req: Request, res: Response) => {
    const ids = String(req.query.ids ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const products = await productService.getByIds(ids);
    sendSuccess(res, products, "Products retrieved");
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateProductInput;
    const product = await productService.create(body);
    sendSuccess(res, product, "Product created", 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { idOrSlug } = req.params as { idOrSlug: string };
    const body = req.body as UpdateProductInput;
    const product = await productService.update(idOrSlug, body);
    sendSuccess(res, product, "Product updated");
  }),

  archive: asyncHandler(async (req: Request, res: Response) => {
    const { idOrSlug } = req.params as { idOrSlug: string };
    await productService.archive(idOrSlug);
    sendSuccess(res, null, "Product archived");
  }),
};
