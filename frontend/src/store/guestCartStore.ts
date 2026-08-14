import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GuestCartItem } from "@/types/cart";

interface GuestCartState {
  items: GuestCartItem[];
  addItem: (item: Omit<GuestCartItem, "quantity">, quantity: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
}

/**
 * This is the ONLY cart storage for logged-out users — per Section 3
 * ("For guests, persist cart locally... merge it with the user's database
 * cart after login"). It intentionally does NOT compute tax/shipping/
 * coupon totals the way the server cart does; those depend on backend
 * business rules (`pricing.service.ts`) that a guest's browser has no
 * business re-implementing. The guest cart page shows a subtotal only —
 * full pricing appears once merged into the real cart after login.
 */
export const useGuestCartStore = create<GuestCartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity) => {
        const existing = get().items.find((i) => i.variantId === item.variantId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: Math.min(i.quantity + quantity, i.maxQty) }
                : i,
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: Math.min(quantity, item.maxQty) }] });
        }
      },

      updateQuantity: (variantId, quantity) => {
        set({
          items: get().items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
        });
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },

      clear: () => set({ items: [] }),
    }),
    { name: "nexora_guest_cart" },
  ),
);
