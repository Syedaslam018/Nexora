import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AddressSelector } from "@/features/checkout/AddressSelector";
import { DeliveryMethodStep } from "@/features/checkout/DeliveryMethodStep";
import { StripePaymentForm } from "@/features/checkout/StripePaymentForm";
import { useCreateOrder, orderErrorMessage } from "@/features/checkout/useCreateOrder";
import { cartApi } from "@/api/cart.api";
import { formatCents, cn } from "@/lib/utils";
import type { Order } from "@/types/order";

type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: "Shipping Address",
  2: "Delivery Method",
  3: "Payment",
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>(1);
  const [shippingAddressId, setShippingAddressId] = useState<string>();
  const [deliveryMethod, setDeliveryMethod] = useState<"STANDARD" | "EXPRESS">("STANDARD");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "STRIPE">("COD");
  const [pendingOrder, setPendingOrder] = useState<{ order: Order; clientSecret: string | null } | null>(
    null,
  );

  const createOrder = useCreateOrder();

  const { data: cartPreview } = useQuery({
    queryKey: ["cart", "preview", deliveryMethod],
    queryFn: () => cartApi.get({ deliveryMethod }),
  });

  function goToPayment() {
    setStep(3);
  }

  async function handlePlaceOrder() {
    if (!shippingAddressId) return;
    try {
      const result = await createOrder.mutateAsync({
        shippingAddressId,
        paymentMethod,
        deliveryMethod,
      });
      if (paymentMethod === "COD") {
        void queryClient.invalidateQueries({ queryKey: ["cart"] });
        navigate(`/order-confirmation/${result.order.id}`);
      } else {
        setPendingOrder(result);
      }
    } catch (err) {
      toast.error(orderErrorMessage(err, "Couldn't place order"));
    }
  }

  function handleStripeSuccess() {
    void queryClient.invalidateQueries({ queryKey: ["cart"] });
    if (pendingOrder) navigate(`/order-confirmation/${pendingOrder.order.id}`);
  }

  return (
    <main className="container py-8">
      <h1 className="mb-6 font-display text-2xl font-semibold">Checkout</h1>

      <div className="mb-8 flex items-center gap-2 text-sm">
        {([1, 2, 3] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => s < step && setStep(s)}
              disabled={s > step}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full font-mono-data text-xs font-semibold",
                s === step
                  ? "bg-primary text-primary-foreground"
                  : s < step
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground",
              )}
            >
              {s}
            </button>
            <span className={s === step ? "font-medium" : "text-muted-foreground"}>{STEP_LABELS[s]}</span>
            {i < 2 && <div className="mx-2 h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div>
              <AddressSelector selectedId={shippingAddressId} onSelect={setShippingAddressId} />
              <Button className="mt-6" disabled={!shippingAddressId} onClick={() => setStep(2)}>
                Continue to Delivery
              </Button>
            </div>
          )}

          {step === 2 && (
            <div>
              <DeliveryMethodStep value={deliveryMethod} onChange={setDeliveryMethod} />
              <Button className="mt-6" onClick={goToPayment}>
                Continue to Payment
              </Button>
            </div>
          )}

          {step === 3 && !pendingOrder && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                {(["COD", "STRIPE"] as const).map((method) => (
                  <label
                    key={method}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm",
                      paymentMethod === method ? "border-primary bg-primary/5" : "border-input hover:bg-secondary",
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                    />
                    {method === "COD" ? "Cash on Delivery" : "Credit / Debit Card (Stripe)"}
                  </label>
                ))}
              </div>
              <Button onClick={handlePlaceOrder} isLoading={createOrder.isPending}>
                {paymentMethod === "COD" ? "Place Order" : "Continue to Payment Details"}
              </Button>
            </div>
          )}

          {step === 3 && pendingOrder?.clientSecret && (
            <StripePaymentForm
              clientSecret={pendingOrder.clientSecret}
              totalLabel={formatCents(pendingOrder.order.totalCents)}
              onSuccess={handleStripeSuccess}
            />
          )}
        </div>

        <aside className="flex flex-col gap-2 rounded-md border border-border p-5 h-fit font-mono-data text-sm">
          <h2 className="mb-2 font-display text-base font-semibold not-italic">Order Summary</h2>
          {cartPreview?.items.map((item) => (
            <div key={item.variantId} className="flex justify-between text-muted-foreground">
              <span className="truncate pr-2">
                {item.productName} × {item.quantity}
              </span>
              <span>{formatCents(item.lineTotalCents)}</span>
            </div>
          ))}
          {cartPreview && (
            <>
              <div className="mt-2 flex justify-between border-t border-border pt-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCents(cartPreview.pricing.subtotalCents)}</span>
              </div>
              {cartPreview.pricing.discountCents > 0 && (
                <div className="flex justify-between text-accent-foreground">
                  <span>Discount</span>
                  <span>-{formatCents(cartPreview.pricing.discountCents)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {cartPreview.pricing.shippingCents === 0
                    ? "Free"
                    : formatCents(cartPreview.pricing.shippingCents)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (est.)</span>
                <span>{formatCents(cartPreview.pricing.taxCents)}</span>
              </div>
              <div className="mt-1 flex justify-between border-t border-border pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatCents(cartPreview.pricing.totalCents)}</span>
              </div>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
