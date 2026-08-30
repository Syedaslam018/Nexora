import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { Star, Minus, Plus, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/features/products/ProductCard";
import { useProductDetail } from "@/features/products/useProducts";
import {
  useRecordProductView,
  useRecentlyViewed,
} from "@/features/products/useRecentlyViewed";
import { useAddToCart } from "@/features/cart/useCart";
import {
  useIsInWishlist,
  useToggleWishlist,
} from "@/features/wishlist/useWishlist";
import { ReviewsSection } from "@/features/reviews/ReviewsSection";
import { formatCents, cn } from "@/lib/utils";

export function ProductDetailPage() {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProductDetail(idOrSlug);
  useRecordProductView(product?.id);
  const { data: recentlyViewed } = useRecentlyViewed(product?.id);

  const [selectedVariantId, setSelectedVariantId] = useState<
    string | undefined
  >(undefined);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const addToCart = useAddToCart();
  const isInWishlist = useIsInWishlist(product?.id);
  const toggleWishlist = useToggleWishlist();

  const selectedVariant = useMemo(
    () =>
      product?.variants.find((v) => v.id === selectedVariantId) ??
      product?.variants[0],
    [product, selectedVariantId],
  );

  if (isLoading) {
    return (
      <main className="container py-10 sm:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-3xl bg-secondary" />
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

  const currentProduct = product;

  const images = product.images.length > 0 ? product.images : [];
  const activeImage = images[selectedImageIndex];
  const priceCents = selectedVariant?.priceCents ?? product.basePriceCents;
  const discountPercent =
    product.compareAtPriceCents && product.compareAtPriceCents > priceCents
      ? Math.round((1 - priceCents / product.compareAtPriceCents) * 100)
      : null;
  const inStock = selectedVariant?.inStock ?? false;

  function handleAddToCart() {
    if (!selectedVariant) return;
    addToCart.mutate({
      variantId: selectedVariant.id,
      quantity,
      guestSnapshot: {
        variantId: selectedVariant.id,
        productId: currentProduct.id,
        productSlug: currentProduct.slug,
        productName: currentProduct.name,
        variantName: selectedVariant.name,
        sku: selectedVariant.sku,
        thumbnailUrl: images[0]?.url ?? null,
        unitPriceCents: priceCents,
        maxQty: selectedVariant.availableQty,
      },
    });
  }

  function handleBuyNow() {
    handleAddToCart();
    navigate("/cart");
  }

  return (
    <main className="container py-8 sm:py-12">
      <nav className="mb-8 flex gap-1.5 text-xs font-medium text-muted-foreground">
        <Link to="/products" className="hover:text-foreground">
          Products
        </Link>
        <span>/</span>
        <Link
          to={`/products?category=${product.category.slug}`}
          className="hover:text-foreground"
        >
          {product.category.name}
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
        {/* Gallery — corner-bracket frame, same signature motif as ProductCard */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-secondary shadow-lift ring-1 ring-border/60">
            {activeImage ? (
              // Deliberately eager (no `loading="lazy"`) — this is the
              // Largest Contentful Paint element on a product page; lazy-
              // loading it would delay the single most important paint on
              // the route it's most important for.
              <img
                src={activeImage.url}
                alt={activeImage.altText ?? product.name}
                className="h-full w-full object-cover transition duration-700 hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                No image available
              </div>
            )}
            {(
              [
                "top-2 left-2",
                "top-2 right-2",
                "bottom-2 left-2",
                "bottom-2 right-2",
              ] as const
            ).map((pos) => (
              <span
                key={pos}
                className={cn(
                  "absolute h-4 w-4 border-foreground/30",
                  pos,
                  pos.includes("top") ? "border-t" : "border-b",
                  pos.includes("left") ? "border-l" : "border-r",
                )}
              />
            ))}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(i)}
                  className={cn(
                    "h-16 w-16 overflow-hidden rounded-xl border-2 bg-secondary transition-transform hover:-translate-y-0.5",
                    i === selectedImageIndex
                      ? "border-primary shadow-soft"
                      : "border-transparent opacity-65 hover:opacity-100",
                  )}
                >
                  <img
                    src={img.url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:pt-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            {product.brand.name}
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-[-0.06em] sm:text-5xl">
            {product.name}
          </h1>

          <div className="mt-2 flex items-center gap-3">
            {product.reviewCount > 0 ? (
              <span className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {product.avgRating.toFixed(1)}
                <span className="text-muted-foreground">
                  ({product.reviewCount} reviews)
                </span>
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                No reviews yet
              </span>
            )}
            <span className="font-mono-data text-xs text-muted-foreground">
              SKU: {selectedVariant?.sku ?? product.sku}
            </span>
          </div>

          <div className="mt-6 flex items-baseline gap-3 font-mono-data">
            <span className="text-4xl font-bold tracking-[-0.05em]">
              {formatCents(priceCents)}
            </span>
            {product.compareAtPriceCents && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatCents(product.compareAtPriceCents)}
                </span>
                <span className="rounded-full bg-warning px-2.5 py-1 text-xs font-bold text-warning-foreground">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>

          <p
            className={cn(
              "mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold",
              inStock
                ? "bg-accent/15 text-accent-foreground"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {inStock
              ? selectedVariant?.lowStock
                ? `Only ${selectedVariant.availableQty} left in stock`
                : "In stock"
              : "Out of stock"}
          </p>

          {product.variants.length > 1 && (
            <div className="mt-7 border-t border-border/70 pt-6">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Choose an option
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    disabled={!v.inStock}
                    className={cn(
                      "rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40",
                      (selectedVariant?.id ?? product.variants[0]?.id) === v.id
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-input hover:border-primary/40 hover:bg-primary/5",
                    )}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className="flex h-12 items-center rounded-xl border border-input bg-card">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-3 text-muted-foreground transition-colors hover:text-primary"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-mono-data text-sm">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity((q) =>
                    Math.min(selectedVariant?.availableQty ?? 1, q + 1),
                  )
                }
                className="p-3 text-muted-foreground transition-colors hover:text-primary"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={!inStock || addToCart.isPending}
              isLoading={addToCart.isPending}
              className="h-12 min-w-[10rem] flex-1"
            >
              Add to Cart
            </Button>
            <Button
              onClick={handleBuyNow}
              disabled={!inStock || addToCart.isPending}
              variant="secondary"
              className="h-12 min-w-[8rem] flex-1"
            >
              Buy Now
            </Button>
          </div>
          <Button
            onClick={() => toggleWishlist.mutate(product.id)}
            variant="ghost"
            size="sm"
            className="mt-3"
          >
            <Heart
              className={cn(
                "h-4 w-4",
                isInWishlist && "fill-destructive text-destructive",
              )}
            />
            {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
          </Button>

          {selectedVariant &&
            Object.keys(selectedVariant.attributes).length > 0 && (
              <div className="mt-7 border-t border-border/70 pt-6">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Specifications
                </h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono-data text-xs">
                  {Object.entries(selectedVariant.attributes).map(
                    ([key, value]) => (
                      <div key={key} className="contents">
                        <dt className="text-muted-foreground">{key}</dt>
                        <dd>{value}</dd>
                      </div>
                    ),
                  )}
                </dl>
              </div>
            )}

          <div className="mt-7 rounded-2xl border border-border/70 bg-card/60 p-5">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              About this piece
            </h3>
            <p className="text-sm leading-7 text-muted-foreground">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      <ReviewsSection
        productId={product.id}
        avgRating={product.avgRating}
        reviewCount={product.reviewCount}
      />

      {product.relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 font-display text-2xl font-bold tracking-[-0.04em]">
            Related products
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {product.relatedProducts.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.slug}`}
                className="group flex flex-col gap-2"
              >
                <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-secondary ring-1 ring-border/60">
                  {p.thumbnailUrl && (
                    <img
                      src={p.thumbnailUrl}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                  {p.brand}
                </p>
                <h3 className="line-clamp-2 font-display text-base font-semibold">
                  {p.name}
                </h3>
                <span className="font-mono-data text-sm font-bold">
                  {formatCents(p.priceCents)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recentlyViewed && recentlyViewed.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 font-display text-lg font-semibold">
            Recently viewed
          </h2>
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
