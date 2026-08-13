import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/api/products.api";
import { categoriesApi, brandsApi } from "@/api/catalog.api";
import type { ProductListParams } from "@/types/product";

export function useProductList(params: ProductListParams) {
  return useQuery({
    queryKey: ["products", "list", params],
    queryFn: () => productsApi.list(params),
    placeholderData: (prev) => prev, // keep old page visible while the next page loads
  });
}

export function useProductDetail(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: ["products", "detail", idOrSlug],
    queryFn: () => productsApi.detail(idOrSlug as string),
    enabled: Boolean(idOrSlug),
  });
}

export function useCategoryTree() {
  return useQuery({
    queryKey: ["categories", "tree"],
    queryFn: () => categoriesApi.tree(),
    staleTime: 5 * 60 * 1000, // categories change rarely
  });
}

export function useBrandList() {
  return useQuery({
    queryKey: ["brands", "list"],
    queryFn: () => brandsApi.list(),
    staleTime: 5 * 60 * 1000,
  });
}
