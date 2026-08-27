import type { Request, Response } from "express";
import { orderService } from "../services/order.service.js";
import { invoiceService } from "../services/invoice.service.js";
import { sendSuccess, sendPaginated } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type {
  CreateOrderInput,
  OrderListQuery,
  CancelOrderInput,
  UpdateOrderStatusInput,
} from "../schemas/order.schema.js";

export const orderController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateOrderInput;
    const { order, clientSecret } = await orderService.createOrder(req.user!.id, body);
    sendSuccess(res, { order, clientSecret }, "Order created", 201);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as OrderListQuery;
    const { items, meta } = await orderService.listForUser(req.user!.id, query);
    sendPaginated(res, items, meta, "Orders retrieved");
  }),

  detail: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const order = await orderService.getOrderForUser(req.user!.id, id);
    sendSuccess(res, order, "Order retrieved");
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { reason } = req.body as CancelOrderInput;
    const order = await orderService.cancelOrder(req.user!.id, id, reason);
    sendSuccess(res, order, "Order cancelled");
  }),

  requestRefund: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { reason } = req.body as CancelOrderInput;
    const order = await orderService.requestRefund(req.user!.id, id, reason);
    sendSuccess(res, order, "Refund requested");
  }),

  reorder: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await orderService.reorder(req.user!.id, id);
    sendSuccess(res, result, "Items added to cart");
  }),

  invoice: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const order = await orderService.getOrderForUser(req.user!.id, id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${order.orderNumber}.pdf"`);
    invoiceService.streamInvoice(order, res);
  }),

  // Admin/staff — see order.service.ts's updateStatus for why this exists
  // ahead of the full admin dashboard (Phase 9).
  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { status, note } = req.body as UpdateOrderStatusInput;
    const order = await orderService.updateStatus(id, status, note, req.user!.id);
    sendSuccess(res, order, "Order status updated");
  }),
};
