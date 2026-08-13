import { brandRepository } from "../repositories/brand.repository.js";
import { ApiError } from "../utils/ApiError.js";
import type { CreateBrandInput } from "../schemas/product.schema.js";

export const brandService = {
  async list() {
    const brands = await brandRepository.findAll();
    return brands.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logoUrl: b.logoUrl,
      productCount: b._count.products,
    }));
  },

  create(input: CreateBrandInput) {
    return brandRepository.create(input);
  },

  async update(id: string, input: Partial<CreateBrandInput>) {
    if (input.slug) {
      const existing = await brandRepository.findBySlug(input.slug);
      if (existing && existing.id !== id) throw ApiError.conflict("Slug already in use");
    }
    return brandRepository.update(id, input);
  },
};
