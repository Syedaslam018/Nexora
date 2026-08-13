import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/types/auth";

interface ProtectedRouteProps {
  /** If provided, only these roles may pass — anyone else is redirected. */
  allowedRoles?: Role[];
}

/**
 * Frontend-side route guard. This is a UX convenience, NOT the security
 * boundary — every protected backend endpoint independently checks
 * `authenticate`/`authorize` regardless of what the frontend does, since a
 * client-side check can always be bypassed by calling the API directly.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const location = useLocation();

  if (isInitializing) {
    // Still attempting the silent refresh-on-load — avoid a flash redirect
    // to /login for a user who actually has a valid session cookie.
    return null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
