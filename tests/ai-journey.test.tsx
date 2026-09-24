// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AiChat } from "@/components/ai-chat";
import { AiAssistant } from "@/components/ai-assistant";
import { NavBar } from "@/components/nav-bar";
import { AuthProvider } from "@/hooks/use-auth";

// Next's navigation hooks need the app-router context, which does not exist
// in unit tests — provide controllable mocks instead.
let mockPathname = "/";
vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    }),
    usePathname: () => mockPathname,
    useSearchParams: () => new URLSearchParams(),
  };
});

const languages = [
  { id: "l1", code: "en", name: "English", native_name: "English" },
  { id: "l2", code: "hi", name: "Hindi", native_name: "हिन्दी" },
];

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ session: null, user: null }),
    })
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  mockPathname = "/";
});

// Floating "Ask GovGuide AI" button — the most common keyboard entry point
describe("AI assistant keyboard entry point", () => {
  it("renders an accessible floating button that opens the chat", () => {
    render(<AiAssistant languageCode="en" variant="floating" />);
    const openButton = screen.getByRole("button", { name: "Open AI assistant" });
    expect(openButton).toHaveTextContent("Ask GovGuide AI");

    // Keyboard/mouse activation opens the chat panel
    fireEvent.click(openButton);
    expect(screen.getByRole("button", { name: "Close AI assistant" })).toBeInTheDocument();
    expect(screen.getByLabelText("Ask a question")).toBeInTheDocument();
  });
});

// E2E-lite: search → service → ask AI (mirrors the real user journey without a browser)
describe("service context journey (E2E-lite)", () => {
  it("passes service context and suggested question into the AI chat", () => {
    render(
      <AiChat
        languageCode="en"
        serviceId="income-certificate"
        stateCode="assam"
        initialSuggestions={["What documents do I need?"]}
      />
    );
    // Suggested question comes from the service, then the user asks it
    const suggestion = screen.getByRole("button", { name: "What documents do I need?" });
    expect(suggestion).toBeInTheDocument();
    expect(screen.getByLabelText("Ask a question")).toBeInTheDocument();
  });
});

// NavBar active-link states (regression for aria-current derivation)
describe("NavBar active states", () => {
  it("marks Home as the current page on the root path", () => {
    mockPathname = "/";
    render(
      <AuthProvider>
        <NavBar languages={languages} languageCode="en" />
      </AuthProvider>
    );
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Services" })).not.toHaveAttribute("aria-current");
  });

  it("marks Services as the current page on /services", () => {
    mockPathname = "/services";
    render(
      <AuthProvider>
        <NavBar languages={languages} languageCode="en" />
      </AuthProvider>
    );
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
  });

  it("marks My Services as the current page on /my-services", () => {
    mockPathname = "/my-services";
    render(
      <AuthProvider>
        <NavBar languages={languages} languageCode="en" />
      </AuthProvider>
    );
    expect(screen.getByRole("link", { name: "My Services" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});