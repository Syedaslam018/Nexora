import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ordersApi, type OrderListParams } from "@/api/orders.api";
import { orderErrorMessage } from "@/features/checkout/useCreateOrder";

export function useOrderList(params: OrderListParams) {
  return useQuery({
    queryKey: ["orders", "list", params],
    queryFn: () => ordersApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useOrderDetail(orderId: string | undefined) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => ordersApi.detail(orderId as string),
    enabled: Boolean(orderId),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => ordersApi.cancel(id, reason),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(order.status === "REFUNDED" ? "Order cancelled and refunded" : "Order cancelled");
    },
    onError: (err) => toast.error(orderErrorMessage(err, "Couldn't cancel order")),
  });
}

export function useRequestRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      ordersApi.requestRefund(id, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Refund requested");
    },
    onError: (err) => toast.error(orderErrorMessage(err, "Couldn't request refund")),
  });
}

export function useReorder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordersApi.reorder(id),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
      if (result.added.length > 0) toast.success(`Added ${result.added.length} item(s) to cart`);
      if (result.skipped.length > 0) {
        toast.warning(`${result.skipped.length} item(s) couldn't be added — no longer available`);
      }
    },
    onError: (err) => toast.error(orderErrorMessage(err, "Couldn't reorder")),
  });
}

export function useDownloadInvoice() {
  return useMutation({
    mutationFn: ({ id, orderNumber }: { id: string; orderNumber: string }) =>
      ordersApi.downloadInvoice(id, orderNumber),
    onError: () => toast.error("Couldn't download invoice"),
  });
}
