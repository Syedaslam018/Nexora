import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { ordersApi } from "@/api/orders.api";
import type { CreateOrderInput } from "@/types/order";

export function useCreateOrder() {
  return useMutation({
    mutationFn: (input: CreateOrderInput) => ordersApi.create(input),
  });
}

export function orderErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    return (err.response?.data as { message?: string } | undefined)?.message ?? fallback;
  }
  return fallback;
}
