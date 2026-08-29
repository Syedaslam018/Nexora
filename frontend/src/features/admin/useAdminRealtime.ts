import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSocket } from "@/lib/socket";
import { useCurrentUser } from "@/hooks/useAuth";

interface NewOrderEvent {
  orderId: string;
  orderNumber: string;
  totalCents: number;
  paymentMethod: string;
}

interface LowStockEvent {
  variantId: string;
  productName: string;
  variantName: string;
  availableQty: number;
}

/**
 * Live admin alerts — "new order" and "low stock" push straight from the
 * backend (see backend/src/sockets/index.ts's `admins` room) without the
 * admin needing to refresh the page. Mount once in AdminLayout so it's
 * active across every admin page, not just the dashboard.
 */
export function useAdminRealtime() {
  const queryClient = useQueryClient();
  const user = useCurrentUser();
  const isAdmin = user?.role === "ADMIN" || user?.role === "STAFF";

  useEffect(() => {
    if (!isAdmin) return;
    const socket = getSocket();

    function handleNewOrder(event: NewOrderEvent) {
      toast.info("New order", { description: `${event.orderNumber} — $${(event.totalCents / 100).toFixed(2)}` });
      void queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    }

    function handleLowStock(event: LowStockEvent) {
      toast.warning("Low stock alert", {
        description: `${event.productName} (${event.variantName}) — ${event.availableQty} left`,
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    }

    socket.on("order:new", handleNewOrder);
    socket.on("inventory:low-stock", handleLowStock);
    return () => {
      socket.off("order:new", handleNewOrder);
      socket.off("inventory:low-stock", handleLowStock);
    };
  }, [isAdmin, queryClient]);
}
