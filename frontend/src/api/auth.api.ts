import { apiClient, type ApiSuccessResponse } from "./client";
import type { AuthUser } from "@/types/auth";

interface AuthResponseData {
  user: AuthUser;
  accessToken: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  async register(payload: RegisterPayload) {
    const { data } = await apiClient.post<ApiSuccessResponse<AuthResponseData>>(
      "/auth/register",
      payload,
    );
    return data.data;
  },

  async login(payload: LoginPayload) {
    const { data } = await apiClient.post<ApiSuccessResponse<AuthResponseData>>(
      "/auth/login",
      payload,
    );
    return data.data;
  },

  /** Relies on the HTTP-only refresh cookie (sent automatically via
   * `withCredentials`) — nothing to pass explicitly. */
  async refresh() {
    const { data } = await apiClient.post<ApiSuccessResponse<AuthResponseData>>("/auth/refresh");
    return data.data;
  },

  async logout() {
    await apiClient.post("/auth/logout");
  },

  async forgotPassword(email: string) {
    await apiClient.post("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, password: string) {
    await apiClient.post("/auth/reset-password", { token, password });
  },

  async verifyEmail(token: string) {
    await apiClient.post("/auth/verify-email", { token });
  },

  async changePassword(currentPassword: string, newPassword: string) {
    await apiClient.post("/auth/change-password", { currentPassword, newPassword });
  },
};
