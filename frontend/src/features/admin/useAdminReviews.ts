import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminReviewsApi } from "@/api/adminReviews.api";

const KEY = ["admin", "reviews"];

export function useAdminReviews(params: { status?: string; page?: number }) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => adminReviewsApi.list(params),
  });
}

export function useApproveReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminReviewsApi.approve(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY });
      toast.success("Review approved");
    },
  });
}

export function useHideReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminReviewsApi.hide(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY });
      toast.success("Review hidden");
    },
  });
}

export function useAdminDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminReviewsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY });
      toast.success("Review deleted");
    },
  });
}
