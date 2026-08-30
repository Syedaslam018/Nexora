import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RatingBreakdown } from "./RatingBreakdown";
import { ReviewListItem } from "./ReviewListItem";
import { ReviewForm } from "./ReviewForm";
import { Pagination } from "@/features/products/Pagination";
import { useProductReviews, useMyReview, useDeleteReview } from "./useReviews";
import { useIsAuthenticated } from "@/hooks/useAuth";

export function ReviewsSection({
  productId,
  avgRating,
  reviewCount,
}: {
  productId: string;
  avgRating: number;
  reviewCount: number;
}) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"newest" | "highest_rated" | "lowest_rated">(
    "newest",
  );
  const [showForm, setShowForm] = useState(false);
  const isAuthenticated = useIsAuthenticated();

  const { data, isLoading } = useProductReviews(productId, { sort, page });
  const { data: myReview } = useMyReview(productId);
  const deleteReview = useDeleteReview();

  return (
    <section id="reviews" className="mt-20 border-t border-border/70 pt-10">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
        Community notes
      </p>
      <h2 className="mb-6 font-display text-3xl font-bold tracking-[-0.05em]">
        Reviews
      </h2>

      {data && (
        <RatingBreakdown
          distribution={data.distribution}
          avgRating={avgRating}
          reviewCount={reviewCount}
        />
      )}

      <div className="mt-6">
        {!isAuthenticated ? (
          <p className="text-sm text-muted-foreground">
            <a href="/login" className="text-primary hover:underline">
              Log in
            </a>{" "}
            to write a review of a product you've purchased.
          </p>
        ) : myReview === null && !showForm ? (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            Write a review
          </Button>
        ) : myReview && !showForm ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              You reviewed this product
              {myReview.status === "PENDING" && " (awaiting approval)"}
              {myReview.status === "HIDDEN" && " (hidden by moderation)"}.
            </span>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(true)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteReview.mutate(myReview.id)}
            >
              Delete
            </Button>
          </div>
        ) : showForm ? (
          <ReviewForm
            productId={productId}
            existingReview={myReview ?? undefined}
            onDone={() => setShowForm(false)}
          />
        ) : null}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data?.meta.totalItems ?? 0} reviews
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
        >
          <option value="newest">Newest</option>
          <option value="highest_rated">Highest rated</option>
          <option value="lowest_rated">Lowest rated</option>
        </select>
      </div>

      {isLoading ? (
        <div className="mt-4 flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-secondary"
            />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="mt-2">
          {data.items.map((review) => (
            <ReviewListItem key={review.id} review={review} />
          ))}
          <Pagination meta={data.meta} onPageChange={setPage} />
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No reviews yet — be the first to write one.
        </p>
      )}
    </section>
  );
}
