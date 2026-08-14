import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { wishlistApi } from "@/api/wishlist.api";
import { useIsAuthenticated } from "@/hooks/useAuth";

const WISHLIST_QUERY_KEY = ["wishlist"];

function errorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    return (err.response?.data as { message?: string } | undefined)?.message ?? fallback;
  }
  return fallback;
}

export function useWishlist() {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: () => wishlistApi.get(),
    enabled: isAuthenticated,
  });
}

export function useIsInWishlist(productId: string | undefined): boolean {
  const { data } = useWishlist();
  if (!productId || !data) return false;
  return data.items.some((item) => item.productId === productId);
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const isAuthenticated = useIsAuthenticated();
  const { data } = useWishlist();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!isAuthenticated) {
        throw new Error("LOGIN_REQUIRED");
      }
      const inWishlist = data?.items.some((item) => item.productId === productId);
      return inWishlist ? wishlistApi.remove(productId) : wishlistApi.add(productId);
    },
    onSuccess: (_data, productId) => {
      void queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
      const wasInWishlist = data?.items.some((item) => item.productId === productId);
      toast.success(wasInWishlist ? "Removed from wishlist" : "Added to wishlist");
    },
    onError: (err: Error) => {
      if (err.message === "LOGIN_REQUIRED") {
        toast.error("Log in to save items to your wishlist");
        return;
      }
      toast.error(errorMessage(err, "Couldn't update wishlist"));
    },
  });
}

export function useMoveWishlistItemToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, variantId }: { productId: string; variantId: string }) =>
      wishlistApi.moveToCart(productId, variantId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Moved to cart");
    },
    onError: (err) => toast.error(errorMessage(err, "Couldn't move item to cart")),
  });
}
