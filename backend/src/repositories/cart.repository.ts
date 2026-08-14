import { prisma } from "../config/db.js";

const cartInclude = {
  coupon: { include: { products: true, categories: true } },
  items: {
    include: {
      variant: {
        include: {
          product: { include: { images: { take: 1, orderBy: { position: "asc" as const } } } },
          inventory: true,
        },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

export const cartRepository = {
  /** Every user is given a Cart at registration (see user.repository.ts),
   * so this should always find one — `findUniqueOrThrow` would be
   * reasonable, but findUnique + a service-level fallback create is safer
   * against any data created before that invariant existed. */
  findByUserId(userId: string) {
    return prisma.cart.findUnique({ where: { userId }, include: cartInclude });
  },

  createForUser(userId: string) {
    return prisma.cart.create({ data: { userId }, include: cartInclude });
  },

  findItem(cartId: string, variantId: string) {
    return prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId, variantId } },
    });
  },

  addOrIncrementItem(cartId: string, variantId: string, quantity: number) {
    return prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId, variantId } },
      create: { cartId, variantId, quantity },
      update: { quantity: { increment: quantity } },
    });
  },

  setItemQuantity(cartId: string, variantId: string, quantity: number) {
    return prisma.cartItem.update({
      where: { cartId_variantId: { cartId, variantId } },
      data: { quantity },
    });
  },

  removeItem(cartId: string, variantId: string) {
    return prisma.cartItem.delete({ where: { cartId_variantId: { cartId, variantId } } });
  },

  clearItems(cartId: string) {
    return prisma.cartItem.deleteMany({ where: { cartId } });
  },

  setCoupon(cartId: string, couponId: string | null) {
    return prisma.cart.update({ where: { id: cartId }, data: { couponId } });
  },
};
