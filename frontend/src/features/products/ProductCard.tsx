import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Heart, Star } from "lucide-react";
import { cn, formatCents } from "@/lib/utils";
import type { ProductListItem } from "@/types/product";

export const ProductCard = memo(function ProductCard({
  product,
}: {
  product: ProductListItem;
}) {
  return (
    <article className="group relative flex min-w-0 flex-col">
      <Link
        to={`/products/${product.slug}`}
        className="relative mb-4 block aspect-[4/5] overflow-hidden rounded-2xl bg-secondary/70 ring-1 ring-border/60 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lift"
      >
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image available
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {product.discountPercent ? (
          <span className="absolute left-3 top-3 rounded-full bg-warning px-2.5 py-1 font-mono-data text-[10px] font-bold tracking-wide text-warning-foreground">
            -{product.discountPercent}%
          </span>
        ) : (
          <span className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground backdrop-blur">
            Curated
          </span>
        )}
        <span
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/85 text-foreground opacity-0 shadow-sm backdrop-blur transition-all duration-300 group-hover:opacity-100"
          aria-hidden="true"
        >
          <Heart className="h-4 w-4" />
        </span>
        <span className="absolute bottom-3 right-3 inline-flex translate-y-2 items-center gap-1 rounded-full bg-background px-3 py-2 text-xs font-semibold text-foreground opacity-0 shadow-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View details <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
        {!product.inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-foreground/80 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-background backdrop-blur">
            Out of stock
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
          {product.brand.name}
        </p>
        <h3 className="line-clamp-2 font-display text-base font-semibold leading-tight transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          {product.reviewCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />{" "}
              {product.avgRating.toFixed(1)}{" "}
              <span className="text-muted-foreground/60">
                ({product.reviewCount})
              </span>
            </span>
          )}
          <span
            className={cn(
              "ml-auto font-mono-data text-sm font-bold",
              !product.inStock && "text-muted-foreground",
            )}
          >
            {formatCents(product.priceCents)}
          </span>
          {product.compareAtPriceCents && (
            <span className="font-mono-data text-xs text-muted-foreground line-through">
              {formatCents(product.compareAtPriceCents)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
});
