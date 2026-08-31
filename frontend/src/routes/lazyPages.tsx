import { lazy } from "react";

export const HomePage = lazy(() =>
  import("@/pages/HomePage").then((module) => ({
    default: module.HomePage,
  })),
);

export const LoginPage = lazy(() =>
  import("@/pages/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);

export const RegisterPage = lazy(() =>
  import("@/pages/RegisterPage").then((module) => ({
    default: module.RegisterPage,
  })),
);

export const ForgotPasswordPage = lazy(() =>
  import("@/pages/ForgotPasswordPage").then((module) => ({
    default: module.ForgotPasswordPage,
  })),
);

export const ResetPasswordPage = lazy(() =>
  import("@/pages/ResetPasswordPage").then((module) => ({
    default: module.ResetPasswordPage,
  })),
);

export const VerifyEmailPage = lazy(() =>
  import("@/pages/VerifyEmailPage").then((module) => ({
    default: module.VerifyEmailPage,
  })),
);

export const AccountPage = lazy(() =>
  import("@/pages/AccountPage").then((module) => ({
    default: module.AccountPage,
  })),
);

export const ProductListingPage = lazy(() =>
  import("@/pages/ProductListingPage").then((module) => ({
    default: module.ProductListingPage,
  })),
);

export const ProductDetailPage = lazy(() =>
  import("@/pages/ProductDetailPage").then((module) => ({
    default: module.ProductDetailPage,
  })),
);

export const CartPage = lazy(() =>
  import("@/pages/CartPage").then((module) => ({
    default: module.CartPage,
  })),
);

export const WishlistPage = lazy(() =>
  import("@/pages/WishlistPage").then((module) => ({
    default: module.WishlistPage,
  })),
);

export const CheckoutPage = lazy(() =>
  import("@/pages/CheckoutPage").then((module) => ({
    default: module.CheckoutPage,
  })),
);

export const OrderConfirmationPage = lazy(() =>
  import("@/pages/OrderConfirmationPage").then((module) => ({
    default: module.OrderConfirmationPage,
  })),
);

export const OrdersListPage = lazy(() =>
  import("@/pages/OrdersListPage").then((module) => ({
    default: module.OrdersListPage,
  })),
);

export const OrderDetailPage = lazy(() =>
  import("@/pages/OrderDetailPage").then((module) => ({
    default: module.OrderDetailPage,
  })),
);

export const AdminDashboardPage = lazy(() =>
  import("@/pages/admin/AdminDashboardPage").then((module) => ({
    default: module.AdminDashboardPage,
  })),
);

export const AdminAnalyticsPage = lazy(() =>
  import("@/pages/admin/AdminAnalyticsPage").then((module) => ({
    default: module.AdminAnalyticsPage,
  })),
);

export const AdminProductsPage = lazy(() =>
  import("@/pages/admin/AdminProductsPage").then((module) => ({
    default: module.AdminProductsPage,
  })),
);

export const AdminOrdersPage = lazy(() =>
  import("@/pages/admin/AdminOrdersPage").then((module) => ({
    default: module.AdminOrdersPage,
  })),
);

export const AdminOrderDetailPage = lazy(() =>
  import("@/pages/admin/AdminOrderDetailPage").then((module) => ({
    default: module.AdminOrderDetailPage,
  })),
);

export const AdminCustomersPage = lazy(() =>
  import("@/pages/admin/AdminCustomersPage").then((module) => ({
    default: module.AdminCustomersPage,
  })),
);

export const AdminCouponsPage = lazy(() =>
  import("@/pages/admin/AdminCouponsPage").then((module) => ({
    default: module.AdminCouponsPage,
  })),
);

export const AdminReviewsPage = lazy(() =>
  import("@/pages/admin/AdminReviewsPage").then((module) => ({
    default: module.AdminReviewsPage,
  })),
);