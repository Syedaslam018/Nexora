import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { VerifyEmailPage } from "@/pages/VerifyEmailPage";
import { AccountPage } from "@/pages/AccountPage";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";

/**
 * Product listing/PDP/cart/checkout/admin routes are added here as their
 * phases land, most lazy-loaded (`React.lazy`) once there's enough of them
 * for code-splitting to matter (Section 25 — Performance).
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      { path: "verify-email", element: <VerifyEmailPage /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: "account", element: <AccountPage /> }],
      },
      // Admin routes will use <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]} />
      // once the admin dashboard (Phase 9) exists.
    ],
  },
]);
