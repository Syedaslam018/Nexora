export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  discountPercent: number | null;
  avgRating: number;
  reviewCount: number;
  brand: { name: string; slug: string };
  category: { name: string; slug: string };
  thumbnailUrl: string | null;
  unitsSold: number;
  inStock: boolean;
  createdAt: string;
}

export interface ProductVariantDetail {
  id: string;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  priceCents: number;
  images: { id: string; url: string }[];
  availableQty: number;
  inStock: boolean;
  lowStock: boolean;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  basePriceCents: number;
  compareAtPriceCents: number | null;
  avgRating: number;
  reviewCount: number;
  brand: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string };
  images: { id: string; url: string; altText: string | null }[];
  variants: ProductVariantDetail[];
  relatedProducts: {
    id: string;
    name: string;
    slug: string;
    priceCents: number;
    thumbnailUrl: string | null;
    brand: string;
    avgRating: number;
  }[];
}

export type SortOption =
  | "relevance"
  | "price_low_high"
  | "price_high_low"
  | "highest_rated"
  | "most_reviewed"
  | "newest"
  | "best_selling";

export interface ProductListParams {
  search?: string;
  category?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  discountedOnly?: boolean;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  productCount: number;
  children: Omit<CategoryNode, "children">[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  productCount: number;
}
