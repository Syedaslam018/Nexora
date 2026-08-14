import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApplyCoupon, useRemoveCoupon } from "./useCart";
import type { Cart } from "@/types/cart";

export function CouponForm({ coupon }: { coupon: Cart["coupon"] }) {
  const [code, setCode] = useState("");
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();

  if (coupon) {
    return (
      <div className="flex items-center justify-between rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
        <span className="font-mono-data font-medium">{coupon.code}</span>
        <button
          onClick={() => removeCoupon.mutate()}
          className="text-xs text-muted-foreground hover:text-destructive"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (code.trim()) applyCoupon.mutate(code.trim(), { onSuccess: () => setCode("") });
      }}
      className="flex gap-2"
    >
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Coupon code"
        className="h-9 text-sm"
      />
      <Button type="submit" variant="outline" size="sm" isLoading={applyCoupon.isPending}>
        Apply
      </Button>
    </form>
  );
}
