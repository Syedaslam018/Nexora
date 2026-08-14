import ms, { type StringValue } from "ms";
import { userRepository } from "../repositories/user.repository.js";
import { sessionRepository } from "../repositories/session.repository.js";
import { passwordResetRepository } from "../repositories/passwordReset.repository.js";
import { emailVerificationRepository } from "../repositories/emailVerification.repository.js";
import { prisma } from "../config/db.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateOpaqueToken,
  hashOpaqueToken,
} from "../utils/tokens.js";
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from "./email.service.js";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";
import type { AuthUser } from "../types/auth.js";
import type { RegisterInput, LoginInput } from "../schemas/auth.schema.js";
import type { User } from "@prisma/client";

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  };
}

interface RequestContext {
  userAgent?: string;
  ipAddress?: string;
}

interface AuthResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

/**
 * Issues a fresh access+refresh token pair AND creates the Session row the
 * refresh token is validated against. Called after register, login, and
 * refresh — kept as one function so those three flows can't drift apart on
 * how sessions are created.
 */
async function issueTokens(user: User, ctx: RequestContext): Promise<AuthResult> {
  const refreshTokenExpiresAt = new Date(Date.now() + ms(env.JWT_REFRESH_EXPIRES_IN as StringValue));

  // The refresh token JWT embeds the session id, but the session row is what
  // we actually check on every refresh (so it can be revoked server-side —
  // a bare JWT can't be invalidated before it expires on its own). The
  // session id has to exist before we can sign a JWT that references it, so
  // this is a two-step create-then-update rather than a single insert.
  const session = await sessionRepository.create({
    userId: user.id,
    // refreshTokenHash is a unique column but we don't have the real token
    // yet (it needs this session's id embedded in it) — seed it with a
    // random placeholder, then overwrite with the real hash right below.
    refreshToken: generateOpaqueToken().token,
    userAgent: ctx.userAgent,
    ipAddress: ctx.ipAddress,
    expiresAt: refreshTokenExpiresAt,
  });

  const refreshToken = signRefreshToken({ sub: user.id, sid: session.id });

  await prisma.session.update({
    where: { id: session.id },
    data: { refreshTokenHash: hashOpaqueToken(refreshToken) },
  });

  const accessToken = signAccessToken({ sub: user.id, role: user.role });

  return { user: toAuthUser(user), accessToken, refreshToken, refreshTokenExpiresAt };
}

export const authService = {
  async register(input: RegisterInput, ctx: RequestContext): Promise<AuthResult> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw ApiError.conflict("An account with this email already exists");

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    });

    const { token, tokenHash } = generateOpaqueToken();
    await emailVerificationRepository.create(user.id, tokenHash, new Date(Date.now() + ms("24h")));

    // Email sending never blocks or fails the registration response — a
    // slow/down email provider shouldn't turn a successful signup into an
    // error for the user.
    void sendWelcomeEmail(user.email, user.firstName).catch(() => {});
    void sendVerificationEmail(user.email, token).catch(() => {});

    return issueTokens(user, ctx);
  },

  async login(input: LoginInput, ctx: RequestContext): Promise<AuthResult> {
    const user = await userRepository.findByEmail(input.email);
    // Same error for "no such user" and "wrong password" — don't leak which
    // one it was, that's an account-enumeration vector.
    const invalidCredentials = () => ApiError.unauthorized("Invalid email or password");

    if (!user) throw invalidCredentials();
    if (!user.isActive) throw ApiError.forbidden("This account has been disabled");

    const valid = await verifyPassword(user.passwordHash, input.password);
    if (!valid) throw invalidCredentials();

    return issueTokens(user, ctx);
  },

  async refresh(refreshToken: string, ctx: RequestContext): Promise<AuthResult> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized("Invalid or expired session");
    }

    const session = await sessionRepository.findValidByToken(refreshToken);
    if (!session || session.id !== payload.sid) {
      throw ApiError.unauthorized("Invalid or expired session");
    }

    const user = await userRepository.findById(payload.sub);
    if (!user || !user.isActive) throw ApiError.unauthorized("Invalid or expired session");

    // Rotate: revoke the presented refresh token and issue a brand new pair.
    // If a stolen refresh token is ever replayed after the legitimate user
    // has already rotated it, rotation makes the theft detectable (the old
    // token is dead) rather than silently reusable forever.
    await sessionRepository.revoke(session.id);
    return issueTokens(user, ctx);
  },

  async logout(refreshToken: string): Promise<void> {
    const session = await sessionRepository.findValidByToken(refreshToken);
    if (session) await sessionRepository.revoke(session.id);
  },

  async logoutAllSessions(userId: string): Promise<void> {
    await sessionRepository.revokeAllForUser(userId);
  },

  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    // Always behave the same whether or not the account exists — the
    // controller returns a generic "check your email" message either way.
    if (!user) return;

    await passwordResetRepository.invalidateAllForUser(user.id);
    const { token, tokenHash } = generateOpaqueToken();
    await passwordResetRepository.create(user.id, tokenHash, new Date(Date.now() + ms("1h")));
    void sendPasswordResetEmail(user.email, token).catch(() => {});
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const reset = await passwordResetRepository.findValidByToken(token);
    if (!reset) throw ApiError.badRequest("This reset link is invalid or has expired");

    const passwordHash = await hashPassword(newPassword);
    await userRepository.updatePasswordHash(reset.userId, passwordHash);
    await passwordResetRepository.markUsed(reset.id);
    // Password changed → every existing session (stolen token or not) is
    // invalidated, forcing re-login everywhere.
    await sessionRepository.revokeAllForUser(reset.userId);
  },

  async verifyEmail(token: string): Promise<void> {
    const record = await emailVerificationRepository.findValidByToken(token);
    if (!record) throw ApiError.badRequest("This verification link is invalid or has expired");

    await userRepository.markEmailVerified(record.userId);
    await emailVerificationRepository.markUsed(record.id);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound("User not found");

    const valid = await verifyPassword(user.passwordHash, currentPassword);
    if (!valid) throw ApiError.badRequest("Current password is incorrect");

    const passwordHash = await hashPassword(newPassword);
    await userRepository.updatePasswordHash(userId, passwordHash);
    // Keep the current session alive but kill every other one.
    await sessionRepository.revokeAllForUser(userId);
  },

  async getAuthUser(userId: string): Promise<AuthUser> {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound("User not found");
    return toAuthUser(user);
  },
};
