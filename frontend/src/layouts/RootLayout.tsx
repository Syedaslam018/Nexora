import { Link, Outlet } from "react-router-dom";
import { Suspense } from "react";
import { useAuthBootstrap } from "@/hooks/useAuth";
import { useSocketConnection } from "@/hooks/useSocketConnection";
import { useNotificationSocketListener } from "@/features/notifications/useNotifications";
import { SiteHeader } from "@/components/common/SiteHeader";
import { PageLoadingFallback } from "@/components/common/PageLoadingFallback";

/**
 * Footer + full nav mega-menu are polish items for Phase 15 — SiteHeader
 * already carries the functional nav (categories, search, account/cart/
 * wishlist links) so every page built from here on has real navigation.
 */
export function RootLayout() {
  useAuthBootstrap();
  useSocketConnection();
  useNotificationSocketListener();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <Suspense fallback={<PageLoadingFallback />}>
        <Outlet />
      </Suspense>
      <footer className="mt-20 border-t border-border/70 bg-foreground text-background">
        <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-sm font-bold text-foreground">
                N
              </span>
              <span className="font-display text-lg font-bold tracking-[-0.05em]">
                NEXORA
              </span>
            </div>
            <p className="max-w-xs text-sm leading-6 text-background/60">
              Curated objects for a more considered everyday. Built for curious
              people who move with intent.
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-background/50">
              Explore
            </p>
            <div className="flex flex-col gap-2 text-sm text-background/75">
              <Link
                to="/products"
                className="transition-colors hover:text-background"
              >
                Shop all products
              </Link>
              <Link
                to="/wishlist"
                className="transition-colors hover:text-background"
              >
                Wishlist
              </Link>
              <Link
                to="/account/orders"
                className="transition-colors hover:text-background"
              >
                Order history
              </Link>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-background/50">
              Support
            </p>
            <div className="flex flex-col gap-2 text-sm text-background/75">
              <span>Fast, friendly delivery</span>
              <span>Secure checkout</span>
              <span>Thoughtful design, always</span>
            </div>
          </div>
        </div>
        <div className="border-t border-background/10">
          <div className="container py-5 text-xs text-background/45">
            © {new Date().getFullYear()} Nexora. Crafted for the everyday.
          </div>
        </div>
      </footer>
    </div>
  );
}
