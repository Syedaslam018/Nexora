import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { ProductCard } from "./ProductCard";
import { ProductGrid } from "./ProductGrid";
import type { ProductListItem } from "@/types/product";

function buildProduct(overrides: Partial<ProductListItem> = {}): ProductListItem {
  return {
    id: "prod-1",
    name: "NEXORA Phone 12",
    slug: "nexora-phone-12",
    sku: "SKU-1",
    priceCents: 79_999,
    compareAtPriceCents: null,
    discountPercent: null,
    avgRating: 4.5,
    reviewCount: 12,
    brand: { name: "NEXORA", slug: "nexora" },
    category: { name: "Smartphones", slug: "smartphones" },
    thumbnailUrl: "https://example.com/phone.jpg",
    unitsSold: 100,
    inStock: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("ProductCard", () => {
  it("renders the product name, brand, and formatted price", () => {
    renderWithProviders(<ProductCard product={buildProduct({ priceCents: 129_999 })} />);
    expect(screen.getByText("NEXORA Phone 12")).toBeInTheDocument();
    expect(screen.getByText("NEXORA")).toBeInTheDocument();
    expect(screen.getByText("$1,299.99")).toBeInTheDocument();
  });

  it("links to the product's detail page by slug", () => {
    renderWithProviders(<ProductCard product={buildProduct({ slug: "cool-widget" })} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/products/cool-widget");
  });

  it("shows the discount badge only when there's an active discount", () => {
    renderWithProviders(
      <ProductCard product={buildProduct({ discountPercent: 20, compareAtPriceCents: 99_999 })} />,
    );
    expect(screen.getByText("-20%")).toBeInTheDocument();
  });

  it("does not show a discount badge for a full-price item", () => {
    renderWithProviders(<ProductCard product={buildProduct({ discountPercent: null })} />);
    expect(screen.queryByText(/-\d+%/)).not.toBeInTheDocument();
  });

  it("shows an out-of-stock indicator when the product has no stock", () => {
    renderWithProviders(<ProductCard product={buildProduct({ inStock: false })} />);
    expect(screen.getByText("Out of stock")).toBeInTheDocument();
  });

  it("shows the star rating only when there are reviews", () => {
    const { rerender } = renderWithProviders(<ProductCard product={buildProduct({ reviewCount: 0 })} />);
    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
    rerender(<ProductCard product={buildProduct({ reviewCount: 5, avgRating: 4.2 })} />);
    expect(screen.getByText("4.2")).toBeInTheDocument();
    expect(screen.getByText("(5)")).toBeInTheDocument();
  });
});

describe("ProductGrid", () => {
  it("renders a card per product", () => {
    const products = [buildProduct({ id: "1", name: "Product One" }), buildProduct({ id: "2", name: "Product Two" })];
    renderWithProviders(<ProductGrid products={products} />);
    expect(screen.getByText("Product One")).toBeInTheDocument();
    expect(screen.getByText("Product Two")).toBeInTheDocument();
  });

  it("shows skeleton placeholders while loading, not the empty state", () => {
    renderWithProviders(<ProductGrid products={[]} isLoading />);
    expect(screen.queryByText("No products found")).not.toBeInTheDocument();
  });

  it("shows an empty state when there are no products and it's not loading", () => {
    renderWithProviders(<ProductGrid products={[]} />);
    expect(screen.getByText("No products found")).toBeInTheDocument();
  });
});
