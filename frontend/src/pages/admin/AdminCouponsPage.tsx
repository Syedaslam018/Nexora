import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CouponForm } from "@/features/admin/CouponForm";
import { useAdminCoupons, useDeleteCoupon } from "@/features/admin/useCoupons";
import { formatCents } from "@/lib/utils";
import type { Coupon } from "@/types/coupon";

function CouponValueLabel({ coupon }: { coupon: Coupon }) {
  if (coupon.type === "FREE_SHIPPING") return <>Free shipping</>;
  if (coupon.type === "PERCENTAGE") return <>{coupon.value}% off</>;
  return <>{formatCents(coupon.value)} off</>;
}

export function AdminCouponsPage() {
  const [page, setPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data, isLoading } = useAdminCoupons({ page });
  const deleteCoupon = useDeleteCoupon();

  return (
    <main className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Coupons</h1>
        <Button size="sm" onClick={() => setShowCreateForm((v) => !v)}>
          <Plus className="mr-1.5 h-4 w-4" />
          New coupon
        </Button>
      </div>

      {showCreateForm && (
        <div className="mb-6">
          <CouponForm onDone={() => setShowCreateForm(false)} />
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-md bg-secondary" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {data?.items.map((coupon) => (
            <div key={coupon.id} className="rounded-md border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono-data font-semibold">{coupon.code}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    <CouponValueLabel coupon={coupon} />
                  </span>
                  {!coupon.isActive && (
                    <span className="ml-2 rounded bg-secondary px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">{coupon._count?.usages ?? 0} uses</span>
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(editingId === coupon.id ? null : coupon.id)}>
                    {editingId === coupon.id ? "Close" : "Edit"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteCoupon.mutate(coupon.id)}>
                    Delete
                  </Button>
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(coupon.startsAt).toLocaleDateString()} – {new Date(coupon.expiresAt).toLocaleDateString()}
              </p>
              {editingId === coupon.id && (
                <div className="mt-3">
                  <CouponForm existing={coupon} onDone={() => setEditingId(null)} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2 text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="flex items-center px-2 text-muted-foreground">
            Page {page} of {data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </main>
  );
}
