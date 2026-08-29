import type { ReactElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";

/** Most components under test reach into React Query and/or React Router
 * context (a <Link>, a data-fetching hook) even when the test itself only
 * cares about a presentational detail — this wrapper provides both so
 * individual test files don't have to. A fresh QueryClient per render
 * avoids cache bleed between tests. */
function AllProviders({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

export function renderWithProviders(ui: ReactElement) {
  return render(ui, { wrapper: AllProviders });
}

export * from "@testing-library/react";
