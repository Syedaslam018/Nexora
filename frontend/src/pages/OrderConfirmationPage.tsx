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
    refetchInterval: (query) => (query.state.data?.status === "PENDING" ? 2000 : false),
  });

  if (isLoading || !order) {
    return (
      <main className="container flex min-h-[50vh] items-center justify-center py-12">
        <div className="h-6 w-48 animate-pulse rounded bg-secondary" />
      </main>
    );
  }

  const isPending = order.status === "PENDING";
  const isCancelled = order.status === "CANCELLED";

  return (
    <main className="container max-w-2xl py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        {isCancelled ? (
          <XCircle className="h-12 w-12 text-destructive" />
        ) : isPending ? (
          <Clock className="h-12 w-12 animate-pulse text-muted-foreground" />
        ) : (
          <CheckCircle2 className="h-12 w-12 text-accent" />
        )}
        <h1 className="font-display text-2xl font-semibold">
          {isCancelled
            ? "Payment didn't go through"
            : isPending
              ? "Confirming your payment…"
              : "Order confirmed"}
        </h1>
        <p className="font-mono-data text-sm text-muted-foreground">{order.orderNumber}</p>
      </div>

      <div className="mt-8">
        <OrderTimeline history={order.statusHistory} />
      </div>

      <div className="mt-6 flex flex-col gap-2 rounded-md border border-border p-5 font-mono-data text-sm">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-muted-foreground">
            <span>
              {item.productNameSnapshot} ({item.variantNameSnapshot}) × {item.quantity}
            </span>
            <span>{formatCents(item.totalCents)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold">
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
