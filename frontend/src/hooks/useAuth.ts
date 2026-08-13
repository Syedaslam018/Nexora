import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth.api";

/**
 * Runs once at app mount. The access token only lives in memory (see
 * authStore), so a hard refresh always starts with none — this silently
 * calls /auth/refresh (which relies on the HTTP-only cookie, sent
 * automatically) to restore the session without the user re-entering
 * credentials. If there's no valid cookie, it fails quietly and the app
 * just renders logged-out, exactly as it should.
 */
export function useAuthBootstrap() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setInitialized = useAuthStore((s) => s.setInitialized);

  useEffect(() => {
    let cancelled = false;
    authApi
      .refresh()
      .then(({ user, accessToken }) => {
        if (!cancelled) setAuth(user, accessToken);
      })
      .catch(() => {
        // No valid session — expected for guests, not an error to surface.
      })
      .finally(() => {
        if (!cancelled) setInitialized();
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function useCurrentUser() {
  return useAuthStore((s) => s.user);
}

export function useIsAuthenticated() {
  return useAuthStore((s) => s.user !== null);
}
