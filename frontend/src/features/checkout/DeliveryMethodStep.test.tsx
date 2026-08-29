import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/test-utils";

const mocks = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/api/cart.api", () => ({ cartApi: { get: mocks.get } }));

const { DeliveryMethodStep } = await import("./DeliveryMethodStep");

const CART_STANDARD = { pricing: { shippingCents: 599 } };
const CART_EXPRESS = { pricing: { shippingCents: 1_999 } };

describe("DeliveryMethodStep", () => {
  it("shows both shipping options with their live-priced cost", async () => {
    mocks.get.mockImplementation(({ deliveryMethod }: { deliveryMethod: "STANDARD" | "EXPRESS" }) =>
      Promise.resolve(deliveryMethod === "STANDARD" ? CART_STANDARD : CART_EXPRESS),
    );

    renderWithProviders(<DeliveryMethodStep value="STANDARD" onChange={() => {}} />);

    expect(screen.getByText("Standard Shipping")).toBeInTheDocument();
    expect(screen.getByText("Express Shipping")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("$5.99")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("$19.99")).toBeInTheDocument());
  });

  it("shows 'Free' instead of $0.00 when shipping is waived", async () => {
    mocks.get.mockResolvedValue({ pricing: { shippingCents: 0 } });
    renderWithProviders(<DeliveryMethodStep value="STANDARD" onChange={() => {}} />);
    await waitFor(() => expect(screen.getAllByText("Free").length).toBeGreaterThan(0));
  });

  it("marks the currently selected option's radio as checked", () => {
    mocks.get.mockResolvedValue(CART_STANDARD);
    renderWithProviders(<DeliveryMethodStep value="EXPRESS" onChange={() => {}} />);
    const radios = screen.getAllByRole("radio") as HTMLInputElement[];
    const expressRadio = radios[1]!;
    expect(expressRadio.checked).toBe(true);
  });

  it("calls onChange with the clicked option's value", async () => {
    mocks.get.mockResolvedValue(CART_STANDARD);
    const onChange = vi.fn();
    renderWithProviders(<DeliveryMethodStep value="STANDARD" onChange={onChange} />);
    await userEvent.click(screen.getByText("Express Shipping"));
    expect(onChange).toHaveBeenCalledWith("EXPRESS");
  });
});
