import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { cartApi } from "@/api/cart.api";
import { useGuestCartStore } from "@/store/guestCartStore";
import { useIsAuthenticated } from "@/hooks/useAuth";
import type { GuestCartItem } from "@/types/cart";

const CART_QUERY_KEY = ["cart"];

function errorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    return (err.response?.data as { message?: string } | undefined)?.message ?? fallback;
  }
  return fallback;
}

/** Merges whatever's in the guest cart into the server cart, then clears
 * local storage. Call once, right after a successful login/register. */
export async function mergeGuestCartIfAny(queryClient: QueryClient) {
  const guestItems = useGuestCartStore.getState().items;
  if (guestItems.length === 0) return;

  try {
    await cartApi.merge(guestItems.map((i) => ({ variantId: i.variantId, quantity: i.quantity })));
    useGuestCartStore.getState().clear();
    await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
  } catch {
    // Non-fatal — the guest cart just stays in localStorage and the user
    // can retry; login itself already succeeded and shouldn't be blocked
    // by a merge failure.
  }
}

export function useServerCart() {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: () => cartApi.get(),
    enabled: isAuthenticated,
  });
}

/** A single item-count badge for the header, working for both guest and
 * authenticated users without the header needing to know which mode it's in. */
export function useCartItemCount(): number {
  const isAuthenticated = useIsAuthenticated();
  const { data: serverCart } = useServerCart();
  const guestItems = useGuestCartStore((s) => s.items);

  if (isAuthenticated) {
    return serverCart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  }
  return guestItems.reduce((sum, i) => sum + i.quantity, 0);
}

interface AddToCartParams {
  variantId: string;
  quantity: number;
  /** Only needed for the guest-cart path — the server already knows this
   * from the variant row, but a logged-out add has nothing to join against. */
  guestSnapshot: Omit<GuestCartItem, "quantity">;
}

export function useAddToCart() {
  const isAuthenticated = useIsAuthenticated();
  const queryClient = useQueryClient();
  const addGuestItem = useGuestCartStore((s) => s.addItem);

  return useMutation({
    mutationFn: async ({ variantId, quantity, guestSnapshot }: AddToCartParams) => {
      if (isAuthenticated) {
        return cartApi.addItem(variantId, quantity);
      }
      addGuestItem(guestSnapshot, quantity);
      return null;
    },
    onSuccess: () => {
      if (isAuthenticated) void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast.success("Added to cart");
    },
    onError: (err) => toast.error(errorMessage(err, "Couldn't add to cart")),
  });
}

export function useUpdateCartItemQuantity() {
  const isAuthenticated = useIsAuthenticated();
  const queryClient = useQueryClient();
  const updateGuestQuantity = useGuestCartStore((s) => s.updateQuantity);

  return useMutation({
    mutationFn: async ({ variantId, quantity }: { variantId: string; quantity: number }) => {
      if (isAuthenticated) return cartApi.updateItemQuantity(variantId, quantity);
      updateGuestQuantity(variantId, quantity);
      return null;
    },
    onSuccess: () => {
      if (isAuthenticated) void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
    onError: (err) => toast.error(errorMessage(err, "Couldn't update quantity")),
  });
}

export function useRemoveCartItem() {
  const isAuthenticated = useIsAuthenticated();
  const queryClient = useQueryClient();
  const removeGuestItem = useGuestCartStore((s) => s.removeItem);

  return useMutation({
    mutationFn: async (variantId: string) => {
      if (isAuthenticated) return cartApi.removeItem(variantId);
      removeGuestItem(variantId);
      return null;
    },
    onSuccess: () => {
      if (isAuthenticated) void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast.success("Removed from cart");
    },
    onError: (err) => toast.error(errorMessage(err, "Couldn't remove item")),
  });
}

export function useApplyCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => cartApi.applyCoupon(code),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast.success("Coupon applied");
    },
    onError: (err) => toast.error(errorMessage(err, "Invalid coupon")),
  });
}

export function useRemoveCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cartApi.removeCoupon(),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY }),
  });
}
