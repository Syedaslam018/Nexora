import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { verifyAccessToken } from "../utils/tokens.js";
import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Verifies the `Authorization: Bearer <accessToken>` header and attaches
 * `req.user`. Access tokens are short-lived (15m default) and NOT checked
 * against the database on every request — that's the point of using a JWT
 * here rather than a session lookup, since this middleware runs on nearly
 * every request. Revocation (logout, password change, disabling an account)
 * takes effect within one access-token lifetime, via the refresh flow and
 * the `isActive` check there — an acceptable tradeoff for the performance
 * win, and one worth being able to explain in an interview.
 */
export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Authentication required");
  }

  const token = header.slice("Bearer ".length);
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired access token");
  }

  const user = await userRepository.findById(payload.sub);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Invalid or expired access token");
  }

  req.user = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  };
  next();
});

/**
 * Like `authenticate`, but doesn't reject when there's no token — used on
 * routes that behave differently for logged-in vs. guest users (e.g.
 * product listing showing wishlist state) without requiring login.
 */
export const attachUserIfPresent = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return next();

    try {
      const payload = verifyAccessToken(header.slice("Bearer ".length));
      const user = await userRepository.findById(payload.sub);
      if (user?.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        };
      }
    } catch {
      // Invalid/expired token on an optional-auth route — proceed as guest
      // rather than erroring.
    }
    next();
  },
);

/**
 * RBAC gate. Must run after `authenticate`. Customers hitting an admin-only
 * route get a 403, never a leak of what the route would have returned.
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(ApiError.unauthorized("Authentication required"));
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(ApiError.forbidden("You do not have permission to perform this action"));
      return;
    }
    next();
  };
}
