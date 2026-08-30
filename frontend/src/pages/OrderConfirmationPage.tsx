import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { ordersApi } from "@/api/orders.api";
import { formatCents } from "@/lib/utils";
import { OrderTimeline } from "@/features/orders/OrderTimeline";

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => ordersApi.detail(orderId as string),
    enabled: Boolean(orderId),
    refetchInterval: (query) =>
      query.state.data?.status === "PENDING" ? 2000 : false,
  });

  if (isLoading || !order) {
    return (
      <main className="container flex min-h-[50vh] items-center justify-center py-12">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-secondary" />
      </main>
    );
  }

  const isPending = order.status === "PENDING";
  const isCancelled = order.status === "CANCELLED";

  return (
    <main className="container max-w-2xl py-12 sm:py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        {isCancelled ? (
          <XCircle className="h-14 w-14 text-destructive" />
        ) : isPending ? (
          <Clock className="h-14 w-14 animate-pulse text-warning" />
        ) : (
          <CheckCircle2 className="h-14 w-14 text-accent" />
        )}
        <h1 className="font-display text-4xl font-bold tracking-[-0.06em]">
          {isCancelled
            ? "Payment didn't go through"
            : isPending
              ? "Confirming your payment…"
              : "Order confirmed"}
        </h1>
        <p className="font-mono-data text-sm text-muted-foreground">
          {order.orderNumber}
        </p>
      </div>

      <div className="mt-8">
        <OrderTimeline history={order.statusHistory} />
      </div>

      <div className="mt-8 flex flex-col gap-2 rounded-2xl border border-border/70 bg-card/70 p-6 font-mono-data text-sm shadow-soft">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between text-muted-foreground"
          >
            <span>
              {item.productNameSnapshot} ({item.variantNameSnapshot}) ×{" "}
              {item.quantity}
            </span>
            <span>{formatCents(item.totalCents)}</span>
          </div>
        ))}
        <div className="mt-3 flex justify-between border-t border-border/70 pt-4 text-lg font-bold">
          <span>Total</span>
          <span>{formatCents(order.totalCents)}</span>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4 text-sm">
        <Link to="/products" className="text-primary hover:underline">
          Continue shopping
        </Link>
        <Link to="/account/orders" className="text-primary hover:underline">
          View order history
        </Link>
      </div>
    </main>
  );
}
