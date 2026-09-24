// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AiAssistant } from "@/components/ai-assistant";

afterEach(() => {
  cleanup();
});

describe("AiAssistant", () => {
  it("floating variant: opens and closes the chat from an accessible button", () => {
    render(<AiAssistant languageCode="en" variant="floating" />);

    // Closed state: floating entry point
    const openButton = screen.getByRole("button", { name: "Open AI assistant" });
    expect(openButton).toHaveTextContent("Ask GovGuide AI");
    expect(screen.queryByText("Ask a question about government services")).not.toBeInTheDocument();

    // Open state: chat panel appears
    fireEvent.click(openButton);
    expect(screen.getByText("Ask a question about government services")).toBeInTheDocument();
    expect(screen.getByLabelText("Ask a question")).toBeInTheDocument();

    // Close returns to the floating button
    fireEvent.click(screen.getByRole("button", { name: "Close AI assistant" }));
    expect(screen.queryByText("Ask a question about government services")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open AI assistant" })).toBeInTheDocument();
  });

  it("inline variant: renders the chat directly without a floating button", () => {
    render(<AiAssistant languageCode="en" variant="inline" />);

    expect(screen.getByText("Ask a question about government services")).toBeInTheDocument();
    expect(screen.getByLabelText("Ask a question")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Open AI assistant" })
    ).not.toBeInTheDocument();
  });

  it("forwards service context to the chat", async () => {
    render(
      <AiAssistant
        languageCode="en"
        variant="inline"
        serviceId="income-certificate"
        stateCode="assam"
        initialSuggestions={["What documents do I need?"]}
      />
    );

    expect(
      screen.getByRole("button", { name: "What documents do I need?" })
    ).toBeInTheDocument();
  });
});
