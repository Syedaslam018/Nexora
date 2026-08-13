import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { cn, formatCents } from "@/lib/utils";
import type { ProductListItem } from "@/types/product";

/**
 * The corner-bracket frame + single hover scan-line is the signature visual
 * element from docs/design-system.md — used only here and on the PDP
 * gallery, nowhere else, so it stays a deliberate accent rather than noise.
 */
export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col gap-2"
    >
      <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}

        {/* Corner brackets — viewfinder-style, per docs/design-system.md */}
        {(["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"] as const).map(
          (pos) => (
            <span
              key={pos}
              className={cn(
                "absolute h-3 w-3 border-foreground/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
                pos,
                pos.includes("top") ? "border-t" : "border-b",
                pos.includes("left") ? "border-l" : "border-r",
              )}
            />
          ),
        )}

        {product.discountPercent && (
          <span className="absolute left-2 top-2 rounded bg-warning px-1.5 py-0.5 font-mono-data text-[11px] font-semibold text-warning-foreground">
            -{product.discountPercent}%
          </span>
        )}
        {!product.inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-foreground/80 py-1 text-center text-[11px] font-medium text-background">
            Out of stock
          </span>
        )}
      </div>

      <div>
        <p className="text-xs text-muted-foreground">{product.brand.name}</p>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">{product.name}</h3>
        <div className="mt-1 flex items-center gap-1.5">
          {product.reviewCount > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-warning text-warning" />
              {product.avgRating.toFixed(1)}
              <span className="text-muted-foreground/70">({product.reviewCount})</span>
            </span>
          )}
        </div>
        <div className="mt-1 flex items-baseline gap-2 font-mono-data">
          <span className="text-sm font-semibold">{formatCents(product.priceCents)}</span>
          {product.compareAtPriceCents && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCents(product.compareAtPriceCents)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
