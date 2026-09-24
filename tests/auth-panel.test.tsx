// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthPanel } from "@/components/auth-panel";

const authMock = {
  user: null as { email: string } | null,
  email: null as string | null,
  isAdmin: false,
  loading: false,
  isCheckingAdmin: false,
  signInWithPassword: vi.fn(),
  signUpWithPassword: vi.fn(),
  updatePassword: vi.fn(),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  signOut: vi.fn(),
};

vi.mock("@/hooks/use-auth", () => ({ useAuth: () => authMock }));

beforeEach(() => {
  authMock.user = null;
  authMock.email = null;
  authMock.isAdmin = false;
  authMock.loading = false;
  authMock.isCheckingAdmin = false;
  vi.clearAllMocks();
  authMock.signInWithPassword.mockResolvedValue({});
  authMock.signUpWithPassword.mockResolvedValue({});
  authMock.updatePassword.mockResolvedValue({});
  authMock.signInWithEmail.mockResolvedValue({});
  authMock.signUpWithEmail.mockResolvedValue({});
  authMock.resetPasswordForEmail.mockResolvedValue({});
  authMock.signOut.mockResolvedValue({});
});

afterEach(() => {
  cleanup();
});

function fillSignin(email: string, password: string) {
  fireEvent.change(screen.getByLabelText("Email address"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
}

describe("AuthPanel", () => {
  it("sign-in tab shows the password form and submits credentials", async () => {
    render(<AuthPanel nextPath="/my-services" />);

    expect(screen.getByRole("tab", { name: "Sign in" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();

    fillSignin("user@example.com", "secret123");
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(authMock.signInWithPassword).toHaveBeenCalledWith("user@example.com", "secret123")
    );
    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("You are signed in");
  });

  it("rejects mismatched passwords during sign-up without calling the API", () => {
    render(<AuthPanel nextPath="/my-services" />);
    fireEvent.click(screen.getByRole("tab", { name: "Create account" }));

    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "password2" } });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Passwords do not match");
    expect(authMock.signUpWithPassword).not.toHaveBeenCalled();
  });

  it("sign-up succeeds with a valid email and matching passwords", async () => {
    render(<AuthPanel nextPath="/my-services" />);
    fireEvent.click(screen.getByRole("tab", { name: "Create account" }));

    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "password1" } });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() =>
      expect(authMock.signUpWithPassword).toHaveBeenCalledWith("new@example.com", "password1")
    );
    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("Check your email to confirm your account");
  });

  it("surfaces server errors from sign-in", async () => {
    authMock.signInWithPassword.mockResolvedValue({ error: "Invalid login credentials" });
    render(<AuthPanel nextPath="/my-services" />);

    fillSignin("user@example.com", "wrongpass");
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Invalid login credentials");
  });

  it("reset tab sends a password reset email", async () => {
    render(<AuthPanel nextPath="/my-services" />);
    fireEvent.click(screen.getByRole("tab", { name: "Reset password" }));

    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "reset@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    await waitFor(() =>
      expect(authMock.resetPasswordForEmail).toHaveBeenCalledWith("reset@example.com", "/my-services")
    );
    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("Check your email for the password reset link");
  });

  it("update-password mode renders the set-new-password form without tabs", async () => {
    render(<AuthPanel nextPath="/my-services" initialMode="update-password" />);

    expect(screen.getByRole("heading", { name: "Set a new password" })).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.getByLabelText("New password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "newpassword1" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "newpassword1" } });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    await waitFor(() => expect(authMock.updatePassword).toHaveBeenCalledWith("newpassword1"));
    expect(await screen.findByRole("status")).toHaveTextContent("Password updated");
    // Returns to the sign-in tab after success
    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });

  it("offers the email-link fallback on the sign-in tab", async () => {
    render(<AuthPanel nextPath="/my-services" />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "link@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Email me a sign-in link instead" }));

    await waitFor(() =>
      expect(authMock.signInWithEmail).toHaveBeenCalledWith("link@example.com", "/my-services")
    );
  });

  it("shows the signed-in card with Continue and Sign out", async () => {
    authMock.user = { email: "user@example.com" };
    render(<AuthPanel nextPath="/my-services" />);

    expect(screen.getByText("Signed in as")).toBeInTheDocument();
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue" })).toHaveAttribute("href", "/my-services");

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    await waitFor(() => expect(authMock.signOut).toHaveBeenCalledTimes(1));
  });

  it("validates a short password during sign-up", () => {
    render(<AuthPanel nextPath="/my-services" />);
    fireEvent.click(screen.getByRole("tab", { name: "Create account" }));

    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "short" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Password must be at least 8 characters");
    expect(authMock.signUpWithPassword).not.toHaveBeenCalled();
  });
});
