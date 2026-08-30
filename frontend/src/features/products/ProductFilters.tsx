import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBrandList } from "./useProducts";
import type { ProductListParams } from "@/types/product";

interface ProductFiltersProps {
  filters: ProductListParams;
  onChange: (patch: Partial<ProductListParams>) => void;
  onClear: () => void;
}

export function ProductFilters({
  filters,
  onChange,
  onClear,
}: ProductFiltersProps) {
  const { data: brands, isLoading: brandsLoading } = useBrandList();
  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() ?? "");

  function applyPriceRange() {
    onChange({
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  }

  function toggleBrand(slug: string) {
    const current = filters.brand ?? [];
    const next = current.includes(slug)
      ? current.filter((b) => b !== slug)
      : [...current, slug];
    onChange({ brand: next.length > 0 ? next : undefined });
  }

  return (
    <aside className="flex w-full flex-col gap-6 rounded-2xl border border-border/70 bg-card/60 p-5 lg:w-64 lg:shrink-0">
      <div className="flex items-center justify-between border-b border-border/70 pb-4">
        <h2 className="font-display text-lg font-semibold tracking-[-0.03em]">
          Filters
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-auto px-1 text-xs text-primary"
        >
          Clear all
        </Button>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Price range
        </h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={applyPriceRange}
            className="h-9 text-sm"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={applyPriceRange}
            className="h-9 text-sm"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Rating
        </h3>
        <div className="flex flex-col gap-1.5">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() =>
                onChange({
                  minRating: filters.minRating === rating ? undefined : rating,
                })
              }
              className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                filters.minRating === rating
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                />
              ))}
              <span className="ml-1">& up</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Brand
        </h3>
        {brandsLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-4 w-24 animate-pulse rounded bg-secondary"
              />
            ))}
          </div>
        ) : (
          <div className="flex max-h-48 flex-col gap-1.5 overflow-y-auto pr-1">
            {brands?.map((brand) => (
              <label key={brand.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(filters.brand ?? []).includes(brand.slug)}
                  onChange={() => toggleBrand(brand.slug)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <span>{brand.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({brand.productCount})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={filters.inStockOnly ?? false}
            onChange={(e) =>
              onChange({ inStockOnly: e.target.checked || undefined })
            }
            className="h-4 w-4 rounded border-input accent-primary"
          />
          In stock only
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={filters.discountedOnly ?? false}
            onChange={(e) =>
              onChange({ discountedOnly: e.target.checked || undefined })
            }
            className="h-4 w-4 rounded border-input accent-primary"
          />
          On sale
        </label>
      </div>
    </aside>
  );
}
