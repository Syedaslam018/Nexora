import { PrismaClient } from "@prisma/client";
import { isProd } from "./env.js";

/**
 * `tsx watch` re-executes this module on every file change in dev, which
 * would otherwise create a fresh PrismaClient (and a fresh connection pool)
 * on every save. Stashing the instance on `globalThis` in non-production
 * survives the module reload.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProd ? ["error", "warn"] : ["warn", "error"],
  });

if (!isProd) globalForPrisma.prisma = prisma;
