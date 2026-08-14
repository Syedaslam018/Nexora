import { Router, raw } from "express";
import { paymentController } from "../controllers/payment.controller.js";

export const paymentRouter = Router();

paymentRouter.post("/webhook", raw({ type: "application/json" }), paymentController.webhook);
