import { Outlet } from "react-router-dom";
import { useAuthBootstrap } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/common/SiteHeader";

/**
 * Footer + full nav mega-menu are polish items for Phase 15 — SiteHeader
 * already carries the functional nav (categories, search, account/cart/
 * wishlist links) so every page built from here on has real navigation.
 */
export function RootLayout() {
  useAuthBootstrap();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <Outlet />
    </div>
  );
}
