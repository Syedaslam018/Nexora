import { useParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OrderTimeline, STATUS_LABELS } from "@/features/orders/OrderTimeline";
import { useAdminOrderDetail, useUpdateOrderStatus } from "@/features/admin/useAdminOrders";
import { formatCents } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

const ADVANCEABLE_STATUSES: OrderStatus[] = [
  "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUNDED",
];

export function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading } = useAdminOrderDetail(orderId);
  const updateStatus = useUpdateOrderStatus();
  const [nextStatus, setNextStatus] = useState<OrderStatus | "">("");
  const [note, setNote] = useState("");

  if (isLoading || !order) {
    return (
      <main className="container py-8">
        <div className="h-8 w-64 animate-pulse rounded bg-secondary" />
      </main>
    );
  }

  return (
    <main className="container max-w-3xl py-8">
      <h1 className="font-mono-data text-xl font-semibold">{order.orderNumber}</h1>
      <p className="text-sm text-muted-foreground">
        {order.user.firstName} {order.user.lastName} · {order.user.email}
      </p>

      <div className="mt-6 flex items-end gap-2 rounded-md border border-border p-4">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Update status</label>
          <select
            value={nextStatus}
            onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Select new status…</option>
            {ADVANCEABLE_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Note (optional)</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <Button
          disabled={!nextStatus}
          isLoading={updateStatus.isPending}
          onClick={() => {
            if (nextStatus) {
              updateStatus.mutate({ id: order.id, status: nextStatus, note: note || undefined });
              setNextStatus("");
              setNote("");
            }
          }}
        >
          Update
        </Button>
      </div>

      <div className="mt-6">
        <OrderTimeline history={order.statusHistory} />
      </div>

      <div className="mt-6 flex flex-col gap-2 rounded-md border border-border p-5">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Items</h2>
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium">{item.productNameSnapshot}</p>
              <p className="text-xs text-muted-foreground">
                {item.variantNameSnapshot} · SKU {item.skuSnapshot} · Qty {item.quantity}
              </p>
            </div>
            <span className="font-mono-data">{formatCents(item.totalCents)}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-md border border-border p-5">
          <h2 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Shipping Address
          </h2>
          <p className="text-sm">{order.shippingAddress.fullName}</p>
          <p className="text-sm text-muted-foreground">
            {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country}
          </p>
        </div>

        <div className="rounded-md border border-border p-5">
          <h2 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Payment
          </h2>
          {order.payments.map((p) => (
            <p key={p.id} className="text-sm">
              {p.provider} — <span className="font-mono-data">{p.status}</span> — {formatCents(p.amountCents)}
            </p>
          ))}
          <div className="mt-3 font-mono-data text-sm">
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <span>Total</span>
              <span>{formatCents(order.totalCents)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
