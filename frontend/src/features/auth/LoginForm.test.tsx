import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/test-utils";

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  setAuth: vi.fn(),
  mergeGuestCartIfAny: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("@/api/auth.api", () => ({ authApi: { login: mocks.login } }));
vi.mock("@/store/authStore", () => ({ useAuthStore: (selector: (s: unknown) => unknown) => selector({ setAuth: mocks.setAuth }) }));
vi.mock("@/features/cart/useCart", () => ({ mergeGuestCartIfAny: mocks.mergeGuestCartIfAny }));
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mocks.navigate };
});

const { LoginForm } = await import("./LoginForm");

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation errors instead of submitting when fields are empty", async () => {
    renderWithProviders(<LoginForm />);
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it("logs in, stores auth state, merges the guest cart, and navigates home on success", async () => {
    mocks.login.mockResolvedValue({
      user: { id: "u1", firstName: "Ada", email: "ada@example.com" },
      accessToken: "token-abc",
    });

    renderWithProviders(<LoginForm />);
    await userEvent.type(screen.getByLabelText("Email"), "ada@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "Password123");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("button", { name: "Log in" })).toBeEnabled();
    expect(mocks.login).toHaveBeenCalledWith({ email: "ada@example.com", password: "Password123" });
    expect(mocks.setAuth).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ada@example.com" }),
      "token-abc",
    );
    expect(mocks.mergeGuestCartIfAny).toHaveBeenCalled();
    expect(mocks.navigate).toHaveBeenCalledWith("/");
  });

  it("shows the server's error message on invalid credentials instead of navigating", async () => {
    mocks.login.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: "Invalid email or password" } },
    });

    renderWithProviders(<LoginForm />);
    await userEvent.type(screen.getByLabelText("Email"), "ada@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "WrongPassword1");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(mocks.setAuth).not.toHaveBeenCalled();
  });
});
