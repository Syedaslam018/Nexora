import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/test-utils";
import { CartItemRow } from "./CartItemRow";

const ITEM = {
  variantId: "variant-1",
  productSlug: "nexora-laptop",
  productName: "NEXORA Laptop",
  variantName: "16GB / 512GB",
  thumbnailUrl: null,
  unitPriceCents: 50_000,
  quantity: 2,
  availableQty: 5,
};

describe("CartItemRow", () => {
  it("renders the product name, variant, and line total", () => {
    renderWithProviders(<CartItemRow item={ITEM} onQuantityChange={() => {}} onRemove={() => {}} />);
    expect(screen.getByText("NEXORA Laptop")).toBeInTheDocument();
    expect(screen.getByText("16GB / 512GB")).toBeInTheDocument();
    expect(screen.getByText("$1,000.00")).toBeInTheDocument(); // 50,000 * 2
  });

  it("calls onQuantityChange with quantity - 1 when the decrease button is clicked", async () => {
    const onQuantityChange = vi.fn();
    renderWithProviders(<CartItemRow item={ITEM} onQuantityChange={onQuantityChange} onRemove={() => {}} />);
    await userEvent.click(screen.getByLabelText("Decrease quantity"));
    expect(onQuantityChange).toHaveBeenCalledWith(1);
  });

  it("calls onQuantityChange with quantity + 1 when the increase button is clicked", async () => {
    const onQuantityChange = vi.fn();
    renderWithProviders(<CartItemRow item={ITEM} onQuantityChange={onQuantityChange} onRemove={() => {}} />);
    await userEvent.click(screen.getByLabelText("Increase quantity"));
    expect(onQuantityChange).toHaveBeenCalledWith(3);
  });

  it("disables the increase button once quantity reaches available stock", () => {
    renderWithProviders(
      <CartItemRow item={{ ...ITEM, quantity: 5, availableQty: 5 }} onQuantityChange={() => {}} onRemove={() => {}} />,
    );
    expect(screen.getByLabelText("Increase quantity")).toBeDisabled();
  });

  it("shows a low-stock warning when quantity meets or exceeds available stock", () => {
    renderWithProviders(
      <CartItemRow item={{ ...ITEM, quantity: 5, availableQty: 5 }} onQuantityChange={() => {}} onRemove={() => {}} />,
    );
    expect(screen.getByText(/Only 5 left in stock/)).toBeInTheDocument();
  });

  it("calls onRemove when the remove button is clicked", async () => {
    const onRemove = vi.fn();
    renderWithProviders(<CartItemRow item={ITEM} onQuantityChange={() => {}} onRemove={onRemove} />);
    await userEvent.click(screen.getByLabelText("Remove item"));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("never lets quantity go below 1 via the decrease button", async () => {
    const onQuantityChange = vi.fn();
    renderWithProviders(
      <CartItemRow item={{ ...ITEM, quantity: 1 }} onQuantityChange={onQuantityChange} onRemove={() => {}} />,
    );
    await userEvent.click(screen.getByLabelText("Decrease quantity"));
    expect(onQuantityChange).toHaveBeenCalledWith(1);
  });
});
