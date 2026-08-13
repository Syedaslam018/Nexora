import { z } from "zod";

const sortEnum = z.enum([
  "relevance",
  "price_low_high",
  "price_high_low",
  "highest_rated",
  "most_reviewed",
  "newest",
  "best_selling",
]);

export const productListQuerySchema = z.object({
  search: z.string().trim().min(1).max(120).optional(),
  category: z.string().trim().optional(), // category slug
  brand: z
    .union([z.string(), z.array(z.string())])
    .transform((v) => (Array.isArray(v) ? v : [v]))
    .optional(), // one or more brand slugs
  minPrice: z.coerce.number().nonnegative().optional(), // dollars, converted to cents in the service
  maxPrice: z.coerce.number().nonnegative().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  inStockOnly: z.coerce.boolean().optional(),
  discountedOnly: z.coerce.boolean().optional(),
  sort: sortEnum.default("relevance"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(60).default(20),
});
export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export const productIdentifierParamsSchema = z.object({
  idOrSlug: z.string().trim().min(1),
});

const variantAttributeSchema = z.record(z.string(), z.string());

export const createProductVariantSchema = z.object({
  sku: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(120),
  attributes: variantAttributeSchema.default({}),
  priceCents: z.number().int().nonnegative().optional(),
  initialQuantity: z.number().int().nonnegative().default(0),
  lowStockThreshold: z.number().int().nonnegative().default(5),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(220)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, hyphen-separated"),
  description: z.string().trim().min(1),
  sku: z.string().trim().min(1).max(64),
  basePriceCents: z.number().int().nonnegative(),
  compareAtPriceCents: z.number().int().nonnegative().optional(),
  brandId: z.string().uuid(),
  categoryId: z.string().uuid(),
  isActive: z.boolean().default(true),
  variants: z.array(createProductVariantSchema).min(1, "At least one variant is required"),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema
  .omit({ variants: true })
  .partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().optional(),
  imageUrl: z.string().url().optional(),
  parentId: z.string().uuid().optional(),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const createBrandSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  logoUrl: z.string().url().optional(),
});
export type CreateBrandInput = z.infer<typeof createBrandSchema>;
