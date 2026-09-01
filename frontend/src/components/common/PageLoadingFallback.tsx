/**
 * Shown inside a route-level <Suspense> boundary while a lazy-loaded page
 * chunk downloads (see routes/router.tsx). Deliberately minimal — it's
 * rendered inside RootLayout/AdminLayout's <Outlet>, so the header/sidebar
 * are still visible; this only needs to fill the content area without a
 * jarring layout shift once the real page mounts.
 */
export function PageLoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
    </div>
  );
}
