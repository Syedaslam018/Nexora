import { useEffect } from "react";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { useIsAuthenticated } from "./useAuth";

/**
 * Connects the socket once the user is authenticated, disconnects on
 * logout. Call this once near the app root (RootLayout) — the socket
 * itself is a singleton (see lib/socket.ts), so calling this hook more
 * than once is harmless but unnecessary.
 */
export function useSocketConnection() {
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    const socket = getSocket();
    if (isAuthenticated) {
      socket.connect();
    } else {
      disconnectSocket();
    }
    return () => {
      // Only disconnect on unmount, not on every dependency change — the
      // isAuthenticated branch above already handles the logout case.
    };
  }, [isAuthenticated]);
}
