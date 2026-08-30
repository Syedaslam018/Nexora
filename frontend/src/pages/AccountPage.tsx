import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  CircleUserRound,
  Package,
  Heart,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth.api";

/**
 * Full profile-editing / address-book / session-list UI is future polish
 * (Phase 15) — order history (Phase 7) is wired in now since it's the part
 * of "Account profile" the spec calls out with its own dedicated features.
 */
export function AccountPage() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  async function handleLogout() {
    await authApi.logout().catch(() => {});
    clearAuth();
    toast.success("Logged out");
    navigate("/login");
  }

  if (!user) return null;

  return (
    <main className="container py-10 sm:py-14">
      <div className="mb-10 rounded-3xl bg-foreground p-7 text-background shadow-lift sm:p-10">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-background/10">
          <CircleUserRound className="h-7 w-7" />
        </div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-background/55">
          Your Nexora profile
        </p>
        <h1 className="font-display text-4xl font-bold tracking-[-0.06em]">
          {user.firstName} {user.lastName}
        </h1>
        <p className="mt-2 text-sm text-background/65">{user.email}</p>
        <span className="mt-5 inline-flex rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent">
          {user.isEmailVerified ? "Email verified" : "Email not verified"}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/account/orders"
          className="group rounded-2xl border border-border/70 bg-card/70 p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40"
        >
          <Package className="mb-8 h-6 w-6 text-primary" />
          <p className="font-display text-xl font-bold">Order history</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Track deliveries and download invoices.
          </p>
          <ArrowRight className="mt-5 h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          to="/wishlist"
          className="group rounded-2xl border border-border/70 bg-card/70 p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40"
        >
          <Heart className="mb-8 h-6 w-6 text-primary" />
          <p className="font-display text-xl font-bold">Your wishlist</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep a list of pieces you’re considering.
          </p>
          <ArrowRight className="mt-5 h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      <Button variant="outline" className="mt-8 w-fit" onClick={handleLogout}>
        <LogOut className="h-4 w-4" /> Log out
      </Button>
    </main>
  );
}
