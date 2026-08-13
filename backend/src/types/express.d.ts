import type { AuthUser } from "../types/auth.js";

declare global {
  namespace Express {
    interface Request {
      /** Populated by the `authenticate` middleware once the access token
       * is verified. Absent on public routes. */
      user?: AuthUser;
    }
  }
}

export {};
