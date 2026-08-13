import { Router } from "express";
import { sendSuccess } from "../utils/ApiResponse.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  sendSuccess(res, { status: "ok", timestamp: new Date().toISOString() }, "NEXORA API is up");
});
