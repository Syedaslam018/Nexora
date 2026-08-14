import { Link } from "react-router-dom";
import { Heart, X } from "lucide-react";
import { formatCents } from "@/lib/utils";
import { useWishlist, useToggleWishlist, useMoveWishlistItemToCart } from "@/features/wishlist/useWishlist";
import { Button } from "@/components/ui/button";

export function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist();
  const toggleWishlist = useToggleWishlist();
  const moveToCart = useMoveWishlistItemToCart();

  if (isLoading) {
    return (
      <main className="container py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-secondary" />
      </main>
    );
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <main className="container flex min-h-[50vh] flex-col items-center justify-center gap-3 py-12 text-center">
        <Heart className="h-8 w-8 text-muted-foreground" />
        <h1 className="font-display text-xl font-semibold">Your wishlist is empty</h1>
        <p className="text-sm text-muted-foreground">Save items you're considering for later.</p>
        <Link to="/products" className="text-sm text-primary hover:underline">
          Shop products
        </Link>
      </main>
    );
  }

  return (
    <main className="container py-8">
      <h1 className="mb-6 font-display text-2xl font-semibold">Your Wishlist</h1>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {wishlist.items.map((item) => (
          <div key={item.productId} className="group flex flex-col gap-2">
            <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
              <Link to={`/products/${item.productSlug}`}>
                {item.thumbnailUrl && (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.productName}
                    className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
                  />
                )}
              </Link>
              <button
                onClick={() => toggleWishlist.mutate(item.productId)}
                className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 text-muted-foreground hover:text-destructive"
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
              <p className="text-xs text-muted-foreground">{item.brand}</p>
              <Link to={`/products/${item.productSlug}`} className="line-clamp-2 text-sm font-medium hover:underline">
                {item.productName}
              </Link>
              <div className="mt-1 flex items-baseline gap-2 font-mono-data">
                <span className="text-sm font-semibold">{formatCents(item.priceCents)}</span>
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
              disabled={!item.inStock || !item.defaultVariantId || moveToCart.isPending}
              onClick={() =>
                item.defaultVariantId &&
                moveToCart.mutate({ productId: item.productId, variantId: item.defaultVariantId })
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
