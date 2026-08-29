import { inventoryRepository } from "../repositories/inventory.repository.js";
import { notificationService } from "./notification.service.js";
import { emitToAdmins } from "../sockets/index.js";
import { ApiError } from "../utils/ApiError.js";

export const inventoryService = {
  listLowStock() {
    return inventoryRepository.findLowStock();
  },

  listTransactions(variantId: string) {
    return inventoryRepository.findTransactionsForVariant(variantId);
  },

  /** Manual correction (damaged stock, recount, initial stocking outside
   * the product-creation flow) — always logged as `STOCK_ADJUSTED` with a
   * required note, never a silent number change. */
  async adjustStock(variantId: string, delta: number, note: string, adminUserId: string) {
    const inventory = await inventoryRepository.findInventoryByVariant(variantId);
    if (!inventory) throw ApiError.notFound("Variant has no inventory record");
    if (inventory.availableQty + delta < 0) {
      throw ApiError.badRequest(
        `Adjustment would make available stock negative (currently ${inventory.availableQty})`,
      );
    }

    const result = await inventoryRepository.adjustStock(variantId, delta, note, adminUserId);

    // Same "just crossed the threshold" logic as the order-checkout path
    // in order.service.ts — only alerts on the transition, not every read
    // while already low.
    const postQty = inventory.availableQty + delta;
    if (inventory.availableQty > inventory.lowStockThreshold && postQty <= inventory.lowStockThreshold) {
      const productName = inventory.variant.product.name;
      const variantName = inventory.variant.name;
      void notificationService
        .notifyAdmins(
          "LOW_INVENTORY",
          "Low stock alert",
          `${productName} (${variantName}) is down to ${postQty} units.`,
          { variantId, availableQty: postQty },
        )
        .catch(() => {});
      emitToAdmins("inventory:low-stock", { variantId, productName, variantName, availableQty: postQty });
    }

    return result;
  },
};
