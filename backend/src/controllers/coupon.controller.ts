import type { Request, Response } from "express";
import { couponService } from "../services/coupon.service.js";
import { sendSuccess, sendPaginated } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { CreateCouponInput, UpdateCouponInput, CouponListQuery } from "../schemas/coupon.schema.js";

export const couponController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as CouponListQuery;
    const { items, meta } = await couponService.adminList(query);
    sendPaginated(res, items, meta, "Coupons retrieved");
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateCouponInput;
    const coupon = await couponService.adminCreate(body);
    sendSuccess(res, coupon, "Coupon created", 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const body = req.body as UpdateCouponInput;
    const coupon = await couponService.adminUpdate(id, body);
    sendSuccess(res, coupon, "Coupon updated");
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await couponService.adminDelete(id);
    sendSuccess(res, null, "Coupon deleted");
  }),
};
