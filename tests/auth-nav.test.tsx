// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AuthNav } from "@/components/auth-nav";

const authMock = {
  user: null as { email: string } | null,
  loading: false,
  signOut: vi.fn(),
};

vi.mock("@/hooks/use-auth", () => ({ useAuth: () => authMock }));

beforeEach(() => {
  authMock.user = null;
  authMock.loading = false;
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("AuthNav", () => {
  it("shows a Sign in link for anonymous visitors", () => {
    render(<AuthNav languageCode="hi" />);
    const link = screen.getByRole("link", { name: "Sign in" });
    expect(link).toHaveAttribute("href", "/auth?lang=hi");
  });

  it("shows a Sign out button for signed-in users and signs out on click", () => {
    authMock.user = { email: "user@example.com" };
    render(<AuthNav languageCode="en" />);
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(authMock.signOut).toHaveBeenCalledTimes(1);
  });

  it("renders a space-reserving placeholder while the session loads", () => {
    authMock.loading = true;
    render(<AuthNav languageCode="en" />);
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sign out" })).not.toBeInTheDocument();
  });

  it("mobile variant renders block-sized entry points", () => {
    render(<AuthNav languageCode="en" variant="mobile" />);
    const link = screen.getByRole("link", { name: "Sign in" });
    expect(link.className).toContain("block");
  });
});
