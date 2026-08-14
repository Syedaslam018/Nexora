export interface WishlistItem {
  productId: string;
  productSlug: string;
  productName: string;
  brand: string;
  thumbnailUrl: string | null;
  priceCents: number;
  compareAtPriceCents: number | null;
  inStock: boolean;
  defaultVariantId: string | null;
  addedAt: string;
}

export interface Wishlist {
  id: string;
  count: number;
  items: WishlistItem[];
}
