import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { reviewsApi } from "@/api/reviews.api";
import { useIsAuthenticated } from "@/hooks/useAuth";
import type { CreateReviewInput, UpdateReviewInput } from "@/types/review";

function errorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    return (err.response?.data as { message?: string } | undefined)?.message ?? fallback;
  }
  return fallback;
}

export function useProductReviews(productId: string, params: { sort?: string; page?: number }) {
  return useQuery({
    queryKey: ["reviews", "product", productId, params],
    queryFn: () => reviewsApi.listForProduct(productId, params),
    enabled: Boolean(productId),
  });
}

export function useMyReview(productId: string | undefined) {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: ["reviews", "mine", productId],
    queryFn: () => reviewsApi.myReview(productId as string),
    enabled: Boolean(productId) && isAuthenticated,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReviewInput) => reviewsApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reviews"] });
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Review submitted — it'll appear once approved");
    },
    onError: (err) => toast.error(errorMessage(err, "Couldn't submit review")),
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateReviewInput }) =>
      reviewsApi.update(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review updated — it'll be re-checked before showing publicly");
    },
    onError: (err) => toast.error(errorMessage(err, "Couldn't update review")),
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reviews"] });
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Review deleted");
    },
    onError: (err) => toast.error(errorMessage(err, "Couldn't delete review")),
  });
}
