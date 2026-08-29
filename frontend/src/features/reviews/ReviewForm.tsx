import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StarRating } from "@/components/common/StarRating";
import { useCreateReview, useUpdateReview } from "./useReviews";
import type { Review } from "@/types/review";

export function ReviewForm({
  productId,
  existingReview,
  onDone,
}: {
  productId: string;
  existingReview?: Review;
  onDone?: () => void;
}) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [title, setTitle] = useState(existingReview?.title ?? "");
  const [body, setBody] = useState(existingReview?.body ?? "");

  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const isPending = createReview.isPending || updateReview.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0 || body.trim().length === 0) return;

    if (existingReview) {
      updateReview.mutate(
        { id: existingReview.id, input: { rating, title: title || undefined, body } },
        { onSuccess: onDone },
      );
    } else {
      createReview.mutate(
        { productId, rating, title: title || undefined, body },
        { onSuccess: onDone },
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border border-border p-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Your rating</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Title (optional)</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Review</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={2000}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        />
      </div>
      <Button type="submit" isLoading={isPending} disabled={rating === 0} className="w-fit">
        {existingReview ? "Update review" : "Submit review"}
      </Button>
    </form>
  );
}
