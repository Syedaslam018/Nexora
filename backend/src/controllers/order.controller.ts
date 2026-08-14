import type { Request, Response } from "express";
import { orderService } from "../services/order.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { CreateOrderInput } from "../schemas/order.schema.js";

export const orderController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateOrderInput;
    const { order, clientSecret } = await orderService.createOrder(req.user!.id, body);
    sendSuccess(res, { order, clientSecret }, "Order created", 201);
  }),

  detail: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const order = await orderService.getOrderForUser(req.user!.id, id);
    sendSuccess(res, order, "Order retrieved");
  }),
};
