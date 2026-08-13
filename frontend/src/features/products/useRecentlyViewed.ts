import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/api/products.api";

const STORAGE_KEY = "nexora_recently_viewed";
const MAX_ITEMS = 12;

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_ITEMS)));
  } catch {
    // localStorage unavailable (private browsing, quota) — recently-viewed
    // is a nice-to-have, fail silently rather than breaking the page.
  }
}

/** Call on a product detail page mount to record the view. */
export function useRecordProductView(productId: string | undefined) {
  useEffect(() => {
    if (!productId) return;
    const ids = readIds().filter((id) => id !== productId);
    ids.unshift(productId);
    writeIds(ids);
  }, [productId]);
}

/** Call anywhere a "Recently viewed" rail should render — excludes the
 * current product if one is given, so a PDP doesn't show itself. */
export function useRecentlyViewed(excludeId?: string) {
  const ids = readIds().filter((id) => id !== excludeId);
  return useQuery({
    queryKey: ["products", "recently-viewed", ids],
    queryFn: () => productsApi.byIds(ids),
    enabled: ids.length > 0,
  });
}
