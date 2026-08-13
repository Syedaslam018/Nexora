import { Link, useNavigate } from "react-router-dom";
import { Search, User, Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCategoryTree } from "@/features/products/useProducts";
import { useCurrentUser } from "@/hooks/useAuth";

export function SiteHeader() {
  const { data: categories } = useCategoryTree();
  const user = useCurrentUser();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchInput.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center gap-6">
        <Link to="/" className="font-display text-xl font-bold tracking-tight">
          NEXORA
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {categories?.slice(0, 6).map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.slug}`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearchSubmit} className="ml-auto flex flex-1 max-w-sm items-center">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products, SKUs, brands…"
              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </form>

        <div className="flex items-center gap-1">
          <Link
            to="/wishlist"
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <Link
            to="/cart"
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
          </Link>
          <Link
            to={user ? "/account" : "/login"}
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
