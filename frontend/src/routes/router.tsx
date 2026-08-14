import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { VerifyEmailPage } from "@/pages/VerifyEmailPage";
import { AccountPage } from "@/pages/AccountPage";
import { ProductListingPage } from "@/pages/ProductListingPage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { CartPage } from "@/pages/CartPage";
import { WishlistPage } from "@/pages/WishlistPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { OrderConfirmationPage } from "@/pages/OrderConfirmationPage";
import { OrdersListPage } from "@/pages/OrdersListPage";
import { OrderDetailPage } from "@/pages/OrderDetailPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";

/**
 * Admin routes are added here once Phase 9 lands, using
 * <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]} />. Most routes are
 * lazy-loaded (`React.lazy`) once there's enough of them for code-splitting
 * to matter (Section 25 — Performance).
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "products", element: <ProductListingPage /> },
      { path: "products/:idOrSlug", element: <ProductDetailPage /> },
      { path: "cart", element: <CartPage /> }, // works for guests too — see CartPage
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      { path: "verify-email", element: <VerifyEmailPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "account", element: <AccountPage /> },
          { path: "account/orders", element: <OrdersListPage /> },
          { path: "account/orders/:orderId", element: <OrderDetailPage /> },
          { path: "wishlist", element: <WishlistPage /> },
          { path: "checkout", element: <CheckoutPage /> },
          { path: "order-confirmation/:orderId", element: <OrderConfirmationPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
