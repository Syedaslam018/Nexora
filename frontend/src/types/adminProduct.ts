export interface AdminProductListItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  basePriceCents: number;
  isActive: boolean;
  isArchived: boolean;
  brand: string;
  category: string;
  thumbnailUrl: string | null;
  totalStock: number;
  variantCount: number;
}

export interface CreateProductVariantInput {
  sku: string;
  name: string;
  attributes: Record<string, string>;
  priceCents?: number;
  initialQuantity: number;
  lowStockThreshold: number;
}

export interface CreateProductInput {
  name: string;
  slug: string;
  description: string;
  sku: string;
  basePriceCents: number;
  compareAtPriceCents?: number;
  brandId: string;
  categoryId: string;
  isActive: boolean;
  variants: CreateProductVariantInput[];
}
