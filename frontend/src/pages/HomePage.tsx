import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleArrowOutUpRight,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
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

const tickerItems = [
  "Selected objects",
  "Useful by design",
  "Make room for better things",
  "Nexora / 2026",
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
      <section className="paper-grid relative border-b border-border/70">
        <div className="pointer-events-none absolute -right-32 top-12 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="container relative grid min-h-[43rem] items-center gap-14 py-14 lg:grid-cols-[1.04fr_.96fr] lg:gap-8 lg:py-20">
          <div className="relative z-10 max-w-2xl">
            <div className="motion-reveal mb-7 inline-flex items-center gap-2 border-b border-foreground/20 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/65">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> New season /
              considered essentials
            </div>
            <h1 className="motion-reveal motion-reveal-delay-1 max-w-xl font-display text-5xl font-bold leading-[0.93] tracking-[-0.075em] sm:text-7xl lg:text-[6.5rem]">
              Make room for <span className="text-primary">better</span> things.
            </h1>
            <p className="motion-reveal motion-reveal-delay-2 mt-8 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              A considered collection of fashion, tech, home, and wellness
              essentials for days that deserve a little more intention.
            </p>
            <div className="motion-reveal motion-reveal-delay-3 mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/products"
                className="inline-flex h-12 items-center gap-2 rounded-md bg-foreground px-6 text-sm font-bold text-background shadow-lift transition-all hover:-translate-y-1 hover:bg-primary"
              >
                Explore the collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/products?sort=best_selling"
                className="inline-flex h-12 items-center gap-2 rounded-md border border-foreground/20 bg-card/70 px-5 text-sm font-bold transition-all hover:-translate-y-1 hover:border-primary hover:text-primary"
              >
                See what moves
              </Link>
            </div>
            <div className="motion-reveal motion-reveal-delay-4 mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent" /> Curated weekly
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent" /> Free shipping over
                $75
              </span>
            </div>
          </div>

          <div className="motion-reveal motion-reveal-delay-2 relative mx-auto w-full max-w-[34rem] lg:mr-0">
            <div className="orbit-ring pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/35" />
            <div className="orbit-ring pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[114%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/10 [animation-direction:reverse] [animation-duration:30s]" />
            <span className="orbit-dot absolute left-[6%] top-[20%] z-10 h-3 w-3 rounded-full bg-primary shadow-[0_0_0_8px_hsl(var(--primary)/.15)]" />
            <span className="orbit-dot absolute bottom-[14%] right-[7%] z-10 h-4 w-4 rounded-full bg-accent shadow-[0_0_0_10px_hsl(var(--accent)/.15)] [animation-delay:1s]" />
            <div className="relative aspect-[0.82] overflow-hidden rounded-[1.25rem] bg-secondary shadow-lift ring-1 ring-foreground/10">
              {heroProduct?.thumbnailUrl ? (
                <img
                  src={heroProduct.thumbnailUrl}
                  alt={heroProduct.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="relative h-full w-full overflow-hidden gradient-brand">
                  <div className="absolute left-[15%] top-[18%] h-48 w-48 rounded-full border border-background/35" />
                  <div className="absolute bottom-[16%] right-[14%] h-28 w-28 rounded-full bg-background/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-transparent to-transparent" />
              <div className="absolute inset-x-5 top-5 flex items-center justify-between text-background">
                <span className="rounded-full border border-background/30 bg-foreground/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur">
                  Spotlight / 001
                </span>
                <CircleArrowOutUpRight className="h-6 w-6" />
              </div>
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-background">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-background/65">
                    New arrival
                  </p>
                  <p className="font-display text-2xl font-semibold leading-tight">
                    {heroProduct?.name ?? "Find your next favorite"}
                  </p>
                </div>
                <Link
                  to={
                    heroProduct ? `/products/${heroProduct.slug}` : "/products"
                  }
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background text-foreground transition-transform hover:rotate-45"
                  aria-label="View spotlight product"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-4 rounded-md bg-foreground px-4 py-3 text-background shadow-lift sm:-left-8">
              <p className="font-mono-data text-xl font-bold">
                {newArrivals?.meta.totalItems ?? "—"}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-background/60">
                new objects in the edit
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-foreground/10 bg-foreground py-3 text-background">
          <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.22em]">
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="inline-flex items-center gap-8"
              >
                {item}
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-12 sm:py-16">
        <div className="grid gap-3 sm:grid-cols-3">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex items-center gap-3 border-b border-border/70 py-4 sm:border-b-0 sm:border-r sm:px-5 first:pl-0 last:border-r-0"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-foreground">
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
                Browse the edit
              </p>
              <h2 className="font-display text-3xl font-bold tracking-[-0.05em]">
                Find your lane
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
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="group relative aspect-[0.85] overflow-hidden rounded-md bg-secondary ring-1 ring-foreground/10 transition-all hover:-translate-y-1 hover:shadow-lift"
              >
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full gradient-brand" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent" />
                <div className="absolute left-3 top-3 font-mono-data text-[10px] text-background/70">
                  0{index + 1}
                </div>
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
