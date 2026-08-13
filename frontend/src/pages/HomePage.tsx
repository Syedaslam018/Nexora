/**
 * Placeholder — the real Home page (hero, featured/trending/new-arrivals
 * rails, category cards, flash-sale section, testimonials, newsletter) is
 * built in Phase 4 once there's product data to render. This page exists so
 * the build pipeline, routing, and design tokens are verifiable now.
 */
export function HomePage() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <p className="font-mono-data text-sm uppercase tracking-widest text-muted-foreground">
        NEX-0001 · Phase 1
      </p>
      <h1 className="font-display text-5xl font-semibold tracking-tight">NEXORA</h1>
      <p className="max-w-md text-muted-foreground">
        Project scaffold is up. The storefront home page lands in Phase 4.
      </p>
    </main>
  );
}
