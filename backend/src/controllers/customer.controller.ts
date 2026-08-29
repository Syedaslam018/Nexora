import type { Request, Response } from "express";
import { customerService } from "../services/customer.service.js";
import { sendSuccess, sendPaginated } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type {
  CustomerListQuery,
  SetCustomerActiveInput,
  SetCustomerRoleInput,
} from "../schemas/customer.schema.js";

export const customerController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as CustomerListQuery;
    const { items, meta } = await customerService.list(query.search, {
      page: query.page,
      pageSize: query.pageSize,
    });
    sendPaginated(res, items, meta, "Customers retrieved");
  }),

  detail: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    sendSuccess(res, await customerService.getById(id), "Customer retrieved");
  }),

  setActive: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { isActive } = req.body as SetCustomerActiveInput;
    const customer = await customerService.setActive(id, isActive, req.user!.id);
    sendSuccess(res, customer, isActive ? "Account enabled" : "Account disabled");
  }),

  setRole: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { role } = req.body as SetCustomerRoleInput;
    const customer = await customerService.setRole(id, role, req.user!.id);
    sendSuccess(res, customer, "Role updated");
  }),
};
