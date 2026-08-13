import { prisma } from "../config/db.js";
import type { CreateBrandInput } from "../schemas/product.schema.js";

export const brandRepository = {
  findAll() {
    return prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
  },

  findBySlug(slug: string) {
    return prisma.brand.findUnique({ where: { slug } });
  },

  create(input: CreateBrandInput) {
    return prisma.brand.create({ data: input });
  },

  update(id: string, input: Partial<CreateBrandInput>) {
    return prisma.brand.update({ where: { id }, data: input });
  },
};
