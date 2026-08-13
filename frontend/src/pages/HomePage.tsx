import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ProductGrid } from "@/features/products/ProductGrid";
import { useProductList, useCategoryTree } from "@/features/products/useProducts";

/**
 * Built from real endpoints only: hero, category cards (real categories),
 * "New Arrivals" (sort=newest) and "Best Sellers" (sort=best_selling) rails.
 * Flash-sale countdown, customer testimonials, and newsletter capture need
 * data this schema doesn't model yet (a sale end-time concept, a
 * testimonials source, a subscribers table/endpoint) — rather than fake
 * them with placeholder content, they're left for a later phase once
 * there's a real backing feature to wire them to.
 */
export function HomePage() {
  const { data: categories } = useCategoryTree();
  const { data: newArrivals, isLoading: newArrivalsLoading } = useProductList({
    sort: "newest",
    pageSize: 8,
  });
  const { data: bestSellers, isLoading: bestSellersLoading } = useProductList({
    sort: "best_selling",
    pageSize: 8,
  });

  return (
    <main>
      {/* Hero */}
      <section className="border-b border-border bg-secondary/40">
        <div className="container flex flex-col items-start gap-4 py-20">
          <p className="font-mono-data text-sm uppercase tracking-widest text-muted-foreground">
            NEXORA · Electronics, reimagined
          </p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Laptops, phones, and gear built for how you actually work.
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Curated electronics with real spec sheets, honest pricing, and fast
            checkout — no fluff.
          </p>
          <Link
            to="/products"
            className="mt-2 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Shop all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Category cards */}
      {categories && categories.length > 0 && (
        <section className="container py-14">
          <h2 className="mb-6 font-display text-xl font-semibold">Shop by category</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="group flex flex-col items-center gap-2 rounded-md border border-border p-4 text-center transition-colors hover:border-primary"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-lg font-display font-semibold text-muted-foreground group-hover:text-primary">
                  {category.name.charAt(0)}
                </div>
                <span className="text-sm font-medium">{category.name}</span>
                <span className="font-mono-data text-xs text-muted-foreground">
                  {category.productCount} items
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New arrivals */}
      <section className="container py-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">New arrivals</h2>
          <Link to="/products?sort=newest" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <ProductGrid products={newArrivals?.items ?? []} isLoading={newArrivalsLoading} />
      </section>

      {/* Best sellers */}
      <section className="container py-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Best sellers</h2>
          <Link to="/products?sort=best_selling" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <ProductGrid products={bestSellers?.items ?? []} isLoading={bestSellersLoading} />
      </section>
    </main>
  );
}
