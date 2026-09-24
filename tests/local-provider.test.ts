import { describe, expect, it } from "vitest";
import {
  AssistantResponseSchema,
  IntentResponseSchema,
} from "@/lib/ai/schemas/assistant-response";
import { LocalProvider } from "@/lib/ai/providers/local";

const serviceContext = [
  "SERVICE: Income Certificate (আয়ৰ প্ৰমাণপত্ৰ)",
  "DESCRIPTION: A certificate proving the income of a person or family.",
  "ELIGIBILITY: Residents of the state whose annual family income is below the notified limit.",
  "DOCUMENTS: Identity proof (Aadhaar), Proof of address, Income declaration.",
  "APPLY: Submit the online application, attach documents, and visit the designated authority for verification.",
  "Source: https://example.gov.in/income-certificate",
].join("\n");

describe("LocalProvider", () => {
  const provider = new LocalProvider();

  it("detectIntent returns a schema-valid result", async () => {
    const result = await provider.detectIntent("What documents do I need?");
    const parsed = IntentResponseSchema.parse(result);
    expect(parsed.confidence).toBeGreaterThanOrEqual(0);
    expect(parsed.confidence).toBeLessThanOrEqual(1);
  });

  it("generateAnswer without context returns the no-verification fallback", async () => {
    const result = await provider.generateAnswer("What is the fee?", "", "en");
    const parsed = AssistantResponseSchema.parse(result);
    expect(parsed.answer).toContain(
      "couldn't verify this information from the available official sources"
    );
    expect(parsed.required_documents).toEqual([]);
    expect(parsed.official_sources).toEqual([]);
    expect(parsed.needs_clarification).toBe(false);
  });

  it("generateAnswer with service context returns a schema-valid structured response", async () => {
    const result = await provider.generateAnswer(
      "What documents do I need for the income certificate?",
      serviceContext,
      "en"
    );
    const parsed = AssistantResponseSchema.parse(result);
    expect(parsed.answer.length).toBeGreaterThan(0);
    expect(parsed.intent).toBe("service_information");
    // Document/eligibility/step lines should be extracted from context
    expect(parsed.required_documents.length).toBeGreaterThan(0);
    expect(parsed.eligibility.length).toBeGreaterThan(0);
    expect(parsed.next_steps.length).toBeGreaterThan(0);
  });

  it("returns a Hindi answer when language is hi", async () => {
    const result = await provider.generateAnswer(
      "आय प्रमाण पत्र के दस्तावेज़",
      serviceContext,
      "hi"
    );
    const parsed = AssistantResponseSchema.parse(result);
    expect(parsed.language).toBe("hi");
    expect(parsed.answer).toMatch(/[ऀ-ॿ]/); // Devanagari script
  });

  it("returns an Assamese answer when language is as", async () => {
    const result = await provider.generateAnswer(
      "আয়ৰ প্ৰমাণপত্ৰৰ নথি",
      serviceContext,
      "as"
    );
    const parsed = AssistantResponseSchema.parse(result);
    expect(parsed.language).toBe("as");
    expect(parsed.answer).toMatch(/[ঀ-৿]/); // Bengali/Assamese script
  });

  it("generateStructuredResponse delegates to generateAnswer with options", async () => {
    const result = await provider.generateStructuredResponse(
      "How do I apply?",
      serviceContext,
      { language: "en", serviceId: "income-certificate" }
    );
    const parsed = AssistantResponseSchema.parse(result);
    expect(parsed.answer.length).toBeGreaterThan(0);
  });
});
