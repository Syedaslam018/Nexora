import type { SortOption } from "@/types/product";

const SORT_LABELS: Record<SortOption, string> = {
  relevance: "Relevance",
  price_low_high: "Price: Low to High",
  price_high_low: "Price: High to Low",
  highest_rated: "Highest Rated",
  most_reviewed: "Most Reviewed",
  newest: "Newest",
  best_selling: "Best Selling",
};

export function SortDropdown({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (value: SortOption) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-semibold shadow-sm transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
      aria-label="Sort products"
    >
      {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(
        ([value_, label]) => (
          <option key={value_} value={value_}>
            {label}
          </option>
        ),
      )}
    </select>
  );
}
