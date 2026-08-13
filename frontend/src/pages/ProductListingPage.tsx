import { useSearchParams } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { ProductGrid } from "@/features/products/ProductGrid";
import { ProductFilters } from "@/features/products/ProductFilters";
import { SortDropdown } from "@/features/products/SortDropdown";
import { Pagination } from "@/features/products/Pagination";
import { useProductList } from "@/features/products/useProducts";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { ProductListParams, SortOption } from "@/types/product";

/**
 * Every filter lives in the URL (Section 3's "URL-based filters"
 * requirement) rather than component state — so a filtered/sorted listing
 * is shareable/bookmarkable and survives a back-button press.
 */
function paramsFromSearchParams(searchParams: URLSearchParams): ProductListParams {
  const brand = searchParams.getAll("brand");
  return {
    search: searchParams.get("search") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    brand: brand.length > 0 ? brand : undefined,
    minPrice: searchParams.has("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.has("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    minRating: searchParams.has("minRating") ? Number(searchParams.get("minRating")) : undefined,
    inStockOnly: searchParams.get("inStockOnly") === "true" || undefined,
    discountedOnly: searchParams.get("discountedOnly") === "true" || undefined,
    sort: (searchParams.get("sort") as SortOption | null) ?? "relevance",
    page: searchParams.has("page") ? Number(searchParams.get("page")) : 1,
  };
}

function searchParamsFromParams(params: ProductListParams): URLSearchParams {
  const sp = new URLSearchParams();
  if (params.search) sp.set("search", params.search);
  if (params.category) sp.set("category", params.category);
  params.brand?.forEach((b) => sp.append("brand", b));
  if (params.minPrice !== undefined) sp.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) sp.set("maxPrice", String(params.maxPrice));
  if (params.minRating !== undefined) sp.set("minRating", String(params.minRating));
  if (params.inStockOnly) sp.set("inStockOnly", "true");
  if (params.discountedOnly) sp.set("discountedOnly", "true");
  if (params.sort && params.sort !== "relevance") sp.set("sort", params.sort);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  return sp;
}

export function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlFilters = useMemo(() => paramsFromSearchParams(searchParams), [searchParams]);

  // The search box itself is local + debounced so typing doesn't refetch on
  // every keystroke; every other filter updates the URL immediately.
  const [searchInput, setSearchInput] = useState(urlFilters.search ?? "");
  const debouncedSearch = useDebouncedValue(searchInput, 350);

  useEffect(() => {
    if (debouncedSearch !== (urlFilters.search ?? "")) {
      updateFilters({ search: debouncedSearch || undefined, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  function updateFilters(patch: Partial<ProductListParams>) {
    const next = { ...urlFilters, ...patch };
    if (!("page" in patch)) next.page = 1; // any filter change resets to page 1
    setSearchParams(searchParamsFromParams(next));
  }

  function clearFilters() {
    setSearchInput("");
    setSearchParams(new URLSearchParams());
  }

  const { data, isLoading, isFetching } = useProductList({ ...urlFilters, pageSize: 20 });

  return (
    <main className="container py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold">
          {urlFilters.category
            ? urlFilters.category.replace(/-/g, " ")
            : urlFilters.search
              ? `Results for "${urlFilters.search}"`
              : "All Products"}
        </h1>
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Refine search…"
          className="hidden h-9 w-56 rounded-md border border-input bg-background px-3 text-sm sm:block"
        />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <ProductFilters filters={urlFilters} onChange={updateFilters} onClear={clearFilters} />

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {data ? `${data.meta.totalItems} products` : isLoading ? "Loading…" : ""}
              {isFetching && !isLoading && " · updating…"}
            </p>
            <SortDropdown
              value={urlFilters.sort ?? "relevance"}
              onChange={(sort) => updateFilters({ sort })}
            />
          </div>

          <ProductGrid products={data?.items ?? []} isLoading={isLoading} />

          {data && (
            <Pagination meta={data.meta} onPageChange={(page) => updateFilters({ page })} />
          )}
        </div>
      </div>
    </main>
  );
}
