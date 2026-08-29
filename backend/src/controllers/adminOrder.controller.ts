import type { Request, Response } from "express";
import { orderService } from "../services/order.service.js";
import { sendSuccess, sendPaginated } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { OrderListQuery, UpdateOrderStatusInput } from "../schemas/order.schema.js";

export const adminOrderController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as OrderListQuery;
    const { items, meta } = await orderService.adminList(query);
    sendPaginated(res, items, meta, "Orders retrieved");
  }),

  detail: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    sendSuccess(res, await orderService.adminGetById(id), "Order retrieved");
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { status, note } = req.body as UpdateOrderStatusInput;
    const order = await orderService.updateStatus(id, status, note, req.user!.id);
    sendSuccess(res, order, "Order status updated");
  }),
};
