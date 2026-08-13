import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { setRefreshTokenCookie, clearRefreshTokenCookie, REFRESH_COOKIE_NAME } from "../utils/cookies.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
  ChangePasswordInput,
} from "../schemas/auth.schema.js";

function requestContext(req: Request) {
  return { userAgent: req.headers["user-agent"], ipAddress: req.ip };
}

function readRefreshToken(req: Request): string {
  const token = (req.signedCookies as Record<string, string> | undefined)?.[REFRESH_COOKIE_NAME];
  if (!token) throw ApiError.unauthorized("No active session");
  return token;
}

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as RegisterInput;
    const result = await authService.register(body, requestContext(req));
    setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
    sendSuccess(
      res,
      { user: result.user, accessToken: result.accessToken },
      "Account created",
      201,
    );
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as LoginInput;
    const result = await authService.login(body, requestContext(req));
    setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
    sendSuccess(res, { user: result.user, accessToken: result.accessToken }, "Logged in");
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const token = readRefreshToken(req);
    const result = await authService.refresh(token, requestContext(req));
    setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
    sendSuccess(res, { user: result.user, accessToken: result.accessToken }, "Session refreshed");
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const token = (req.signedCookies as Record<string, string> | undefined)?.[REFRESH_COOKIE_NAME];
    if (token) await authService.logout(token);
    clearRefreshTokenCookie(res);
    sendSuccess(res, null, "Logged out");
  }),

  logoutAll: asyncHandler(async (req: Request, res: Response) => {
    await authService.logoutAllSessions(req.user!.id);
    clearRefreshTokenCookie(res);
    sendSuccess(res, null, "Logged out of all devices");
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, { user: req.user }, "Current user");
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as ForgotPasswordInput;
    await authService.forgotPassword(body.email);
    // Same response whether or not the email exists — see authService for why.
    sendSuccess(res, null, "If that email exists, a reset link has been sent");
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as ResetPasswordInput;
    await authService.resetPassword(body.token, body.password);
    sendSuccess(res, null, "Password reset — please log in with your new password");
  }),

  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as VerifyEmailInput;
    await authService.verifyEmail(body.token);
    sendSuccess(res, null, "Email verified");
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as ChangePasswordInput;
    await authService.changePassword(req.user!.id, body.currentPassword, body.newPassword);
    sendSuccess(res, null, "Password changed — other devices have been logged out");
  }),
};
