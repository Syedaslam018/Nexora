import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

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

// The access token lives in the Zustand auth store (in-memory only — see
// store/authStore.ts for why), so every outgoing request attaches it here
// rather than the caller passing it manually each time.
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On a 401, attempt exactly one silent refresh (via the HTTP-only cookie)
// and replay the original request. `isRefreshing`/`pendingQueue` collapse
// concurrent 401s from several simultaneous requests into a single refresh
// call instead of firing one per request.
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function resolveQueue(token: string | null) {
  pendingQueue.forEach((resolve) => resolve(token));
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    const isAuthEndpoint = originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${token}` };
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      // Imported lazily to avoid a circular import (authApi -> client -> authApi).
      const { authApi } = await import("./auth.api");
      const { user, accessToken } = await authApi.refresh();
      useAuthStore.getState().setAuth(user, accessToken);
      resolveQueue(accessToken);
      originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${accessToken}` };
      return apiClient(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearAuth();
      resolveQueue(null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

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
