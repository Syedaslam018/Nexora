import { useState } from "react";
import { Link } from "react-router-dom";
import { useOrderList } from "@/features/orders/useOrders";
import { STATUS_LABELS } from "@/features/orders/OrderTimeline";
import { Pagination } from "@/features/products/Pagination";
import { formatCents, cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

const STATUS_FILTERS: (OrderStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

function statusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "DELIVERED":
      return "bg-accent/15 text-accent-foreground";
    case "CANCELLED":
    case "REFUNDED":
      return "bg-destructive/10 text-destructive";
    case "PENDING":
      return "bg-warning/15 text-warning-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

export function OrdersListPage() {
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useOrderList({
    status: status === "ALL" ? undefined : status,
    page,
    pageSize: 10,
  });

  return (
    <main className="container py-8">
      <h1 className="mb-6 font-display text-2xl font-semibold">Order History</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              status === s ? "border-primary bg-primary text-primary-foreground" : "border-input text-muted-foreground hover:bg-secondary",
            )}
          >
            {s === "ALL" ? "All" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-md bg-secondary" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-24 text-center">
          <p className="font-display text-lg font-medium">No orders yet</p>
          <Link to="/products" className="text-sm text-primary hover:underline">
            Start shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {data.items.map((order) => (
              <Link
                key={order.id}
                to={`/account/orders/${order.id}`}
                className="flex items-center justify-between rounded-md border border-border p-4 text-sm transition-colors hover:border-primary"
              >
                <div>
                  <p className="font-mono-data font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", statusBadgeClass(order.status))}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className="font-mono-data font-semibold">{formatCents(order.totalCents)}</span>
                </div>
              </Link>
            ))}
          </div>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}
    </main>
  );
}
