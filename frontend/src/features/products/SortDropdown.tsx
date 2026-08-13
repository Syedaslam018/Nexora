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
      className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Sort products"
    >
      {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([value_, label]) => (
        <option key={value_} value={value_}>
          {label}
        </option>
      ))}
    </select>
  );
}
