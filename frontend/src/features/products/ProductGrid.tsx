import { ProductCard } from "./ProductCard";
import { SearchX } from "lucide-react";
import type { ProductListItem } from "@/types/product";

export function ProductGrid({
  products,
  isLoading,
}: {
  products: ProductListItem[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex animate-pulse flex-col gap-3">
            <div className="aspect-[4/5] rounded-md bg-secondary" />
            <div className="h-2.5 w-1/3 rounded-full bg-secondary" />
            <div className="h-4 w-3/4 rounded-full bg-secondary" />
            <div className="h-4 w-1/3 rounded-full bg-secondary" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-card/50 px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <SearchX className="h-5 w-5" />
        </div>
        <p className="font-display text-lg font-semibold">No products found</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Try adjusting your filters or search to discover something new.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
