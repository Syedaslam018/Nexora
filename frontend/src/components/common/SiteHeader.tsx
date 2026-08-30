import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  User,
  Heart,
  ShoppingCart,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useCategoryTree } from "@/features/products/useProducts";
import { useCurrentUser } from "@/hooks/useAuth";
import { useCartItemCount } from "@/features/cart/useCart";
import { useWishlist } from "@/features/wishlist/useWishlist";
import { NotificationBell } from "./NotificationBell";
import { cn } from "@/lib/utils";

function IconBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-warning px-1 font-mono-data text-[10px] font-bold text-warning-foreground ring-2 ring-background">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function UtilityLink({
  to,
  label,
  children,
  count,
}: {
  to: string;
  label: string;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="group relative rounded-xl p-2 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
    >
      {children}
      {count !== undefined && <IconBadge count={count} />}
    </Link>
  );
}

export function SiteHeader() {
  const { data: categories } = useCategoryTree();
  const user = useCurrentUser();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCartItemCount();
  const { data: wishlist } = useWishlist();

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchInput.trim())}`);
      setMobileOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="hidden bg-foreground px-4 py-2 text-center text-[11px] font-semibold tracking-[0.18em] text-background sm:block">
        <span className="inline-flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-warning" /> FREE SHIPPING ON
          ORDERS OVER $75 <span className="text-background/40">•</span>{" "}
          WELCOME15 FOR 15% OFF
        </span>
      </div>
      <div className="container flex h-[4.5rem] items-center gap-3 sm:gap-6">
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-2"
          onClick={() => setMobileOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-sm font-bold text-primary-foreground shadow-soft transition-transform group-hover:rotate-6">
            N
          </span>
          <span className="font-display text-xl font-bold tracking-[-0.06em]">
            NEXORA
          </span>
        </Link>
        <nav className="hidden items-center gap-5 lg:flex">
          <Link
            to="/products"
            className="text-sm font-semibold text-foreground/80 transition-colors hover:text-primary"
          >
            Shop
          </Link>
          {categories?.slice(0, 4).map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.slug}`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {category.name}
            </Link>
          ))}
        </nav>
        <form
          onSubmit={handleSearchSubmit}
          className="ml-auto hidden w-full max-w-xs items-center md:flex"
        >
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search the collection"
              className="h-10 w-full rounded-xl border border-border/80 bg-card/70 pl-9 pr-3 text-sm shadow-sm transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
            />
          </div>
        </form>
        <div className="flex items-center gap-0.5">
          {user && <NotificationBell />}
          {(user?.role === "ADMIN" || user?.role === "STAFF") && (
            <UtilityLink to="/admin" label="Admin">
              <ShieldCheck className="h-[18px] w-[18px]" />
            </UtilityLink>
          )}
          <UtilityLink
            to="/wishlist"
            label="Wishlist"
            count={wishlist?.count ?? 0}
          >
            <Heart className="h-[18px] w-[18px] transition-transform group-hover:scale-110" />
          </UtilityLink>
          <UtilityLink to="/cart" label="Cart" count={cartCount}>
            <ShoppingCart className="h-[18px] w-[18px]" />
          </UtilityLink>
          <UtilityLink to={user ? "/account" : "/login"} label="Account">
            <User className="h-[18px] w-[18px]" />
          </UtilityLink>
          <button
            type="button"
            className="ml-1 rounded-xl p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      <div
        className={cn(
          "border-t border-border/60 bg-card/95 px-4 py-4 shadow-lg backdrop-blur-xl lg:hidden",
          !mobileOpen && "hidden",
        )}
      >
        <form
          onSubmit={handleSearchSubmit}
          className="mb-4 flex items-center md:hidden"
        >
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search the collection"
              className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </form>
        <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Link
            to="/products"
            onClick={() => setMobileOpen(false)}
            className="rounded-xl bg-primary/10 px-3 py-2.5 text-sm font-semibold text-primary"
          >
            Shop all
          </Link>
          {categories?.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.slug}`}
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
