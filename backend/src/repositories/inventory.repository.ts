import { prisma } from "../config/db.js";

export const inventoryRepository = {
  /** Variants where stock has dropped to or below their own low-stock
   * threshold — the flag Section 11's admin dashboard metric ("Low-stock
   * products") and Section 17's low-inventory notifications both key off. */
  findLowStock() {
    return prisma.$queryRaw<
      {
        variant_id: string;
        sku: string;
        variant_name: string;
        product_name: string;
        product_slug: string;
        available_qty: number;
        low_stock_threshold: number;
      }[]
    >`
      SELECT
        v.id AS variant_id, v.sku, v.name AS variant_name,
        p.name AS product_name, p.slug AS product_slug,
        i.available_qty, i.low_stock_threshold
      FROM inventory i
      JOIN product_variants v ON v.id = i.variant_id
      JOIN products p ON p.id = v.product_id
      WHERE i.available_qty <= i.low_stock_threshold
      ORDER BY i.available_qty ASC
    `;
  },

  findTransactionsForVariant(variantId: string, limit = 50) {
    return prisma.inventoryTransaction.findMany({
      where: { variantId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { createdBy: { select: { firstName: true, lastName: true, email: true } } },
    });
  },

  findInventoryByVariant(variantId: string) {
    return prisma.inventory.findUnique({ where: { variantId } });
  },

  async adjustStock(variantId: string, delta: number, note: string, adminUserId: string) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.inventory.update({
        where: { variantId },
        data: { availableQty: { increment: delta } },
      });
      await tx.inventoryTransaction.create({
        data: {
          variantId,
          type: "STOCK_ADJUSTED",
          quantity: delta,
          referenceType: "MANUAL_ADJUSTMENT",
          note,
          createdById: adminUserId,
        },
      });
      return updated;
    });
  },
};
