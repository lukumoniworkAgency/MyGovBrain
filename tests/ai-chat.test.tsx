// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AiChat } from "@/components/ai-chat";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function okAiResponse(overrides: Record<string, unknown> = {}) {
  return {
    ok: true,
    json: async () => ({
      response: {
        intent: "document_question",
        language: "en",
        service_id: "income-certificate",
        answer: "You may need an identity document and proof of address.",
        eligibility: ["Residents of the state"],
        required_documents: ["Aadhaar card", "Proof of address"],
        next_steps: ["Apply online at the official portal"],
        official_sources: [
          { title: "Official Government Website", url: "https://example.gov.in/income-certificate" },
        ],
        needs_clarification: false,
        clarification_question: null,
        ...overrides,
      },
      usage: { tokens_used: 10, provider: "gemini", latency_ms: 100 },
      needs_clarification: overrides.needs_clarification ?? false,
    }),
  };
}

describe("AiChat", () => {
  it("renders the empty state with suggested questions and an accessible log", () => {
    render(<AiChat languageCode="en" />);

    expect(screen.getByText("Ask GovGuide AI")).toBeInTheDocument();
    expect(screen.getByText("Ask a question about government services")).toBeInTheDocument();
    expect(screen.getByRole("log")).toHaveAttribute("aria-label", "AI conversation");
    expect(screen.getByRole("button", { name: "What documents do I need?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Who can apply?" })).toBeInTheDocument();
    // No "Clear" button until a conversation exists
    expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
  });

  it("sends a suggestion, shows loading, then renders the answer with source links", async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    const fetchMock = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<AiChat languageCode="en" serviceId="income-certificate" stateCode="assam" />);
    fireEvent.click(screen.getByRole("button", { name: "What documents do I need?" }));

    // Loading state is announced via role="status"
    expect(screen.getByRole("status")).toHaveTextContent("Thinking...");

    // Request payload includes language and current service context
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/ai");
    const body = JSON.parse(init.body);
    expect(body.message.question).toBe("What documents do I need?");
    expect(body.message.language_code).toBe("en");
    expect(body.message.service_id).toBe("income-certificate");
    expect(body.message.state_code).toBe("assam");

    resolveFetch(okAiResponse());

    await waitFor(() =>
      expect(screen.getByText(/identity document and proof of address/)).toBeInTheDocument()
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    // Official source is a verified link that opens in a new tab
    const source = screen.getByRole("link", { name: "Official Government Website" });
    expect(source).toHaveAttribute("href", "https://example.gov.in/income-certificate");
    expect(source).toHaveAttribute("target", "_blank");
    expect(source).toHaveAttribute("rel", "noreferrer");

    // The Clear button appears once a conversation exists
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
  });

  it("shows the friendly fallback message when the network fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    render(<AiChat languageCode="en" />);
    fireEvent.click(screen.getByRole("button", { name: "How do I apply?" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("AI assistance is temporarily unavailable");
    expect(alert).toHaveTextContent("verified service information");

    // The raw network error must not leak
    expect(alert).not.toHaveTextContent("Failed to fetch");

    // Dismiss removes the alert
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("surfaces the sanitized server error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({
          error: "Too many requests. Please wait a moment and try again.",
          code: "RATE_LIMIT",
        }),
      })
    );

    render(<AiChat languageCode="en" />);
    fireEvent.click(screen.getByRole("button", { name: "What is the fee?" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Too many requests");
    // Never expose internal error codes/details
    expect(alert).not.toHaveTextContent("RATE_LIMIT");
    expect(alert).not.toHaveTextContent("Gemini");
  });

  it("disables Send while empty, sends typed input, and renders the exchange", async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    const fetchMock = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<AiChat languageCode="en" />);

    const sendButton = screen.getByRole("button", { name: "Send" });
    expect(sendButton).toBeDisabled();

    const input = screen.getByLabelText("Ask a question");
    fireEvent.change(input, { target: { value: "What is the fee?" } });
    expect(sendButton).toBeEnabled();

    fireEvent.click(sendButton);

    // User message appears immediately; input clears; input disabled while loading
    expect(screen.getByText("What is the fee?")).toBeInTheDocument();
    expect(input).toHaveValue("");
    expect(input).toBeDisabled();

    resolveFetch(okAiResponse());
    await waitFor(() =>
      expect(screen.getByText(/identity document and proof of address/)).toBeInTheDocument()
    );

    // Clear resets back to the empty state (suggestions return inside the log;
    // the user message bubble — a <p> element — is gone)
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByText("Ask a question about government services")).toBeInTheDocument();
    expect(
      screen.queryByText("What is the fee?", { selector: "p" })
    ).not.toBeInTheDocument();
  });

  it("renders the clarification question when the assistant needs it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        okAiResponse({
          answer: "",
          needs_clarification: true,
          clarification_question: "Which state are you applying in?",
        })
      )
    );

    render(<AiChat languageCode="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Where do I apply?" }));

    expect(
      await screen.findByText("Which state are you applying in?")
    ).toBeInTheDocument();
  });

  it("uses custom initial suggestions when provided", () => {
    render(
      <AiChat
        languageCode="en"
        initialSuggestions={["Show me passport services"]}
      />
    );
    expect(
      screen.getByRole("button", { name: "Show me passport services" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "What documents do I need?" })
    ).not.toBeInTheDocument();
  });
});
