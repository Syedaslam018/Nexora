import { Link } from "react-router-dom";
import { Heart, X } from "lucide-react";
import { formatCents } from "@/lib/utils";
import {
  useWishlist,
  useToggleWishlist,
  useMoveWishlistItemToCart,
} from "@/features/wishlist/useWishlist";
import { Button } from "@/components/ui/button";

export function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist();
  const toggleWishlist = useToggleWishlist();
  const moveToCart = useMoveWishlistItemToCart();

  if (isLoading) {
    return (
      <main className="container py-8">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-secondary" />
      </main>
    );
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <main className="container flex min-h-[50vh] flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Heart className="h-7 w-7" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-[-0.05em]">
          Your wishlist is empty
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Save the pieces you love and come back when the time is right.
        </p>
        <Link
          to="/products"
          className="mt-2 rounded-xl gradient-brand px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft"
        >
          Shop products
        </Link>
      </main>
    );
  }

  return (
    <main className="container py-10 sm:py-14">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
        Saved for later
      </p>
      <h1 className="mb-8 font-display text-4xl font-bold tracking-[-0.06em]">
        Your wishlist
      </h1>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
        {wishlist.items.map((item) => (
          <div key={item.productId} className="group flex flex-col gap-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary ring-1 ring-border/60">
              <Link to={`/products/${item.productSlug}`}>
                {item.thumbnailUrl && (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.productName}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </Link>
              <button
                onClick={() => toggleWishlist.mutate(item.productId)}
                className="absolute right-3 top-3 rounded-full bg-background/90 p-2 text-muted-foreground shadow-sm backdrop-blur transition hover:text-destructive"
                aria-label="Remove from wishlist"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {!item.inStock && (
                <span className="absolute inset-x-0 bottom-0 bg-foreground/80 py-1 text-center text-[11px] font-medium text-background">
                  Out of stock
                </span>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                {item.brand}
              </p>
              <Link
                to={`/products/${item.productSlug}`}
                className="line-clamp-2 font-display text-base font-semibold transition-colors hover:text-primary"
              >
                {item.productName}
              </Link>
              <div className="mt-1 flex items-baseline gap-2 font-mono-data">
                <span className="text-sm font-semibold">
                  {formatCents(item.priceCents)}
                </span>
                {item.compareAtPriceCents && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCents(item.compareAtPriceCents)}
                  </span>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={
                !item.inStock || !item.defaultVariantId || moveToCart.isPending
              }
              className="mt-1 w-full"
              onClick={() =>
                item.defaultVariantId &&
                moveToCart.mutate({
                  productId: item.productId,
                  variantId: item.defaultVariantId,
                })
              }
            >
              Move to Cart
            </Button>
          </div>
        ))}
      </div>
    </main>
  );
}
