import { inventoryRepository } from "../repositories/inventory.repository.js";
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
    return inventoryRepository.adjustStock(variantId, delta, note, adminUserId);
  },
};
