import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { ProductGrid } from "@/features/products/ProductGrid";
import {
  useProductList,
  useCategoryTree,
} from "@/features/products/useProducts";

const benefits = [
  {
    icon: Truck,
    title: "Fast delivery",
    text: "Thoughtful packing, speedy dispatch.",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    text: "Your payment details stay protected.",
  },
  {
    icon: RotateCcw,
    title: "Easy returns",
    text: "30 days to change your mind.",
  },
];

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
  const heroProduct = newArrivals?.items[0];

  return (
    <main className="overflow-hidden">
      <section className="gradient-wash relative border-b border-border/60">
        <div className="pointer-events-none absolute -right-40 -top-48 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="container relative grid min-h-[36rem] items-center gap-12 py-14 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
          <div className="animate-in-up max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> New season, better essentials
            </div>
            <h1 className="text-balance font-display text-5xl font-bold leading-[.98] tracking-[-0.07em] sm:text-6xl lg:text-7xl">
              Objects with <span className="text-primary">energy.</span>
              <br />
              Made for your everyday.
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              A considered collection of fashion, tech, home, and wellness
              essentials. Find the pieces that make ordinary days feel a little
              more yours.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/products"
                className="inline-flex h-12 items-center gap-2 rounded-xl gradient-brand px-6 text-sm font-bold text-primary-foreground shadow-lift transition-all hover:-translate-y-1"
              >
                Explore the collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/products?sort=best_selling"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-card/70 px-5 text-sm font-bold transition-all hover:-translate-y-1 hover:border-primary/40 hover:text-primary"
              >
                Best sellers
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent" /> Curated weekly
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent" /> Free shipping over
                $75
              </span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md animate-float lg:max-w-none">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-transparent to-accent/20 blur-2xl" />
            <div className="relative aspect-[.9] overflow-hidden rounded-[2rem] bg-secondary shadow-lift ring-1 ring-border/60">
              {heroProduct?.thumbnailUrl ? (
                <img
                  src={heroProduct.thumbnailUrl}
                  alt={heroProduct.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary/80 via-violet-500 to-accent" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/65 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-background">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-background/65">
                    Spotlight pick
                  </p>
                  <p className="font-display text-xl font-semibold">
                    {heroProduct?.name ?? "Find your next favorite"}
                  </p>
                </div>
                <Link
                  to={
                    heroProduct ? `/products/${heroProduct.slug}` : "/products"
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-background text-foreground transition-transform hover:rotate-45"
                  aria-label="View spotlight product"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 rounded-2xl border border-border/70 bg-card/90 px-4 py-3 shadow-lift backdrop-blur">
              <p className="font-mono-data text-xl font-bold">30+</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                things to love
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-12 sm:py-16">
        <div className="grid gap-3 sm:grid-cols-3">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/60 p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {categories && categories.length > 0 && (
        <section className="container pb-16 sm:pb-20">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                Find your lane
              </p>
              <h2 className="font-display text-3xl font-bold tracking-[-0.05em]">
                Shop by category
              </h2>
            </div>
            <Link
              to="/products"
              className="hidden items-center gap-1 text-sm font-semibold text-primary sm:flex"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="group relative aspect-[.85] overflow-hidden rounded-2xl bg-secondary ring-1 ring-border/60 transition-all hover:-translate-y-1 hover:shadow-lift"
              >
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full gradient-brand" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/10 to-transparent" />
                <div className="absolute inset-x-3 bottom-3 text-background">
                  <p className="font-display text-sm font-semibold sm:text-base">
                    {category.name}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium text-background/65">
                    {category.productCount} items
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-secondary/45 py-16 sm:py-20">
        <div className="container">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                Just landed
              </p>
              <h2 className="font-display text-3xl font-bold tracking-[-0.05em]">
                New arrivals
              </h2>
            </div>
            <Link
              to="/products?sort=newest"
              className="flex items-center gap-1 text-sm font-semibold text-primary"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ProductGrid
            products={newArrivals?.items ?? []}
            isLoading={newArrivalsLoading}
          />
        </div>
      </section>
      <section className="container py-16 sm:py-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              Loved by many
            </p>
            <h2 className="font-display text-3xl font-bold tracking-[-0.05em]">
              Best sellers
            </h2>
          </div>
          <Link
            to="/products?sort=best_selling"
            className="flex items-center gap-1 text-sm font-semibold text-primary"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ProductGrid
          products={bestSellers?.items ?? []}
          isLoading={bestSellersLoading}
        />
      </section>
    </main>
  );
}
