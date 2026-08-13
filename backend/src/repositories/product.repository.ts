import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { paginationOffset, type PaginationParams } from "../utils/pagination.js";
import type { CreateProductInput, UpdateProductInput } from "../schemas/product.schema.js";

export interface ProductListFilters {
  search?: string;
  categorySlug?: string;
  brandSlugs?: string[];
  minPriceCents?: number;
  maxPriceCents?: number;
  minRating?: number;
  inStockOnly?: boolean;
  discountedOnly?: boolean;
  sort:
    | "relevance"
    | "price_low_high"
    | "price_high_low"
    | "highest_rated"
    | "most_reviewed"
    | "newest"
    | "best_selling";
}

export interface ProductListRow {
  id: string;
  name: string;
  slug: string;
  sku: string;
  base_price_cents: number;
  compare_at_price_cents: number | null;
  avg_rating: string; // Prisma returns Decimal as string over $queryRaw
  review_count: number;
  created_at: Date;
  brand_name: string;
  brand_slug: string;
  category_name: string;
  category_slug: string;
  thumbnail_url: string | null;
  units_sold: number;
  in_stock: boolean;
}

/**
 * Builds the shared WHERE clause fragments for both the data query and the
 * COUNT query below, so the two can never drift apart (a classic bug source
 * when a listing query and its count query are maintained by hand
 * separately).
 */
function buildConditions(filters: ProductListFilters): Prisma.Sql[] {
  const conditions: Prisma.Sql[] = [
    Prisma.sql`p.is_active = true`,
    Prisma.sql`p.is_archived = false`,
  ];

  if (filters.categorySlug) {
    conditions.push(Prisma.sql`c.slug = ${filters.categorySlug}`);
  }
  if (filters.brandSlugs && filters.brandSlugs.length > 0) {
    conditions.push(Prisma.sql`b.slug IN (${Prisma.join(filters.brandSlugs)})`);
  }
  if (filters.minPriceCents !== undefined) {
    conditions.push(Prisma.sql`p.base_price_cents >= ${filters.minPriceCents}`);
  }
  if (filters.maxPriceCents !== undefined) {
    conditions.push(Prisma.sql`p.base_price_cents <= ${filters.maxPriceCents}`);
  }
  if (filters.minRating !== undefined) {
    conditions.push(Prisma.sql`p.avg_rating >= ${filters.minRating}`);
  }
  if (filters.discountedOnly) {
    conditions.push(Prisma.sql`p.compare_at_price_cents IS NOT NULL`);
  }
  if (filters.inStockOnly) {
    conditions.push(Prisma.sql`EXISTS (
      SELECT 1 FROM product_variants v3
      JOIN inventory i3 ON i3.variant_id = v3.id
      WHERE v3.product_id = p.id AND i3.available_qty > 0
    )`);
  }
  if (filters.search) {
    conditions.push(
      Prisma.sql`p.search_vector @@ plainto_tsquery('english', ${filters.search})`,
    );
  }

  return conditions;
}

function buildOrderBy(filters: ProductListFilters): Prisma.Sql {
  switch (filters.sort) {
    case "price_low_high":
      return Prisma.sql`ORDER BY p.base_price_cents ASC`;
    case "price_high_low":
      return Prisma.sql`ORDER BY p.base_price_cents DESC`;
    case "highest_rated":
      return Prisma.sql`ORDER BY p.avg_rating DESC, p.review_count DESC`;
    case "most_reviewed":
      return Prisma.sql`ORDER BY p.review_count DESC`;
    case "best_selling":
      return Prisma.sql`ORDER BY units_sold DESC`;
    case "newest":
      return Prisma.sql`ORDER BY p.created_at DESC`;
    case "relevance":
    default:
      return filters.search
        ? Prisma.sql`ORDER BY ts_rank(p.search_vector, plainto_tsquery('english', ${filters.search})) DESC`
        : Prisma.sql`ORDER BY p.created_at DESC`;
  }
}

