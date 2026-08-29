import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { adminCouponsApi } from "@/api/adminCoupons.api";
import type { CreateCouponInput, UpdateCouponInput } from "@/types/coupon";

const KEY = ["admin", "coupons"];

function errorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    return (err.response?.data as { message?: string } | undefined)?.message ?? fallback;
  }
  return fallback;
}

export function useAdminCoupons(params: { page?: number }) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => adminCouponsApi.list(params),
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCouponInput) => adminCouponsApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY });
      toast.success("Coupon created");
    },
    onError: (err) => toast.error(errorMessage(err, "Couldn't create coupon")),
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCouponInput }) =>
      adminCouponsApi.update(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY });
      toast.success("Coupon updated");
    },
    onError: (err) => toast.error(errorMessage(err, "Couldn't update coupon")),
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminCouponsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY });
      toast.success("Coupon deleted");
    },
    onError: (err) => toast.error(errorMessage(err, "Couldn't delete coupon")),
  });
}
