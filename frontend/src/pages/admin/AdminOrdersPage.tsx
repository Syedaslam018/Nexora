import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS } from "@/features/orders/OrderTimeline";
import { useAdminOrderList } from "@/features/admin/useAdminOrders";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatCents, cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

const STATUS_FILTERS: (OrderStatus | "ALL")[] = [
  "ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUNDED",
];

export function AdminOrdersPage() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 350);
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminOrderList({
    search: search || undefined,
    status: status === "ALL" ? undefined : status,
    page,
    pageSize: 15,
  });

  return (
    <main className="container py-8">
      <h1 className="mb-6 font-display text-2xl font-semibold">Orders</h1>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          value={searchInput}
          onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
          placeholder="Search order # or customer…"
          className="max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as OrderStatus | "ALL"); setPage(1); }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>{s === "ALL" ? "All statuses" : STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-md bg-secondary" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((order) => (
                <tr key={order.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-2">
                    <Link to={`/admin/orders/${order.id}`} className="font-mono-data font-medium hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {order.user.firstName} {order.user.lastName}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", "bg-secondary text-secondary-foreground")}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right font-mono-data">{formatCents(order.totalCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2 text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="flex items-center px-2 text-muted-foreground">
            Page {page} of {data.meta.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </main>
  );
}
