import { StarRating } from "@/components/common/StarRating";
import type { Review } from "@/types/review";

export function ReviewListItem({ review }: { review: Review }) {
  return (
    <div className="border-b border-border py-4 last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StarRating value={review.rating} size="sm" />
          {review.isVerifiedPurchase && (
            <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent-foreground">
              Verified Purchase
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      {review.title && <p className="mt-1.5 text-sm font-medium">{review.title}</p>}
      <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>
      {review.images.length > 0 && (
        <div className="mt-2 flex gap-2">
          {review.images.map((img) => (
            <img key={img.id} src={img.url} alt="" className="h-16 w-16 rounded-md object-cover" />
          ))}
        </div>
      )}
      <p className="mt-1.5 text-xs text-muted-foreground">
        {review.user.firstName} {review.user.lastName.charAt(0)}.
      </p>
    </div>
  );
}
