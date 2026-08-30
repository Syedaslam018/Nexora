import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { CartItemRow } from "@/features/cart/CartItemRow";
import { CouponForm } from "@/features/cart/CouponForm";
import {
  useServerCart,
  useUpdateCartItemQuantity,
  useRemoveCartItem,
} from "@/features/cart/useCart";
import { useGuestCartStore } from "@/store/guestCartStore";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { formatCents } from "@/lib/utils";

function EmptyCart() {
  return (
    <main className="container flex min-h-[55vh] flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <ShoppingBag className="h-7 w-7" />
      </div>
      <h1 className="font-display text-3xl font-bold tracking-[-0.05em]">
        Your cart is waiting
      </h1>
      <p className="max-w-sm text-sm leading-6 text-muted-foreground">
        Browse the collection and save the things that make your everyday
        better.
      </p>
      <Link
        to="/products"
        className="mt-2 inline-flex items-center gap-2 rounded-xl gradient-brand px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft transition hover:-translate-y-0.5"
      >
        Shop products <ArrowRight className="h-4 w-4" />
      </Link>
    </main>
  );
}

function GuestCartView() {
  const items = useGuestCartStore((s) => s.items);
  const updateQuantity = useGuestCartStore((s) => s.updateQuantity);
  const removeItem = useGuestCartStore((s) => s.removeItem);

  if (items.length === 0) return <EmptyCart />;

  const subtotalCents = items.reduce(
    (sum, i) => sum + i.unitPriceCents * i.quantity,
    0,
  );

  return (
    <main className="container py-10 sm:py-14">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
        Guest cart
      </p>
      <h1 className="mb-8 font-display text-4xl font-bold tracking-[-0.06em]">
        Your cart
      </h1>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <CartItemRow
              key={item.variantId}
              item={{ ...item, availableQty: item.maxQty }}
              onQuantityChange={(q) => updateQuantity(item.variantId, q)}
              onRemove={() => removeItem(item.variantId)}
            />
          ))}
        </div>

        <aside className="flex h-fit flex-col gap-4 rounded-2xl border border-border/70 bg-card/70 p-6 shadow-soft lg:sticky lg:top-28">
          <div className="flex justify-between font-mono-data text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">{formatCents(subtotalCents)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Tax, shipping, and coupons are calculated after you log in.
          </p>
          <Link
            to="/login"
            className={buttonVariants({
              variant: "default",
              className: "w-full",
            })}
          >
            Log in to check out
          </Link>
        </aside>
      </div>
    </main>
  );
}

function AuthenticatedCartView() {
  const { data: cart, isLoading } = useServerCart();
  const updateQuantity = useUpdateCartItemQuantity();
  const removeItem = useRemoveCartItem();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <main className="container py-10 sm:py-14">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-secondary" />
      </main>
    );
  }

  if (!cart || cart.items.length === 0) return <EmptyCart />;

  const { pricing } = cart;

  return (
    <main className="container py-10 sm:py-14">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
        Almost yours
      </p>
      <h1 className="mb-8 font-display text-4xl font-bold tracking-[-0.06em]">
        Your cart
      </h1>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {cart.items.map((item) => (
            <CartItemRow
              key={item.variantId}
              item={item}
              isUpdating={updateQuantity.isPending}
              onQuantityChange={(quantity) =>
                updateQuantity.mutate({ variantId: item.variantId, quantity })
              }
              onRemove={() => removeItem.mutate(item.variantId)}
            />
          ))}
        </div>

        <aside className="flex h-fit flex-col gap-5 rounded-2xl border border-border/70 bg-card/70 p-6 shadow-soft lg:sticky lg:top-28">
          <CouponForm coupon={cart.coupon} />

          <div className="flex flex-col gap-2 font-mono-data text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCents(pricing.subtotalCents)}</span>
            </div>
            {pricing.discountCents > 0 && (
              <div className="flex justify-between text-accent-foreground">
                <span>Discount</span>
                <span>-{formatCents(pricing.discountCents)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {pricing.shippingCents === 0
                  ? "Free"
                  : formatCents(pricing.shippingCents)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (est.)</span>
              <span>{formatCents(pricing.taxCents)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-border/70 pt-4 text-lg font-bold">
              <span>Total</span>
              <span>{formatCents(pricing.totalCents)}</span>
            </div>
          </div>

          <Button className="w-full" onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </Button>
        </aside>
      </div>
    </main>
  );
}

export function CartPage() {
  const isAuthenticated = useIsAuthenticated();
  return isAuthenticated ? <AuthenticatedCartView /> : <GuestCartView />;
}
