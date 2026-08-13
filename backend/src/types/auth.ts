import type { Role } from "@prisma/client";

/** What goes inside a signed access token. Kept minimal — no PII beyond
 * what's needed for authorization checks, since JWT payloads are only
 * base64-encoded, not encrypted, and can be decoded by anyone holding the
 * token. */
export interface AccessTokenPayload {
  sub: string; // user id
  role: Role;
  tokenVersion?: never; // reserved; access tokens are short-lived, no versioning needed
}

/** Refresh tokens are opaque to the client (random string), but the value
 * we actually sign carries just enough to look up the Session row. */
export interface RefreshTokenPayload {
  sub: string; // user id
  sid: string; // session id — lets us revoke a single session, not all of a user's
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isEmailVerified: boolean;
}
