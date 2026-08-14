import type { Request, Response } from "express";
import { addressService } from "../services/address.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { AddressInput, UpdateAddressInput } from "../schemas/address.schema.js";

export const addressController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await addressService.list(req.user!.id), "Addresses retrieved");
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as AddressInput;
    const address = await addressService.create(req.user!.id, body);
    sendSuccess(res, address, "Address created", 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const body = req.body as UpdateAddressInput;
    const address = await addressService.update(req.user!.id, id, body);
    sendSuccess(res, address, "Address updated");
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await addressService.remove(req.user!.id, id);
    sendSuccess(res, null, "Address deleted");
  }),
};
