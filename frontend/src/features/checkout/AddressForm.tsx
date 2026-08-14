import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateAddress } from "./useAddresses";
import type { Address, AddressInput } from "@/types/address";

export function AddressForm({ onSaved }: { onSaved?: (address: Address) => void }) {
  const createAddress = useCreateAddress();
  const { register, handleSubmit, reset } = useForm<AddressInput>({
    defaultValues: { country: "United States", isDefault: false },
  });

  function onSubmit(values: AddressInput) {
    createAddress.mutate(values, {
      onSuccess: (address) => {
        reset();
        onSaved?.(address);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" {...register("fullName", { required: true })} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone", { required: true })} />
        </div>
      </div>
      <div>
        <Label htmlFor="line1">Address line 1</Label>
        <Input id="line1" {...register("line1", { required: true })} />
      </div>
      <div>
        <Label htmlFor="line2">Address line 2 (optional)</Label>
        <Input id="line2" {...register("line2")} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city", { required: true })} />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input id="state" {...register("state", { required: true })} />
        </div>
        <div>
          <Label htmlFor="postalCode">Postal code</Label>
          <Input id="postalCode" {...register("postalCode", { required: true })} />
        </div>
      </div>
      <div>
        <Label htmlFor="country">Country</Label>
        <Input id="country" {...register("country", { required: true })} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isDefault")} className="h-3.5 w-3.5 rounded border-input" />
        Set as default address
      </label>
      <Button type="submit" isLoading={createAddress.isPending} className="mt-1">
        Save address
      </Button>
    </form>
  );
}
