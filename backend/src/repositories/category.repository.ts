import { prisma } from "../config/db.js";
import type { CreateCategoryInput } from "../schemas/product.schema.js";

export const categoryRepository = {
  findAll() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
  },

  /** Nested tree — top-level categories with their direct children. */
  findTree() {
    return prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      include: {
        children: { orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } },
        _count: { select: { products: true } },
      },
    });
  },

  findBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } });
  },

  create(input: CreateCategoryInput) {
    return prisma.category.create({ data: input });
  },

  update(id: string, input: Partial<CreateCategoryInput>) {
    return prisma.category.update({ where: { id }, data: input });
  },
};
