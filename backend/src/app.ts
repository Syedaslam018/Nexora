import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import {pinoHttp} from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { apiRouter } from "./routes/index.js";
import { paymentRouter } from "./routes/payment.routes.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

/**
 * `createApp` builds the Express app WITHOUT starting a listener, so
 * integration tests (Phase 12) can import it directly with supertest
 * instead of binding a real port.
 */
export function createApp() {
  const app = express();

  // Behind a reverse proxy (Docker/K8s/Nginx) in production so rate-limit /
  // secure-cookie logic sees the real client IP and protocol.
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true, // required for HTTP-only refresh-token cookies
    }),
  );
  app.use(compression());
  app.use(cookieParser(env.COOKIE_SECRET));

  // Stripe webhook signature verification needs the exact raw request
  // bytes, so it's mounted here — BEFORE the express.json() parser below —
  // with its own express.raw() middleware (see payment.routes.ts). Every
  // other route goes through apiRouter and gets JSON-parsed normally.
  app.use("/api/payments", paymentRouter);

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  app.use(
    pinoHttp({
      logger,
      autoLogging: env.NODE_ENV !== "test",
      redact: ["req.headers.cookie", "req.headers.authorization"],
    }),
  );

  app.use("/api", apiLimiter, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
