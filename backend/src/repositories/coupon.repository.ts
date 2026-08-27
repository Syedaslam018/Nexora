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

  // ── Admin CRUD ──────────────────────────────────────────────────────

  async findManyForAdmin(pagination: { page: number; pageSize: number }) {
    const [items, totalItems] = await Promise.all([
      prisma.coupon.findMany({
        include: { products: true, categories: true, _count: { select: { usages: true } } },
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      prisma.coupon.count(),
    ]);
    return { items, totalItems };
  },

  create(input: {
    code: string;
    type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
    value: number;
    minOrderValueCents?: number;
    maxDiscountCents?: number;
    startsAt: Date;
    expiresAt: Date;
    usageLimit?: number;
    perUserLimit?: number;
    isActive: boolean;
    categoryIds: string[];
    productIds: string[];
  }) {
    return prisma.coupon.create({
      data: {
        code: input.code,
        type: input.type,
        value: input.value,
        minOrderValueCents: input.minOrderValueCents,
        maxDiscountCents: input.maxDiscountCents,
        startsAt: input.startsAt,
        expiresAt: input.expiresAt,
        usageLimit: input.usageLimit,
        perUserLimit: input.perUserLimit,
        isActive: input.isActive,
        categories: { create: input.categoryIds.map((categoryId) => ({ categoryId })) },
        products: { create: input.productIds.map((productId) => ({ productId })) },
      },
      include: { products: true, categories: true },
    });
  },

  async update(
    id: string,
    input: Partial<{
      type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
      value: number;
      minOrderValueCents: number | null;
      maxDiscountCents: number | null;
      startsAt: Date;
      expiresAt: Date;
      usageLimit: number | null;
      perUserLimit: number | null;
      isActive: boolean;
      categoryIds: string[];
      productIds: string[];
    }>,
  ) {
    const { categoryIds, productIds, ...scalarFields } = input;
    return prisma.$transaction(async (tx) => {
      if (categoryIds) {
        await tx.couponCategory.deleteMany({ where: { couponId: id } });
        if (categoryIds.length > 0) {
          await tx.couponCategory.createMany({
            data: categoryIds.map((categoryId) => ({ couponId: id, categoryId })),
          });
        }
      }
      if (productIds) {
        await tx.couponProduct.deleteMany({ where: { couponId: id } });
        if (productIds.length > 0) {
          await tx.couponProduct.createMany({
            data: productIds.map((productId) => ({ couponId: id, productId })),
          });
        }
      }
      return tx.coupon.update({
        where: { id },
        data: scalarFields,
        include: { products: true, categories: true },
      });
    });
  },

  delete(id: string) {
    return prisma.coupon.delete({ where: { id } });
  },
};
