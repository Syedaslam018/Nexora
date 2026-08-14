import type { OrderStatusHistoryEntry, OrderStatus } from "@/types/order";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Awaiting payment confirmation",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export { STATUS_LABELS };

export function OrderTimeline({ history }: { history: OrderStatusHistoryEntry[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-5">
      {history.map((entry) => (
        <div key={entry.id} className="flex items-start gap-3 text-sm">
          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
          <div>
            <p className="font-medium">{STATUS_LABELS[entry.status]}</p>
            {entry.note && <p className="text-muted-foreground">{entry.note}</p>}
            <p className="font-mono-data text-xs text-muted-foreground">
              {new Date(entry.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
