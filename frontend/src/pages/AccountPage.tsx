import { useNavigate, Link } from "react-router-dom";
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
    <main className="container flex min-h-screen flex-col gap-4 py-12">
      <h1 className="font-display text-2xl font-semibold">
        {user.firstName} {user.lastName}
      </h1>
      <dl className="font-mono-data text-sm text-muted-foreground">
        <div>{user.email}</div>
        <div>{user.role}</div>
        <div>{user.isEmailVerified ? "Email verified" : "Email not verified"}</div>
      </dl>
      <Link to="/account/orders" className="w-fit text-sm text-primary hover:underline">
        Order history →
      </Link>
      <Button variant="outline" className="w-fit" onClick={handleLogout}>
        Log out
      </Button>
    </main>
  );
}
