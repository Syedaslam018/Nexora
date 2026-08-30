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

export function OrderTimeline({
  history,
}: {
  history: OrderStatusHistoryEntry[];
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/70 p-5 shadow-soft">
      {history.map((entry) => (
        <div key={entry.id} className="flex items-start gap-3 text-sm">
          <div className="relative mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary shadow-[0_0_0_4px_hsl(var(--primary)/.12)]" />
          <div>
            <p className="font-medium">{STATUS_LABELS[entry.status]}</p>
            {entry.note && (
              <p className="text-muted-foreground">{entry.note}</p>
            )}
            <p className="font-mono-data text-xs text-muted-foreground">
              {new Date(entry.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
