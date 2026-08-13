import { Outlet } from "react-router-dom";

/**
 * Site chrome (header/nav/cart icon/footer) lands in Phase 4 alongside the
 * storefront pages that need it. Kept as a bare Outlet for now so routing
 * and providers can be verified independently of that UI work.
 */
export function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  );
}
