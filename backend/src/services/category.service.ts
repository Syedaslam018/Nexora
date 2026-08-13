import { categoryRepository } from "../repositories/category.repository.js";
import { ApiError } from "../utils/ApiError.js";
import type { CreateCategoryInput } from "../schemas/product.schema.js";

export const categoryService = {
  async listTree() {
    const roots = await categoryRepository.findTree();
    return roots.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      imageUrl: c.imageUrl,
      productCount: c._count.products,
      children: c.children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        imageUrl: child.imageUrl,
        productCount: child._count.products,
      })),
    }));
  },

  async listFlat() {
    const categories = await categoryRepository.findAll();
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      parentId: c.parentId,
      productCount: c._count.products,
    }));
  },

  create(input: CreateCategoryInput) {
    return categoryRepository.create(input);
  },

  async update(id: string, input: Partial<CreateCategoryInput>) {
    if (input.slug) {
      const existing = await categoryRepository.findBySlug(input.slug);
      if (existing && existing.id !== id) throw ApiError.conflict("Slug already in use");
    }
    return categoryRepository.update(id, input);
  },
};
