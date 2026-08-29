import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
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
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminAnalyticsPage } from "@/pages/admin/AdminAnalyticsPage";
import { AdminProductsPage } from "@/pages/admin/AdminProductsPage";
import { AdminOrdersPage } from "@/pages/admin/AdminOrdersPage";
import { AdminOrderDetailPage } from "@/pages/admin/AdminOrderDetailPage";
import { AdminCustomersPage } from "@/pages/admin/AdminCustomersPage";
import { AdminCouponsPage } from "@/pages/admin/AdminCouponsPage";
import { AdminReviewsPage } from "@/pages/admin/AdminReviewsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";

/**
 * Every /admin/* route is nested under ProtectedRoute(ADMIN/STAFF) AND
 * AdminLayout, so the sidebar nav and the role gate both apply uniformly —
 * adding a new admin page later is just one more entry in this array plus
 * one more item in AdminLayout's nav list.
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
      { path: "cart", element: <CartPage /> },
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
  {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "analytics", element: <AdminAnalyticsPage /> },
          { path: "products", element: <AdminProductsPage /> },
          { path: "orders", element: <AdminOrdersPage /> },
          { path: "orders/:orderId", element: <AdminOrderDetailPage /> },
          { path: "customers", element: <AdminCustomersPage /> },
          { path: "coupons", element: <AdminCouponsPage /> },
          { path: "reviews", element: <AdminReviewsPage /> },
        ],
      },
    ],
  },
]);
