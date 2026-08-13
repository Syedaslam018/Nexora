import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../config/logger.js";
import { isProd } from "../config/env.js";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Single place where every thrown error becomes an HTTP response. Handles:
 *  - ApiError (our own operational errors) — pass status/message straight through
 *  - ZodError (validation failures not already caught by the `validate` middleware)
 *  - Prisma known errors (unique constraint violations, FK violations, etc.)
 *    translated to sensible HTTP statuses instead of leaking raw DB errors
 *  - anything else — logged with full detail server-side, but the client only
 *    ever sees a generic message in production (never a stack trace or SQL).
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  if (err instanceof ApiError) {
    if (!err.isOperational) {
      logger.error({ err, path: req.originalUrl }, "Non-operational ApiError");
    }
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[] | undefined)?.join(", ") ?? "field";
      res.status(409).json({ success: false, message: `${target} already in use` });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ success: false, message: "Resource not found" });
      return;
    }
    if (err.code === "P2003") {
      res
        .status(409)
        .json({ success: false, message: "Operation violates a related record constraint" });
      return;
    }
  }

  logger.error({ err, path: req.originalUrl }, "Unhandled error");
  res.status(500).json({
    success: false,
    message: isProd ? "Internal server error" : String((err as Error)?.message ?? err),
  });
}
