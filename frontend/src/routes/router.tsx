import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import {
  HomePage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
  AccountPage,
  ProductListingPage,
  ProductDetailPage,
  CartPage,
  WishlistPage,
  CheckoutPage,
  OrderConfirmationPage,
  OrdersListPage,
  OrderDetailPage,
  AdminDashboardPage,
  AdminAnalyticsPage,
  AdminProductsPage,
  AdminOrdersPage,
  AdminOrderDetailPage,
  AdminCustomersPage,
  AdminCouponsPage,
  AdminReviewsPage,
} from "./lazyPages";

/**
 * Every /admin/* route is nested under ProtectedRoute(ADMIN/STAFF) AND
 * AdminLayout, so the sidebar nav and the role gate both apply uniformly —
 * adding a new admin page later is just one more entry in this array plus
 * one more item in AdminLayout's nav list.
 *
 * Every page element below is a React.lazy component (see lazyPages.ts) —
 * RootLayout and AdminLayout each wrap their <Outlet> in a <Suspense>
 * boundary, so navigating between routes shows a lightweight in-content
 * loading state without the header/sidebar disappearing.
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
          {
            path: "order-confirmation/:orderId",
            element: <OrderConfirmationPage />,
          },
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
