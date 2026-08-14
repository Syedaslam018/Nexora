import { useState } from "react";
import { Plus } from "lucide-react";
import { useAddresses } from "./useAddresses";
import { AddressForm } from "./AddressForm";
import type { Address } from "@/types/address";

export function AddressSelector({
  selectedId,
  onSelect,
}: {
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}) {
  const { data: addresses, isLoading } = useAddresses();
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-md bg-secondary" />;
  }

  const hasAddresses = (addresses?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-3">
      {addresses?.map((address: Address) => (
        <label
          key={address.id}
          className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition-colors ${
            selectedId === address.id ? "border-primary bg-primary/5" : "border-input hover:bg-secondary"
          }`}
        >
          <input
            type="radio"
            name="shippingAddress"
            checked={selectedId === address.id}
            onChange={() => onSelect(address.id)}
            className="mt-1"
          />
          <div>
            <p className="font-medium">
              {address.fullName} {address.isDefault && <span className="text-xs text-muted-foreground">(Default)</span>}
            </p>
            <p className="text-muted-foreground">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}{" "}
              {address.postalCode}, {address.country}
            </p>
            <p className="text-muted-foreground">{address.phone}</p>
          </div>
        </label>
      ))}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-md border border-dashed border-input p-3 text-sm text-muted-foreground hover:border-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          {hasAddresses ? "Add a new address" : "Add your first address"}
        </button>
      ) : (
        <div className="rounded-md border border-border p-4">
          <AddressForm
            onSaved={(address) => {
              setShowForm(false);
              onSelect(address.id);
            }}
          />
        </div>
      )}
    </div>
  );
}
