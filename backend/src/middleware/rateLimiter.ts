import rateLimit from "express-rate-limit";
import { env, isTest } from "../config/env.js";

/** General API rate limit — generous, just a backstop against abuse. */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

/**
 * Stricter limit for auth endpoints (login/register/forgot-password) where
 * brute-forcing or credential stuffing is the actual threat. Relaxed only
 * when NODE_ENV=test — the integration suite (tests/integration) registers
 * a fresh user per test file and would otherwise trip this limit itself
 * within a single run. Production behavior is unchanged.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later." },
});
