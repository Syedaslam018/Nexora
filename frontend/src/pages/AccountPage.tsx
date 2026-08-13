import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth.api";

/**
 * Proves the protected-route + logout flow works end to end. The fuller
 * account UI (edit profile, address book, order history, session list)
 * arrives once orders (Phase 7) and addresses have data to show.
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
      <Button variant="outline" className="w-fit" onClick={handleLogout}>
        Log out
      </Button>
    </main>
  );
}
