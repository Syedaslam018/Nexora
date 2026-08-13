import { QueryClient } from "@tanstack/react-query";

/**
 * Centralized so cache behavior is consistent across every feature's
 * queries/mutations instead of each hook picking its own defaults.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute — product/category data doesn't change every second
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
