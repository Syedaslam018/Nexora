import { NavLink, Outlet, Link } from "react-router-dom";
import { Suspense } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Star,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminRealtime } from "@/features/admin/useAdminRealtime";
import { PageLoadingFallback } from "@/components/common/PageLoadingFallback";

const NAV_ITEMS = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
];

export function AdminLayout() {
  useAdminRealtime();
  return (
    <div className="min-h-screen bg-secondary/35 lg:flex">
      <aside className="border-b border-border/70 bg-foreground text-background lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-b-0 lg:border-r lg:border-background/10">
        <div className="flex items-center justify-between px-5 py-5 lg:block lg:px-6 lg:py-7">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-background text-sm font-bold text-foreground">
              N
            </span>
            <span className="font-display text-lg font-bold tracking-[-0.05em]">
              NEXORA
            </span>
          </Link>
          <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-background/45 lg:mt-1 lg:block lg:pl-11">
            Operations
          </span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:gap-1 lg:px-4 lg:py-5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all lg:w-full",
                  isActive
                    ? "bg-background text-foreground shadow-soft"
                    : "text-background/60 hover:bg-background/10 hover:text-background",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden px-6 pb-6 lg:mt-auto lg:block">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-background/50 transition-colors hover:text-background"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to storefront
          </Link>
        </div>
      </aside>
      <div className="min-w-0 flex-1 lg:ml-64">
        <Suspense fallback={<PageLoadingFallback />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
