import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/common/StarRating";
import { useAdminReviews, useApproveReview, useHideReview, useAdminDeleteReview } from "@/features/admin/useAdminReviews";
import { cn } from "@/lib/utils";

const STATUS_TABS = ["PENDING", "APPROVED", "HIDDEN"] as const;

export function AdminReviewsPage() {
  const [status, setStatus] = useState<(typeof STATUS_TABS)[number]>("PENDING");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminReviews({ status, page });
  const approve = useApproveReview();
  const hide = useHideReview();
  const remove = useAdminDeleteReview();

  return (
    <main className="container py-8">
      <h1 className="mb-6 font-display text-2xl font-semibold">Review Moderation</h1>

      <div className="mb-6 flex gap-2">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              status === s ? "border-primary bg-primary text-primary-foreground" : "border-input text-muted-foreground hover:bg-secondary",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-md bg-secondary" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No {status.toLowerCase()} reviews.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {data.items.map((review) => (
            <div key={review.id} className="rounded-md border border-border p-4">
              <div className="flex items-center justify-between">
                <Link to={`/products/${review.product.slug}`} className="text-sm font-medium hover:underline">
                  {review.product.name}
                </Link>
                <StarRating value={review.rating} size="sm" />
              </div>
              {review.title && <p className="mt-1 text-sm font-medium">{review.title}</p>}
              <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {review.user.firstName} {review.user.lastName} ·{" "}
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-2 flex gap-2">
                {status !== "APPROVED" && (
                  <Button size="sm" variant="outline" onClick={() => approve.mutate(review.id)}>
                    Approve
                  </Button>
                )}
                {status !== "HIDDEN" && (
                  <Button size="sm" variant="outline" onClick={() => hide.mutate(review.id)}>
                    Hide
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => remove.mutate(review.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2 text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="flex items-center px-2 text-muted-foreground">
            Page {page} of {data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </main>
  );
}