export const productRepository = {
  /**
   * The listing query. Raw SQL (rather than Prisma's query builder) because
   * this needs: a LATERAL join for "first image only", an aggregation
   * subquery for units-sold-based sorting, and full-text search ranking —
   * none of which Prisma's builder expresses directly. Requires the
   * `search_vector` generated column + GIN index from `database/schema.sql`
   * to actually exist in the database.
   */
  async findMany(filters: ProductListFilters, pagination: PaginationParams) {
    const conditions = buildConditions(filters);
    const whereClause = Prisma.join(conditions, " AND ");
    const orderByClause = buildOrderBy(filters);
    const offset = paginationOffset(pagination);

    const rows = await prisma.$queryRaw<ProductListRow[]>`
      SELECT
        p.id, p.name, p.slug, p.sku,
        p.base_price_cents, p.compare_at_price_cents,
        p.avg_rating::text AS avg_rating, p.review_count, p.created_at,
        b.name AS brand_name, b.slug AS brand_slug,
        c.name AS category_name, c.slug AS category_slug,
        img.url AS thumbnail_url,
        COALESCE(sales.sold, 0)::int AS units_sold,
        EXISTS (
          SELECT 1 FROM product_variants v4
          JOIN inventory i4 ON i4.variant_id = v4.id
          WHERE v4.product_id = p.id AND i4.available_qty > 0
        ) AS in_stock
      FROM products p
      JOIN brands b ON b.id = p.brand_id
      JOIN categories c ON c.id = p.category_id
      LEFT JOIN LATERAL (
        SELECT url FROM product_images pi
        WHERE pi.product_id = p.id
        ORDER BY pi.position ASC
        LIMIT 1
      ) img ON true
      LEFT JOIN (
        SELECT v.product_id, SUM(oi.quantity) AS sold
        FROM product_variants v
        JOIN order_items oi ON oi.variant_id = v.id
        JOIN orders o ON o.id = oi.order_id
        WHERE o.status NOT IN ('CANCELLED', 'PENDING')
        GROUP BY v.product_id
      ) sales ON sales.product_id = p.id
      WHERE ${whereClause}
      ${orderByClause}
      LIMIT ${pagination.pageSize} OFFSET ${offset}
    `;

    const countResult = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT p.id) AS count
      FROM products p
      JOIN brands b ON b.id = p.brand_id
      JOIN categories c ON c.id = p.category_id
      WHERE ${whereClause}
    `;

    return { rows, totalItems: Number(countResult[0]?.count ?? 0) };
  },

  findBySlugOrId(idOrSlug: string) {
    return prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        isArchived: false,
      },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: {
          where: { isActive: true },
          include: { inventory: true, images: { orderBy: { position: "asc" } } },
        },
      },
    });
  },

  /** For related/recently-viewed rails — same category, excluding the product itself. */
  findRelated(productId: string, categoryId: string, limit: number) {
    return prisma.product.findMany({
      where: { categoryId, id: { not: productId }, isActive: true, isArchived: false },
      take: limit,
      orderBy: { reviewCount: "desc" },
      include: { images: { take: 1, orderBy: { position: "asc" } }, brand: true },
    });
  },

  findManyByIds(ids: string[]) {
    return prisma.product.findMany({
      where: { id: { in: ids }, isActive: true, isArchived: false },
      include: { images: { take: 1, orderBy: { position: "asc" } }, brand: true },
    });
  },

  async create(input: CreateProductInput) {
    return prisma.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        sku: input.sku,
        basePriceCents: input.basePriceCents,
        compareAtPriceCents: input.compareAtPriceCents,
        brandId: input.brandId,
        categoryId: input.categoryId,
        isActive: input.isActive,
        variants: {
          create: input.variants.map((v) => ({
            sku: v.sku,
            name: v.name,
            attributes: v.attributes,
            priceCents: v.priceCents,
            inventory: {
              create: {
                availableQty: v.initialQuantity,
                lowStockThreshold: v.lowStockThreshold,
              },
            },
          })),
        },
      },
      include: { variants: { include: { inventory: true } } },
    });
  },

  update(id: string, input: UpdateProductInput) {
    return prisma.product.update({ where: { id }, data: input });
  },

  archive(id: string) {
    return prisma.product.update({ where: { id }, data: { isArchived: true, isActive: false } });
  },
};
