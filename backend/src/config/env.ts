import "dotenv/config";
import { z } from "zod";

/**
 * All environment variables are parsed and validated once, at process start.
 * Anything that imports `env` gets fully-typed, guaranteed-present config —
 * no `process.env.FOO!` scattered through the codebase, and the app fails
 * fast with a clear message if a required var is missing/malformed instead
 * of failing confusingly deep in a request handler.
 */
const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    CLIENT_URL: z.string().url(),
    SERVER_URL: z.string().url(),

    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    REDIS_URL: z.string().min(1, "REDIS_URL is required"),

    JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
    JWT_REFRESH_SECRET: z
      .string()
      .min(16, "JWT_REFRESH_SECRET must be at least 16 characters"),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
    COOKIE_SECRET: z.string().min(16, "COOKIE_SECRET must be at least 16 characters"),

    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    STRIPE_PUBLISHABLE_KEY: z.string().min(1),

    EMAIL_PROVIDER: z.enum(["mock", "smtp"]).default("mock"),
    EMAIL_FROM: z.string().default("NEXORA <no-reply@nexora.dev>"),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),

    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  })
  .superRefine((config, ctx) => {
    if (config.EMAIL_PROVIDER === "smtp") {
      for (const key of ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"] as const) {
        if (!config[key]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: `${key} is required when EMAIL_PROVIDER=smtp`,
          });
        }
      }
      if (!config.SMTP_PORT) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["SMTP_PORT"],
          message: "SMTP_PORT is required when EMAIL_PROVIDER=smtp",
        });
      }
    }

    if (config.NODE_ENV !== "production") return;

    const placeholderPattern = /replace_me|dev_only|change_me|dummy/i;
    for (const key of [
      "JWT_SECRET",
      "JWT_REFRESH_SECRET",
      "COOKIE_SECRET",
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "STRIPE_PUBLISHABLE_KEY",
    ] as const) {
      if (placeholderPattern.test(config[key])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} must be replaced with a real production value`,
        });
      }
    }

    if (config.EMAIL_PROVIDER === "mock") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["EMAIL_PROVIDER"],
        message: "EMAIL_PROVIDER=mock is not allowed in production",
      });
    }

    for (const key of ["CLIENT_URL", "SERVER_URL"] as const) {
      const url = new URL(config[key]);
      const hostname = url.hostname;
      if (url.protocol !== "https:") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} must use HTTPS in production`,
        });
      }
      if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} must point to a deployed host in production`,
        });
      }
    }

    if (config.DATABASE_URL.includes("nexora_dev_password")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DATABASE_URL"],
        message: "DATABASE_URL must not use the development database password in production",
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables — see errors above.");
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
