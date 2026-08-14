import { Link, useNavigate } from "react-router-dom";
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
    <main className="container flex min-h-[50vh] flex-col items-center justify-center gap-3 py-12 text-center">
      <h1 className="font-display text-xl font-semibold">Your cart is empty</h1>
      <p className="text-sm text-muted-foreground">Browse the catalog to find something you'll love.</p>
      <Link to="/products" className="text-sm text-primary hover:underline">
        Shop products
      </Link>
    </main>
  );
}

function GuestCartView() {
  const items = useGuestCartStore((s) => s.items);
  const updateQuantity = useGuestCartStore((s) => s.updateQuantity);
  const removeItem = useGuestCartStore((s) => s.removeItem);

  if (items.length === 0) return <EmptyCart />;

  const subtotalCents = items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);

  return (
    <main className="container py-8">
      <h1 className="mb-6 font-display text-2xl font-semibold">Your Cart</h1>
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

        <aside className="flex flex-col gap-4 rounded-md border border-border p-5 h-fit">
          <div className="flex justify-between font-mono-data text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">{formatCents(subtotalCents)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Tax, shipping, and coupons are calculated after you log in.
          </p>
          <Link to="/login" className={buttonVariants({ variant: "default", className: "w-full" })}>
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
      <main className="container py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-secondary" />
      </main>
    );
  }

  if (!cart || cart.items.length === 0) return <EmptyCart />;

  const { pricing } = cart;

  return (
    <main className="container py-8">
      <h1 className="mb-6 font-display text-2xl font-semibold">Your Cart</h1>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {cart.items.map((item) => (
            <CartItemRow
              key={item.variantId}
              item={item}
              isUpdating={updateQuantity.isPending}
              onQuantityChange={(quantity) => updateQuantity.mutate({ variantId: item.variantId, quantity })}
              onRemove={() => removeItem.mutate(item.variantId)}
            />
          ))}
        </div>

        <aside className="flex flex-col gap-4 rounded-md border border-border p-5 h-fit">
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
              <span>{pricing.shippingCents === 0 ? "Free" : formatCents(pricing.shippingCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (est.)</span>
              <span>{formatCents(pricing.taxCents)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold">
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
