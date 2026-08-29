import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { adminProductsApi } from "@/api/adminProducts.api";
import type { CreateProductInput } from "@/types/adminProduct";

const KEY = ["admin", "products"];

function errorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    return (err.response?.data as { message?: string } | undefined)?.message ?? fallback;
  }
  return fallback;
}

export function useAdminProducts(params: { search?: string; page?: number }) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => adminProductsApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductInput) => adminProductsApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY });
      toast.success("Product created");
    },
    onError: (err) => toast.error(errorMessage(err, "Couldn't create product")),
  });
}

export function useSetProductActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, isActive }: { productId: string; isActive: boolean }) =>
      adminProductsApi.setActive(productId, isActive),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: KEY }),
    onError: (err) => toast.error(errorMessage(err, "Couldn't update product")),
  });
}
