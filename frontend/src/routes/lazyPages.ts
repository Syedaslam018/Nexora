import { lazy } from "react";

/**
 * Every leaf page is code-split via React.lazy — each becomes its own
 * chunk, downloaded only when that route is actually visited, instead of
 * one monolithic bundle shipping the entire admin dashboard (Recharts and
 * all) to a customer who only ever looks at the storefront.
 *
 * Page components use named exports (established convention across this
 * codebase — see any file in src/pages), so each dynamic import is mapped
 * to the shape React.lazy requires (a module with a `default` export)
 * rather than converting ~20 files to default exports just for this.
 */
export const HomePage = lazy(() =>
  import("@/pages/HomePage").then((m) => ({ default: m.HomePage })),
);
export const LoginPage = lazy(() =>
  import("@/pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
export const RegisterPage = lazy(() =>
  import("@/pages/RegisterPage").then((m) => ({ default: m.RegisterPage })),
);
export const ForgotPasswordPage = lazy(() =>
  import("@/pages/ForgotPasswordPage").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);
export const ResetPasswordPage = lazy(() =>
  import("@/pages/ResetPasswordPage").then((m) => ({
    default: m.ResetPasswordPage,
  })),
);
export const VerifyEmailPage = lazy(() =>
  import("@/pages/VerifyEmailPage").then((m) => ({
    default: m.VerifyEmailPage,
  })),
);
export const AccountPage = lazy(() =>
  import("@/pages/AccountPage").then((m) => ({ default: m.AccountPage })),
);
export const ProductListingPage = lazy(() =>
  import("@/pages/ProductListingPage").then((m) => ({
    default: m.ProductListingPage,
  })),
);
export const ProductDetailPage = lazy(() =>
  import("@/pages/ProductDetailPage").then((m) => ({
    default: m.ProductDetailPage,
  })),
);
export const CartPage = lazy(() =>
  import("@/pages/CartPage").then((m) => ({ default: m.CartPage })),
);
export const WishlistPage = lazy(() =>
  import("@/pages/WishlistPage").then((m) => ({ default: m.WishlistPage })),
);
export const CheckoutPage = lazy(() =>
  import("@/pages/CheckoutPage").then((m) => ({ default: m.CheckoutPage })),
);
export const OrderConfirmationPage = lazy(() =>
  import("@/pages/OrderConfirmationPage").then((m) => ({
    default: m.OrderConfirmationPage,
  })),
);
export const OrdersListPage = lazy(() =>
  import("@/pages/OrdersListPage").then((m) => ({ default: m.OrdersListPage })),
);
export const OrderDetailPage = lazy(() =>
  import("@/pages/OrderDetailPage").then((m) => ({
    default: m.OrderDetailPage,
  })),
);
// NotFoundPage is deliberately NOT lazy — it's used as the router's
// `errorElement`, which renders outside RootLayout's <Suspense> boundary
// (an error replaces the whole routed branch, layout included), so a lazy
// version here would have no Suspense ancestor to catch it.

export const AdminDashboardPage = lazy(() =>
  import("@/pages/admin/AdminDashboardPage").then((m) => ({
    default: m.AdminDashboardPage,
  })),
);
export const AdminAnalyticsPage = lazy(() =>
  import("@/pages/admin/AdminAnalyticsPage").then((m) => ({
    default: m.AdminAnalyticsPage,
  })),
);
export const AdminProductsPage = lazy(() =>
  import("@/pages/admin/AdminProductsPage").then((m) => ({
    default: m.AdminProductsPage,
  })),
);
export const AdminOrdersPage = lazy(() =>
  import("@/pages/admin/AdminOrdersPage").then((m) => ({
    default: m.AdminOrdersPage,
  })),
);
export const AdminOrderDetailPage = lazy(() =>
  import("@/pages/admin/AdminOrderDetailPage").then((m) => ({
    default: m.AdminOrderDetailPage,
  })),
);
export const AdminCustomersPage = lazy(() =>
  import("@/pages/admin/AdminCustomersPage").then((m) => ({
    default: m.AdminCustomersPage,
  })),
);
export const AdminCouponsPage = lazy(() =>
  import("@/pages/admin/AdminCouponsPage").then((m) => ({
    default: m.AdminCouponsPage,
  })),
);
export const AdminReviewsPage = lazy(() =>
  import("@/pages/admin/AdminReviewsPage").then((m) => ({
    default: m.AdminReviewsPage,
  })),
);
