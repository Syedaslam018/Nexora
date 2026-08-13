import axios from "axios";

/**
 * In dev, Vite's proxy (vite.config.ts) forwards `/api/*` to the backend,
 * so no base URL is needed. In production this is set to the deployed API's
 * URL via `VITE_API_URL`.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: true, // sends the HTTP-only refresh-token cookie
  headers: { "Content-Type": "application/json" },
});

// Phase 3 adds a response interceptor here that, on a 401, calls
// POST /auth/refresh once and retries the original request — kept out of
// this file until the auth store it depends on exists, rather than adding
// dead code now.

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
