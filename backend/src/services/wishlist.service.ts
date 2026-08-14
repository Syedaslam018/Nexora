import { wishlistRepository } from "../repositories/wishlist.repository.js";
import { cartService } from "./cart.service.js";
import { ApiError } from "../utils/ApiError.js";
import { prisma } from "../config/db.js";

async function getOrCreateWishlist(userId: string) {
  const existing = await wishlistRepository.findByUserId(userId);
  if (existing) return existing;
  return wishlistRepository.createForUser(userId);
}

function toDto(wishlist: Awaited<ReturnType<typeof getOrCreateWishlist>>) {
  return {
    id: wishlist.id,
    count: wishlist.items.length,
    items: wishlist.items.map((item) => {
      const primaryVariant = item.product.variants[0];
      return {
        productId: item.product.id,
        productSlug: item.product.slug,
        productName: item.product.name,
        brand: item.product.brand.name,
        thumbnailUrl: item.product.images[0]?.url ?? null,
        priceCents: item.product.basePriceCents,
        compareAtPriceCents: item.product.compareAtPriceCents,
        inStock: (primaryVariant?.inventory?.availableQty ?? 0) > 0,
        defaultVariantId: primaryVariant?.id ?? null,
        addedAt: item.createdAt,
      };
    }),
  };
}

export type WishlistDto = ReturnType<typeof toDto>;

export const wishlistService = {
  async getWishlist(userId: string): Promise<WishlistDto> {
    return toDto(await getOrCreateWishlist(userId));
  },

  async addProduct(userId: string, productId: string): Promise<WishlistDto> {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) throw ApiError.notFound("Product not found");

    const wishlist = await getOrCreateWishlist(userId);
    const existing = await wishlistRepository.findItem(wishlist.id, productId);
    if (!existing) {
      await wishlistRepository.addItem(wishlist.id, productId);
    }
    return this.getWishlist(userId);
  },

  async removeProduct(userId: string, productId: string): Promise<WishlistDto> {
    const wishlist = await getOrCreateWishlist(userId);
    const existing = await wishlistRepository.findItem(wishlist.id, productId);
    if (!existing) throw ApiError.notFound("Item not in wishlist");
    await wishlistRepository.removeItem(wishlist.id, productId);
    return this.getWishlist(userId);
  },

  /** Adds the item to the cart, then removes it from the wishlist — one
   * user action, two data changes, always done together. */
  async moveToCart(userId: string, productId: string, variantId: string, quantity: number) {
    await cartService.addItem(userId, variantId, quantity);
    const wishlist = await getOrCreateWishlist(userId);
    const existing = await wishlistRepository.findItem(wishlist.id, productId);
    if (existing) await wishlistRepository.removeItem(wishlist.id, productId);
    return this.getWishlist(userId);
  },
};
