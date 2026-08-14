import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderTimeline, STATUS_LABELS } from "@/features/orders/OrderTimeline";
import {
  useOrderDetail,
  useCancelOrder,
  useRequestRefund,
  useReorder,
  useDownloadInvoice,
} from "@/features/orders/useOrders";
import { formatCents } from "@/lib/utils";

const CANCELLABLE_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING"];

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading } = useOrderDetail(orderId);
  const cancelOrder = useCancelOrder();
  const requestRefund = useRequestRefund();
  const reorder = useReorder();
  const downloadInvoice = useDownloadInvoice();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);

  if (isLoading || !order) {
    return (
      <main className="container py-8">
        <div className="h-8 w-64 animate-pulse rounded bg-secondary" />
      </main>
    );
  }

  const canCancel = CANCELLABLE_STATUSES.includes(order.status);
  const canRequestRefund =
    order.status === "DELIVERED" && order.payments.some((p) => p.status === "SUCCEEDED");

  return (
    <main className="container max-w-3xl py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono-data text-xl font-semibold">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Placed {new Date(order.createdAt).toLocaleDateString()} · {STATUS_LABELS[order.status]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            isLoading={downloadInvoice.isPending}
            onClick={() => downloadInvoice.mutate({ id: order.id, orderNumber: order.orderNumber })}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Invoice
          </Button>
          <Button
            variant="outline"
            size="sm"
            isLoading={reorder.isPending}
            onClick={() => reorder.mutate(order.id)}
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reorder
          </Button>
          {canCancel &&
            (showCancelConfirm ? (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  isLoading={cancelOrder.isPending}
                  onClick={() => cancelOrder.mutate({ id: order.id })}
                >
                  Confirm cancel
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowCancelConfirm(false)}>
                  Never mind
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowCancelConfirm(true)}>
                Cancel order
              </Button>
            ))}
          {canRequestRefund &&
            (showRefundConfirm ? (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  isLoading={requestRefund.isPending}
                  onClick={() => requestRefund.mutate({ id: order.id })}
                >
                  Confirm refund request
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowRefundConfirm(false)}>
                  Never mind
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowRefundConfirm(true)}>
                Request refund
              </Button>
            ))}
        </div>
      </div>

      <OrderTimeline history={order.statusHistory} />

      <div className="mt-6 flex flex-col gap-3 rounded-md border border-border p-5">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Items
        </h2>
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <div>
              {item.product.isActive && !item.product.isArchived ? (
                <Link to={`/products/${item.product.slug}`} className="font-medium hover:underline">
                  {item.productNameSnapshot}
                </Link>
              ) : (
                <span className="font-medium">{item.productNameSnapshot}</span>
              )}
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
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country}
          </p>
        </div>

        <div className="rounded-md border border-border p-5 font-mono-data text-sm">
          <h2 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Total
          </h2>
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCents(order.subtotalCents)}</span>
          </div>
          {order.discountCents > 0 && (
            <div className="flex justify-between text-accent-foreground">
              <span>Discount</span>
              <span>-{formatCents(order.discountCents)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span>{formatCents(order.shippingCents)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax</span>
            <span>{formatCents(order.taxCents)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-border pt-1 font-semibold">
            <span>Total</span>
            <span>{formatCents(order.totalCents)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
