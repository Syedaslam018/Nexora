import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";

let socket: Socket | undefined;

/**
 * One socket per browser tab, created lazily on first connect. `auth` is a
 * callback (not a static object) so it's re-evaluated on every connection
 * attempt, including automatic reconnects — always sending whatever access
 * token is currently in the auth store rather than one captured at socket
 * creation time, which would go stale after a token refresh.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || "/", {
      autoConnect: false,
      withCredentials: true,
      auth: (cb) => cb({ token: useAuthStore.getState().accessToken }),
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
}
