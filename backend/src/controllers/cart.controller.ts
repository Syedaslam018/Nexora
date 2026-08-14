import type { Request, Response } from "express";
import { cartService } from "../services/cart.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type {
  AddCartItemInput,
  UpdateCartItemInput,
  ApplyCouponInput,
  MergeGuestCartInput,
} from "../schemas/cart.schema.js";

export const cartController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await cartService.getCart(req.user!.id), "Cart retrieved");
  }),

  addItem: asyncHandler(async (req: Request, res: Response) => {
    const { variantId, quantity } = req.body as AddCartItemInput;
    const cart = await cartService.addItem(req.user!.id, variantId, quantity);
    sendSuccess(res, cart, "Item added to cart");
  }),

  updateItem: asyncHandler(async (req: Request, res: Response) => {
    const { variantId } = req.params as { variantId: string };
    const { quantity } = req.body as UpdateCartItemInput;
    const cart = await cartService.updateItemQuantity(req.user!.id, variantId, quantity);
    sendSuccess(res, cart, "Cart updated");
  }),

  removeItem: asyncHandler(async (req: Request, res: Response) => {
    const { variantId } = req.params as { variantId: string };
    const cart = await cartService.removeItem(req.user!.id, variantId);
    sendSuccess(res, cart, "Item removed from cart");
  }),

  applyCoupon: asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body as ApplyCouponInput;
    const cart = await cartService.applyCoupon(req.user!.id, code);
    sendSuccess(res, cart, "Coupon applied");
  }),

  removeCoupon: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.removeCoupon(req.user!.id);
    sendSuccess(res, cart, "Coupon removed");
  }),

  merge: asyncHandler(async (req: Request, res: Response) => {
    const { items } = req.body as MergeGuestCartInput;
    const cart = await cartService.mergeGuestCart(req.user!.id, items);
    sendSuccess(res, cart, "Cart merged");
  }),
};
