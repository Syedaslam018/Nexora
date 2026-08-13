import { useParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { Star, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/features/products/ProductCard";
import { useProductDetail } from "@/features/products/useProducts";
import { useRecordProductView, useRecentlyViewed } from "@/features/products/useRecentlyViewed";
import { formatCents, cn } from "@/lib/utils";

export function ProductDetailPage() {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const { data: product, isLoading } = useProductDetail(idOrSlug);
  useRecordProductView(product?.id);
  const { data: recentlyViewed } = useRecentlyViewed(product?.id);

  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(
    () => product?.variants.find((v) => v.id === selectedVariantId) ?? product?.variants[0],
    [product, selectedVariantId],
  );

  if (isLoading) {
    return (
      <main className="container py-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-md bg-secondary" />
          <div className="flex flex-col gap-3">
            <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-secondary" />
            <div className="h-6 w-32 animate-pulse rounded bg-secondary" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="container flex min-h-[50vh] items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">Product not found.</p>
      </main>
    );
  }

  const images = product.images.length > 0 ? product.images : [];
  const activeImage = images[selectedImageIndex];
  const priceCents = selectedVariant?.priceCents ?? product.basePriceCents;
  const discountPercent =
    product.compareAtPriceCents && product.compareAtPriceCents > priceCents
      ? Math.round((1 - priceCents / product.compareAtPriceCents) * 100)
      : null;
  const inStock = selectedVariant?.inStock ?? false;

  function notifyCartComingSoon() {
    toast.info("Cart & checkout land in the next build phase.");
  }

  return (
    <main className="container py-8">
      <nav className="mb-6 flex gap-1.5 text-xs text-muted-foreground">
        <Link to="/products" className="hover:text-foreground">
          Products
        </Link>
        <span>/</span>
        <Link to={`/products?category=${product.category.slug}`} className="hover:text-foreground">
          {product.category.name}
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Gallery — corner-bracket frame, same signature motif as ProductCard */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
            {activeImage ? (
              <img src={activeImage.url} alt={activeImage.altText ?? product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                No image available
              </div>
            )}
            {(["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"] as const).map(
              (pos) => (
                <span
                  key={pos}
                  className={cn(
                    "absolute h-4 w-4 border-foreground/30",
                    pos,
                    pos.includes("top") ? "border-t" : "border-b",
                    pos.includes("left") ? "border-l" : "border-r",
                  )}
                />
              ),
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(i)}
                  className={cn(
                    "h-16 w-16 overflow-hidden rounded-md border-2",
                    i === selectedImageIndex ? "border-primary" : "border-transparent",
                  )}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-muted-foreground">{product.brand.name}</p>
          <h1 className="font-display text-2xl font-semibold leading-tight">{product.name}</h1>

          <div className="mt-2 flex items-center gap-3">
            {product.reviewCount > 0 ? (
              <span className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {product.avgRating.toFixed(1)}
                <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">No reviews yet</span>
            )}
            <span className="font-mono-data text-xs text-muted-foreground">SKU: {selectedVariant?.sku ?? product.sku}</span>
          </div>

          <div className="mt-4 flex items-baseline gap-3 font-mono-data">
            <span className="text-3xl font-semibold">{formatCents(priceCents)}</span>
            {product.compareAtPriceCents && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatCents(product.compareAtPriceCents)}
                </span>
                <span className="rounded bg-warning px-1.5 py-0.5 text-xs font-semibold text-warning-foreground">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>

          <p
            className={cn(
              "mt-2 text-sm font-medium",
              inStock ? "text-accent-foreground" : "text-destructive",
            )}
          >
            {inStock
              ? selectedVariant?.lowStock
                ? `Only ${selectedVariant.availableQty} left in stock`
                : "In stock"
              : "Out of stock"}
          </p>

          {product.variants.length > 1 && (
            <div className="mt-5">
              <h3 className="mb-2 text-sm font-medium">Variant</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    disabled={!v.inStock}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                      (selectedVariant?.id ?? product.variants[0]?.id) === v.id
                        ? "border-primary bg-primary/10"
                        : "border-input hover:bg-secondary",
                    )}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center gap-4">
            <div className="flex items-center rounded-md border border-input">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2 text-muted-foreground hover:text-foreground"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-mono-data text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(selectedVariant?.availableQty ?? 1, q + 1))}
                className="p-2 text-muted-foreground hover:text-foreground"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={notifyCartComingSoon} disabled={!inStock} className="flex-1">
              Add to Cart
            </Button>
            <Button onClick={notifyCartComingSoon} disabled={!inStock} variant="secondary" className="flex-1">
              Buy Now
            </Button>
          </div>
          <Button onClick={notifyCartComingSoon} variant="ghost" size="sm" className="mt-2">
            ♡ Add to Wishlist
          </Button>

          {selectedVariant && Object.keys(selectedVariant.attributes).length > 0 && (
            <div className="mt-6 border-t border-border pt-4">
              <h3 className="mb-2 text-sm font-medium">Specifications</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono-data text-xs">
                {Object.entries(selectedVariant.attributes).map(([key, value]) => (
                  <div key={key} className="contents">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-6 border-t border-border pt-4">
            <h3 className="mb-2 text-sm font-medium">Description</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Reviews land in Phase 8 once the Review model has a UI on top of it. */}

      {product.relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 font-display text-lg font-semibold">Related products</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {product.relatedProducts.map((p) => (
              <Link key={p.id} to={`/products/${p.slug}`} className="group flex flex-col gap-2">
                <div className="aspect-square overflow-hidden rounded-md bg-secondary">
                  {p.thumbnailUrl && (
                    <img src={p.thumbnailUrl} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{p.brand}</p>
                <h3 className="line-clamp-2 text-sm font-medium">{p.name}</h3>
                <span className="font-mono-data text-sm font-semibold">{formatCents(p.priceCents)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recentlyViewed && recentlyViewed.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 font-display text-lg font-semibold">Recently viewed</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {recentlyViewed.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
