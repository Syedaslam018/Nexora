import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { HomePage } from "@/pages/HomePage";

/**
 * Every page from later phases (product listing, PDP, cart, checkout,
 * account, admin/*) is added here as a route, most of them lazy-loaded
 * (`React.lazy`) once they exist — Section 25 (Performance) calls for
 * lazy-loaded routes, which only makes sense to wire up once there's
 * more than one route to split.
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [{ index: true, element: <HomePage /> }],
  },
]);
