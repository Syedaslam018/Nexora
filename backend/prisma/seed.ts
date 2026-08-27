import { prisma } from "../src/config/db.js";
import { logger } from "../src/config/logger.js";

/**
 * Full seed data (30+ products, categories, brands, variants, demo admin
 * account, sample orders, reviews, coupons — per the spec's Phase "Seed
 * Data" requirements) lands once the catalog, orders, and review models
 * have services to seed through (later phases). This stub exists now so
 * `npm run db:seed` is a valid command from Phase 2 onward and CI (Phase 13)
 * has something to call.
 */
async function main() {
  logger.info("Seed script placeholder — no data seeded yet (lands in a later phase).");
}

main()
  .catch((err) => {
    logger.error({ err }, "Seed failed");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
