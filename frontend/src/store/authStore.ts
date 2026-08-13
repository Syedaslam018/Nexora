import { create } from "zustand";
import type { AuthUser } from "@/types/auth";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  /** True until the initial silent-refresh-on-load attempt finishes — lets
   * ProtectedRoute avoid a flash of "redirect to login" before we've even
   * checked whether a valid session cookie exists. */
  isInitializing: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
  clearAuth: () => void;
  setInitialized: () => void;
}

/**
 * The access token lives here (in-memory JS state) and NOWHERE else —
 * specifically not localStorage/sessionStorage, which any injected script
 * (XSS) can read. It's lost on a hard refresh by design; `useAuth`'s
 * mount-time silent refresh (via the HTTP-only refresh cookie, which JS
 * can't read at all) is what restores it.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isInitializing: true,
  setAuth: (user, accessToken) => set({ user, accessToken }),
  clearAuth: () => set({ user: null, accessToken: null }),
  setInitialized: () => set({ isInitializing: false }),
}));
