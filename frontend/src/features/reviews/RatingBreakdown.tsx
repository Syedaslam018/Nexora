import { StarRating } from "@/components/common/StarRating";
import type { RatingDistribution } from "@/types/review";

export function RatingBreakdown({
  distribution,
  avgRating,
  reviewCount,
}: {
  distribution: RatingDistribution;
  avgRating: number;
  reviewCount: number;
}) {
  const max = Math.max(...Object.values(distribution), 1);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-3xl font-semibold">{avgRating.toFixed(1)}</span>
        <StarRating value={Math.round(avgRating)} />
        <span className="text-xs text-muted-foreground">{reviewCount} reviews</span>
      </div>
      <div className="flex flex-1 flex-col gap-1">
        {([5, 4, 3, 2, 1] as const).map((star) => (
          <div key={star} className="flex items-center gap-2 text-xs">
            <span className="w-3 text-muted-foreground">{star}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-warning"
                style={{ width: `${(distribution[star] / max) * 100}%` }}
              />
            </div>
            <span className="w-6 text-right text-muted-foreground">{distribution[star]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
