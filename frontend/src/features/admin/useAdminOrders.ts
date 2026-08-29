import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminOrdersApi, type AdminOrderListParams } from "@/api/adminOrders.api";
import type { OrderStatus } from "@/types/order";

const KEY = ["admin", "orders"];

export function useAdminOrderList(params: AdminOrderListParams) {
  return useQuery({
    queryKey: [...KEY, "list", params],
    queryFn: () => adminOrdersApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminOrderDetail(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => adminOrdersApi.detail(id as string),
    enabled: Boolean(id),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: OrderStatus; note?: string }) =>
      adminOrdersApi.updateStatus(id, status, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY });
      toast.success("Order status updated");
    },
    onError: () => toast.error("Couldn't update order status"),
  });
}
