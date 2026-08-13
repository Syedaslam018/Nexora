import pino from "pino";
import { env, isProd } from "./env.js";

/**
 * Structured JSON logging in production (so it's greppable/shippable to a
 * log aggregator); pretty-printed in development for readability.
 */
export const logger = pino({
  level: env.NODE_ENV === "test" ? "silent" : isProd ? "info" : "debug",
  transport: isProd
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" },
      },
});
