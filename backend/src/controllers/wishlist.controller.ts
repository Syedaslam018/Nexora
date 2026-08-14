import type { Request, Response } from "express";
import { wishlistService } from "../services/wishlist.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { MoveToCartInput } from "../schemas/wishlist.schema.js";

export const wishlistController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await wishlistService.getWishlist(req.user!.id), "Wishlist retrieved");
  }),

  add: asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const wishlist = await wishlistService.addProduct(req.user!.id, productId);
    sendSuccess(res, wishlist, "Added to wishlist");
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const wishlist = await wishlistService.removeProduct(req.user!.id, productId);
    sendSuccess(res, wishlist, "Removed from wishlist");
  }),

  moveToCart: asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const { variantId, quantity } = req.body as MoveToCartInput;
    const wishlist = await wishlistService.moveToCart(req.user!.id, productId, variantId, quantity);
    sendSuccess(res, wishlist, "Moved to cart");
  }),
};
