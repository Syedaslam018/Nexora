import { prisma } from "../config/db.js";

const wishlistInclude = {
  items: {
    include: {
      product: {
        include: {
          images: { take: 1, orderBy: { position: "asc" as const } },
          brand: true,
          variants: { where: { isActive: true }, include: { inventory: true }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: "desc" as const },
  },
} as const;

export const wishlistRepository = {
  findByUserId(userId: string) {
    return prisma.wishlist.findUnique({ where: { userId }, include: wishlistInclude });
  },

  createForUser(userId: string) {
    return prisma.wishlist.create({ data: { userId }, include: wishlistInclude });
  },

  findItem(wishlistId: string, productId: string) {
    return prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId, productId } },
    });
  },

  addItem(wishlistId: string, productId: string, variantId?: string) {
    return prisma.wishlistItem.create({ data: { wishlistId, productId, variantId } });
  },

  removeItem(wishlistId: string, productId: string) {
    return prisma.wishlistItem.delete({
      where: { wishlistId_productId: { wishlistId, productId } },
    });
  },
};
