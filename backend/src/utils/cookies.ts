import type { Response } from "express";
import { isProd } from "../config/env.js";

const REFRESH_COOKIE_NAME = "nexora_refresh_token";

export function setRefreshTokenCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true, // inaccessible to JS — the main XSS mitigation for this token
    secure: isProd, // HTTPS only in production; allow http:// in local dev
    sameSite: "lax", // sent on top-level navigation, blocked on cross-site XHR — CSRF mitigation
    expires: expiresAt,
    path: "/api/auth", // only sent to auth endpoints, not the whole API surface
    signed: true,
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
}

export function getRefreshTokenCookie(cookies: Record<string, string>): string | undefined {
  return cookies[REFRESH_COOKIE_NAME];
}

export { REFRESH_COOKIE_NAME };
