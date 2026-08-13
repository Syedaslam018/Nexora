import { productRepository, type ProductListRow } from "../repositories/product.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { paginationMeta } from "../utils/pagination.js";
import type { ProductListQuery } from "../schemas/product.schema.js";
import type { CreateProductInput, UpdateProductInput } from "../schemas/product.schema.js";

function toDollarsRoundedCents(dollars: number): number {
  return Math.round(dollars * 100);
}

function mapListRow(row: ProductListRow) {
  const discountPercent =
    row.compare_at_price_cents && row.compare_at_price_cents > row.base_price_cents
      ? Math.round((1 - row.base_price_cents / row.compare_at_price_cents) * 100)
      : null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    priceCents: row.base_price_cents,
    compareAtPriceCents: row.compare_at_price_cents,
    discountPercent,
    avgRating: Number(row.avg_rating),
    reviewCount: row.review_count,
    brand: { name: row.brand_name, slug: row.brand_slug },
    category: { name: row.category_name, slug: row.category_slug },
    thumbnailUrl: row.thumbnail_url,
    unitsSold: row.units_sold,
    inStock: row.in_stock,
    createdAt: row.created_at,
  };
}

export const productService = {
  async list(query: ProductListQuery) {
    const { rows, totalItems } = await productRepository.findMany(
      {
        search: query.search,
        categorySlug: query.category,
        brandSlugs: query.brand,
        minPriceCents: query.minPrice !== undefined ? toDollarsRoundedCents(query.minPrice) : undefined,
        maxPriceCents: query.maxPrice !== undefined ? toDollarsRoundedCents(query.maxPrice) : undefined,
        minRating: query.minRating,
        inStockOnly: query.inStockOnly,
        discountedOnly: query.discountedOnly,
        sort: query.sort,
      },
      { page: query.page, pageSize: query.pageSize },
    );

    return {
      items: rows.map(mapListRow),
      meta: paginationMeta(totalItems, { page: query.page, pageSize: query.pageSize }),
    };
  },

  async getDetail(idOrSlug: string) {
    const product = await productRepository.findBySlugOrId(idOrSlug);
    if (!product || !product.isActive) throw ApiError.notFound("Product not found");

    const related = await productRepository.findRelated(product.id, product.categoryId, 8);

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      sku: product.sku,
      basePriceCents: product.basePriceCents,
      compareAtPriceCents: product.compareAtPriceCents,
      avgRating: Number(product.avgRating),
      reviewCount: product.reviewCount,
      brand: { id: product.brand.id, name: product.brand.name, slug: product.brand.slug },
      category: { id: product.category.id, name: product.category.name, slug: product.category.slug },
      images: product.images.map((img) => ({ id: img.id, url: img.url, altText: img.altText })),
      variants: product.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        name: v.name,
        attributes: v.attributes,
        priceCents: v.priceCents ?? product.basePriceCents,
        images: v.images.map((img) => ({ id: img.id, url: img.url })),
        availableQty: v.inventory?.availableQty ?? 0,
        inStock: (v.inventory?.availableQty ?? 0) > 0,
        lowStock:
          (v.inventory?.availableQty ?? 0) > 0 &&
          (v.inventory?.availableQty ?? 0) <= (v.inventory?.lowStockThreshold ?? 5),
      })),
      relatedProducts: related.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        priceCents: p.basePriceCents,
        thumbnailUrl: p.images[0]?.url ?? null,
        brand: p.brand.name,
        avgRating: Number(p.avgRating),
      })),
    };
  },

  /** `productIds` come from the client's locally-stored "recently viewed"
   * list — the backend just hydrates them with current data (price/stock
   * can change since the product was last viewed). */
  async getByIds(productIds: string[]) {
    const products = await productRepository.findManyByIds(productIds.slice(0, 20));
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      priceCents: p.basePriceCents,
      thumbnailUrl: p.images[0]?.url ?? null,
      brand: p.brand.name,
      avgRating: Number(p.avgRating),
    }));
  },

  create(input: CreateProductInput) {
    return productRepository.create(input);
  },

  update(id: string, input: UpdateProductInput) {
    return productRepository.update(id, input);
  },

  archive(id: string) {
    return productRepository.archive(id);
  },
};
