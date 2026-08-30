import { Link } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import { formatCents } from "@/lib/utils";

interface CartRowItem {
  variantId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  thumbnailUrl: string | null;
  unitPriceCents: number;
  quantity: number;
  availableQty: number;
}

export function CartItemRow({
  item,
  onQuantityChange,
  onRemove,
  isUpdating,
}: {
  item: CartRowItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  isUpdating?: boolean;
}) {
  return (
    <div className="group flex gap-3 border-b border-border/70 py-5 sm:gap-5">
      <Link
        to={`/products/${item.productSlug}`}
        className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-secondary ring-1 ring-border/60 sm:h-28 sm:w-24"
      >
        {item.thumbnailUrl && (
          <img
            src={item.thumbnailUrl}
            alt={item.productName}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <div>
          <Link
            to={`/products/${item.productSlug}`}
            className="font-display text-sm font-semibold transition-colors hover:text-primary sm:text-base"
          >
            {item.productName}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            {item.variantName}
          </p>
          {item.quantity >= item.availableQty && (
            <p className="mt-1 text-xs text-warning-foreground">
              Only {item.availableQty} left in stock
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center rounded-xl border border-input bg-card">
            <button
              onClick={() => onQuantityChange(Math.max(1, item.quantity - 1))}
              disabled={isUpdating}
              className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-7 text-center font-mono-data text-sm">
              {item.quantity}
            </span>
            <button
              onClick={() =>
                onQuantityChange(Math.min(item.availableQty, item.quantity + 1))
              }
              disabled={isUpdating || item.quantity >= item.availableQty}
              className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-50"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className="font-mono-data text-sm font-semibold">
            {formatCents(item.unitPriceCents * item.quantity)}
          </span>
        </div>
      </div>

      <button
        onClick={onRemove}
        className="h-fit rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        aria-label="Remove item"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
