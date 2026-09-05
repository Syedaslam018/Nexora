import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCategoryTree } from "@/features/products/useProducts";
import { useCreateCoupon, useUpdateCoupon } from "./useCoupons";
import type { Coupon, CreateCouponInput, CouponType } from "@/types/coupon";

interface FormValues {
  code: string;
  type: CouponType;
  value: number;
  minOrderValue: number | "";
  maxDiscount: number | "";
  startsAt: string;
  expiresAt: string;
  usageLimit: number | "";
  perUserLimit: number | "";
  isActive: boolean;
  categoryIds: string[];
}

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

export function CouponForm({ existing, onDone }: { existing?: Coupon; onDone?: () => void }) {
  const { data: categories } = useCategoryTree();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();

  const { register, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: existing
      ? {
          code: existing.code,
          type: existing.type,
          value: existing.value,
          minOrderValue: existing.minOrderValueCents ? existing.minOrderValueCents / 100 : "",
          maxDiscount: existing.maxDiscountCents ? existing.maxDiscountCents / 100 : "",
          startsAt: toDateInputValue(existing.startsAt),
          expiresAt: toDateInputValue(existing.expiresAt),
          usageLimit: existing.usageLimit ?? "",
          perUserLimit: existing.perUserLimit ?? "",
          isActive: existing.isActive,
          categoryIds: existing.categories.map((c) => c.categoryId),
        }
      : {
          type: "PERCENTAGE",
          isActive: true,
          categoryIds: [],
          startsAt: new Date().toISOString().slice(0, 10),
        },
  });

  const type = watch("type");

  function onSubmit(values: FormValues) {
    const payload: CreateCouponInput = {
      code: values.code,
      type: values.type,
      value: Number(values.value),
      minOrderValueCents:
        values.minOrderValue === "" ? undefined : Math.round(Number(values.minOrderValue) * 100),
      maxDiscountCents:
        values.maxDiscount === "" ? undefined : Math.round(Number(values.maxDiscount) * 100),
      startsAt: new Date(values.startsAt).toISOString(),
      expiresAt: new Date(values.expiresAt).toISOString(),
      usageLimit: values.usageLimit === "" ? undefined : Number(values.usageLimit),
      perUserLimit: values.perUserLimit === "" ? undefined : Number(values.perUserLimit),
      isActive: values.isActive,
      categoryIds: values.categoryIds,
      productIds: existing?.products.map((p) => p.productId) ?? [],
    };

    if (existing) {
      const updatePayload = { ...payload };
      Reflect.deleteProperty(updatePayload, "code");
      updateCoupon.mutate({ id: existing.id, input: updatePayload }, { onSuccess: onDone });
    } else {
      createCoupon.mutate(payload, { onSuccess: onDone });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 rounded-md border border-border p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="code">Code</Label>
          <Input id="code" {...register("code", { required: true })} disabled={Boolean(existing)} />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            {...register("type")}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED_AMOUNT">Fixed amount</option>
            <option value="FREE_SHIPPING">Free shipping</option>
          </select>
        </div>
      </div>

      {type !== "FREE_SHIPPING" && (
        <div>
          <Label htmlFor="value">{type === "PERCENTAGE" ? "Percentage off (0-100)" : "Amount off ($)"}</Label>
          <Input id="value" type="number" step="1" {...register("value", { required: true, valueAsNumber: true })} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="minOrderValue">Minimum order ($, optional)</Label>
          <Input id="minOrderValue" type="number" step="0.01" {...register("minOrderValue")} />
        </div>
        <div>
          <Label htmlFor="maxDiscount">Max discount ($, optional)</Label>
          <Input id="maxDiscount" type="number" step="0.01" {...register("maxDiscount")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="startsAt">Starts</Label>
          <Input id="startsAt" type="date" {...register("startsAt", { required: true })} />
        </div>
        <div>
          <Label htmlFor="expiresAt">Expires</Label>
          <Input id="expiresAt" type="date" {...register("expiresAt", { required: true })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="usageLimit">Total usage limit (optional)</Label>
          <Input id="usageLimit" type="number" {...register("usageLimit")} />
        </div>
        <div>
          <Label htmlFor="perUserLimit">Per-user limit (optional)</Label>
          <Input id="perUserLimit" type="number" {...register("perUserLimit")} />
        </div>
      </div>

      {categories && categories.length > 0 && (
        <div>
          <Label>Restrict to categories (optional — leave unchecked for all)</Label>
          <div className="mt-1 flex max-h-32 flex-col gap-1 overflow-y-auto rounded-md border border-input p-2">
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" value={c.id} {...register("categoryIds")} className="h-3.5 w-3.5" />
                {c.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isActive")} className="h-3.5 w-3.5 rounded border-input" />
        Active
      </label>

      <Button type="submit" isLoading={createCoupon.isPending || updateCoupon.isPending} className="w-fit">
        {existing ? "Save changes" : "Create coupon"}
      </Button>
    </form>
  );
}
