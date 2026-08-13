import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";
import { env } from "../config/env.js";
import type { AccessTokenPayload, RefreshTokenPayload } from "../types/auth.js";

// @types/jsonwebtoken types `expiresIn` as a narrow literal union (from the
// `ms` package's `StringValue`) rather than plain `string`, so a value read
// from a runtime-validated env var needs an explicit cast here — the env
// schema (`config/env.ts`) is what actually guarantees it's a valid `ms`
// string like "15m" or "30d".
type ExpiresIn = jwt.SignOptions["expiresIn"];

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as ExpiresIn,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as ExpiresIn,
  });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

/**
 * Password-reset and email-verification links use a random opaque token,
 * not a JWT: the token in the emailed URL is the ONLY copy of the secret,
 * and we store just its SHA-256 hash in the database (same principle as a
 * password — if the DB leaks, the raw tokens still don't). The plaintext
 * token is returned once, for the email service to put in the link.
 */
export function generateOpaqueToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashOpaqueToken(token);
  return { token, tokenHash };
}

export function hashOpaqueToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}