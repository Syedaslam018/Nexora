import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { verifyAccessToken } from "../utils/tokens.js";
import { userRepository } from "../repositories/user.repository.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

let io: SocketIOServer | undefined;

/**
 * One Socket.IO server, attached to the same HTTP server the REST API runs
 * on (not a separate port) — same CORS/origin story as the API, and one
 * less thing to configure separately in production. Called once from
 * server.ts.
 *
 * Rooms are the whole strategy here: every authenticated socket joins
 * `user:{userId}` (their own personal notification channel) and, if their
 * role is ADMIN/STAFF, also joins `admins` (the broadcast channel for
 * order/inventory alerts). Emitting "to admins" or "to a specific user" is
 * then just `io.to(room).emit(...)` — no manual bookkeeping of which
 * sockets belong to which user.
 */
export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  // Auth middleware: every connection must present a valid access token —
  // the same JWT used for REST requests, passed via the client's socket.io
  // `auth` option rather than a cookie (Socket.IO's cookie handling doesn't
  // cleanly share the HTTP-only refresh-token cookie flow used elsewhere).
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error("Authentication required"));
      const payload = verifyAccessToken(token);
      const user = await userRepository.findById(payload.sub);
      if (!user || !user.isActive) return next(new Error("Authentication required"));
      socket.data.userId = user.id;
      socket.data.role = user.role;
      next();
    } catch {
      next(new Error("Authentication required"));
    }
  });

  io.on("connection", (socket) => {
    const { userId, role } = socket.data as { userId: string; role: string };
    void socket.join(`user:${userId}`);
    if (role === "ADMIN" || role === "STAFF") {
      void socket.join("admins");
    }
    logger.debug({ userId, role }, "Socket connected");

    socket.on("disconnect", () => {
      logger.debug({ userId }, "Socket disconnected");
    });
  });

  return io;
}

/** Push a real-time event to one user's own devices/tabs (any of them —
 * joining the room, not tracking individual socket ids, is what makes
 * multi-tab/multi-device delivery automatic). A no-op if the socket layer
 * isn't initialized (e.g. during tests) — never blocks business logic. */
export function emitToUser(userId: string, event: string, payload: unknown): void {
  io?.to(`user:${userId}`).emit(event, payload);
}

/** Push a real-time event to every connected admin/staff session at once —
 * used for new-order and low-stock alerts. */
export function emitToAdmins(event: string, payload: unknown): void {
  io?.to("admins").emit(event, payload);
}
