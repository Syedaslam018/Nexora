import { Router } from "express";
import { addressController } from "../controllers/address.controller.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { addressSchema, updateAddressSchema, addressParamsSchema } from "../schemas/address.schema.js";

export const addressRouter = Router();

addressRouter.use(authenticate);

addressRouter.get("/", addressController.list);
addressRouter.post("/", validate({ body: addressSchema }), addressController.create);
addressRouter.patch(
  "/:id",
  validate({ params: addressParamsSchema, body: updateAddressSchema }),
  addressController.update,
);
addressRouter.delete("/:id", validate({ params: addressParamsSchema }), addressController.remove);
