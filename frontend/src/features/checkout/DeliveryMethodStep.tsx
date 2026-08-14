import { useQuery } from "@tanstack/react-query";
import { cartApi } from "@/api/cart.api";
import { formatCents, cn } from "@/lib/utils";

const OPTIONS = [
  { value: "STANDARD" as const, label: "Standard Shipping", eta: "5–7 business days" },
  { value: "EXPRESS" as const, label: "Express Shipping", eta: "1–2 business days" },
];

export function DeliveryMethodStep({
  value,
  onChange,
}: {
  value: "STANDARD" | "EXPRESS";
  onChange: (value: "STANDARD" | "EXPRESS") => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {OPTIONS.map((option) => (
        <DeliveryOption
          key={option.value}
          option={option}
          selected={value === option.value}
          onSelect={() => onChange(option.value)}
        />
      ))}
    </div>
  );
}

function DeliveryOption({
  option,
  selected,
  onSelect,
}: {
  option: (typeof OPTIONS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  // Fetches a live-priced preview for THIS option so the shipping cost
  // shown is always what the backend would actually charge — never a
  // client-side guess at the flat rate.
  const { data: cart } = useQuery({
    queryKey: ["cart", "preview", option.value],
    queryFn: () => cartApi.get({ deliveryMethod: option.value }),
  });

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between rounded-md border p-3 text-sm transition-colors",
        selected ? "border-primary bg-primary/5" : "border-input hover:bg-secondary",
      )}
    >
      <div className="flex items-center gap-3">
        <input type="radio" name="deliveryMethod" checked={selected} onChange={onSelect} />
        <div>
          <p className="font-medium">{option.label}</p>
          <p className="text-muted-foreground">{option.eta}</p>
        </div>
      </div>
      <span className="font-mono-data font-semibold">
        {cart ? (cart.pricing.shippingCents === 0 ? "Free" : formatCents(cart.pricing.shippingCents)) : "…"}
      </span>
    </label>
  );
}
