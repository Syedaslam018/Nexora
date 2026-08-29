import type { Request, Response } from "express";
import { productService } from "../services/product.service.js";
import { sendSuccess, sendPaginated } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type {
  AdminProductListQuery,
  AddVariantInput,
  UpdateVariantInput,
  AddImageInput,
} from "../schemas/product.schema.js";

export const adminProductController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as AdminProductListQuery;
    const { items, meta } = await productService.adminList(
      { search: query.search, categoryId: query.categoryId, brandId: query.brandId },
      { page: query.page, pageSize: query.pageSize },
    );
    sendPaginated(res, items, meta, "Products retrieved");
  }),

  setActive: asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const { isActive } = req.body as { isActive: boolean };
    const product = await productService.setActive(productId, isActive);
    sendSuccess(res, product, isActive ? "Product activated" : "Product deactivated");
  }),

  addVariant: asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const body = req.body as AddVariantInput;
    const variant = await productService.addVariant(productId, body);
    sendSuccess(res, variant, "Variant added", 201);
  }),

  updateVariant: asyncHandler(async (req: Request, res: Response) => {
    const { variantId } = req.params as { variantId: string };
    const body = req.body as UpdateVariantInput;
    const variant = await productService.updateVariant(variantId, body);
    sendSuccess(res, variant, "Variant updated");
  }),

  addImage: asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const body = req.body as AddImageInput;
    const image = await productService.addImage(productId, body);
    sendSuccess(res, image, "Image added", 201);
  }),

  removeImage: asyncHandler(async (req: Request, res: Response) => {
    const { imageId } = req.params as { imageId: string };
    await productService.removeImage(imageId);
    sendSuccess(res, null, "Image removed");
  }),
};
