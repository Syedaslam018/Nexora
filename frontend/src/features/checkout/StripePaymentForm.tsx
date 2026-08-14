import { useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { getStripe } from "@/lib/stripe";

function InnerForm({ onSuccess, totalLabel }: { onSuccess: () => void; totalLabel: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsSubmitting(true);
    setError(null);

    // `redirect: 'if_required'` keeps the customer on this page for cards
    // that don't need 3D Secure / bank redirects (the common test-mode
    // case) instead of always bouncing out to a return_url.
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    setIsSubmitting(false);

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed — please try again.");
      return;
    }
    if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={!stripe || isSubmitting} isLoading={isSubmitting}>
        Pay {totalLabel}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Test mode — use card 4242 4242 4242 4242, any future expiry, any CVC.
      </p>
    </form>
  );
}

export function StripePaymentForm({
  clientSecret,
  totalLabel,
  onSuccess,
}: {
  clientSecret: string;
  totalLabel: string;
  onSuccess: () => void;
}) {
  return (
    <Elements stripe={getStripe()} options={{ clientSecret }}>
      <InnerForm onSuccess={onSuccess} totalLabel={totalLabel} />
    </Elements>
  );
}
