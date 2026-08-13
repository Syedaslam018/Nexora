import { createServer } from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const app = createApp();
const httpServer = createServer(app);

// Phase 11 attaches Socket.IO to `httpServer` here (not a separate server),
// so it shares the same port and CORS/auth setup as the REST API.

httpServer.listen(env.PORT, () => {
  logger.info(`🚀 NEXORA API listening on ${env.SERVER_URL} (${env.NODE_ENV})`);
});

function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down gracefully...`);
  httpServer.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });
  // Force-exit if graceful shutdown hangs
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection");
});
