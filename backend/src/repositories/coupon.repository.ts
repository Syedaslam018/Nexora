import { prisma } from "../config/db.js";

export const couponRepository = {
  findByCode(code: string) {
    return prisma.coupon.findUnique({
      where: { code },
      include: { products: true, categories: true },
    });
  },

  findById(id: string) {
    return prisma.coupon.findUnique({
      where: { id },
      include: { products: true, categories: true },
    });
  },

  countTotalUsages(couponId: string) {
    return prisma.couponUsage.count({ where: { couponId } });
  },

  countUserUsages(couponId: string, userId: string) {
    return prisma.couponUsage.count({ where: { couponId, userId } });
  },
};
