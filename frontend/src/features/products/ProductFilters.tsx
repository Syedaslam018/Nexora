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

export function ProductFilters({ filters, onChange, onClear }: ProductFiltersProps) {
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
    const next = current.includes(slug) ? current.filter((b) => b !== slug) : [...current, slug];
    onChange({ brand: next.length > 0 ? next : undefined });
  }

  return (
    <aside className="flex w-full flex-col gap-6 lg:w-64 lg:shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide">Filters</h2>
        <Button variant="ghost" size="sm" onClick={onClear} className="h-auto p-0 text-xs">
          Clear all
        </Button>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Price</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={applyPriceRange}
            className="h-8 text-sm"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={applyPriceRange}
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Rating</h3>
        <div className="flex flex-col gap-1.5">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => onChange({ minRating: filters.minRating === rating ? undefined : rating })}
              className={`flex items-center gap-1 text-sm ${
                filters.minRating === rating ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
        <h3 className="mb-2 text-sm font-medium">Brand</h3>
        {brandsLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 w-24 animate-pulse rounded bg-secondary" />
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
                  className="h-3.5 w-3.5 rounded border-input"
                />
                <span>{brand.name}</span>
                <span className="text-xs text-muted-foreground">({brand.productCount})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.inStockOnly ?? false}
            onChange={(e) => onChange({ inStockOnly: e.target.checked || undefined })}
            className="h-3.5 w-3.5 rounded border-input"
          />
          In stock only
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.discountedOnly ?? false}
            onChange={(e) => onChange({ discountedOnly: e.target.checked || undefined })}
            className="h-3.5 w-3.5 rounded border-input"
          />
          On sale
        </label>
      </div>
    </aside>
  );
}
