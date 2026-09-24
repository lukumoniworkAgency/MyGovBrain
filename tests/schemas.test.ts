import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  AssistantResponseSchema,
  IntentResponseSchema,
} from "@/lib/ai/schemas/assistant-response";
import { AiRequestSchema, UserMessageSchema } from "@/lib/ai/schemas/ai-request";

describe("AssistantResponseSchema", () => {
  const validResponse = {
    intent: "document_question" as const,
    language: "en",
    service_id: "income-certificate",
    answer: "You need an identity document and proof of address.",
    eligibility: ["Residents of the state"],
    required_documents: ["Aadhaar card", "Proof of address"],
    next_steps: ["Apply online at the official portal"],
    official_sources: [
      { title: "Official Government Website", url: "https://example.gov.in" },
    ],
    needs_clarification: false,
    clarification_question: null,
  };

  it("accepts a valid response and applies array defaults", () => {
    const parsed = AssistantResponseSchema.parse(validResponse);
    expect(parsed.answer).toBe(validResponse.answer);
    expect(parsed.required_documents).toHaveLength(2);
    expect(parsed.official_sources[0].url).toContain("https://");
  });

  it("applies defaults when optional arrays are omitted", () => {
    const parsed = AssistantResponseSchema.parse({
      ...validResponse,
      eligibility: undefined,
      required_documents: undefined,
      next_steps: undefined,
      official_sources: undefined,
    });
    expect(parsed.eligibility).toEqual([]);
    expect(parsed.required_documents).toEqual([]);
    expect(parsed.next_steps).toEqual([]);
    expect(parsed.official_sources).toEqual([]);
  });

  it("rejects an unknown intent value", () => {
    expect(() =>
      AssistantResponseSchema.parse({ ...validResponse, intent: "made_up_intent" })
    ).toThrow(z.ZodError);
  });

  it("rejects a missing answer", () => {
    const withoutAnswer: Record<string, unknown> = { ...validResponse };
    delete withoutAnswer.answer;
    expect(() => AssistantResponseSchema.parse(withoutAnswer)).toThrow(z.ZodError);
  });

  it("rejects a non-http official source url", () => {
    expect(() =>
      AssistantResponseSchema.parse({
        ...validResponse,
        official_sources: [{ title: "Bad", url: "not-a-url" }],
      })
    ).toThrow(z.ZodError);
  });

  it("rejects a missing clarification_question field", () => {
    const rest: Record<string, unknown> = { ...validResponse };
    delete rest.clarification_question;
    expect(() => AssistantResponseSchema.parse(rest)).toThrow(z.ZodError);
  });
});

describe("IntentResponseSchema", () => {
  it("accepts a valid intent response", () => {
    const parsed = IntentResponseSchema.parse({
      intent: "service_search",
      language: "hi",
      confidence: 0.9,
      service_keyword: "income certificate",
      state_keyword: "assam",
      clarification_needed: false,
      clarification_question: null,
    });
    expect(parsed.intent).toBe("service_search");
  });

  it("accepts nullable and omitted keyword fields", () => {
    const parsed = IntentResponseSchema.parse({
      intent: "general_guidance",
      language: "as",
      confidence: 0.5,
      clarification_needed: true,
      clarification_question: "Which state are you applying in?",
    });
    expect(parsed.service_keyword).toBeUndefined();
    expect(parsed.language).toBe("as");
  });

  it("rejects a confidence score outside 0..1", () => {
    expect(() =>
      IntentResponseSchema.parse({
        intent: "unknown",
        language: "en",
        confidence: 1.5,
        clarification_needed: false,
      })
    ).toThrow(z.ZodError);
  });

  it("rejects an unknown intent", () => {
    expect(() =>
      IntentResponseSchema.parse({
        intent: "chitchat",
        language: "en",
        confidence: 0.5,
        clarification_needed: false,
      })
    ).toThrow(z.ZodError);
  });
});

describe("AiRequestSchema / UserMessageSchema", () => {
  it("accepts a minimal valid request with defaults", () => {
    const parsed = AiRequestSchema.parse({
      message: { question: "What documents do I need?" },
    });
    expect(parsed.is_authenticated).toBe(false);
    expect(parsed.message.language_code).toBeUndefined();
  });

  it("accepts a full request with service context", () => {
    const parsed = AiRequestSchema.parse({
      message: {
        question: "मुझे आय प्रमाण पत्र चाहिए।",
        language_code: "hi",
        service_id: "income-certificate",
        state_code: "assam",
        conversation_history: [{ role: "user", content: "Hello" }],
      },
      user_id: "user-123",
      identifier: "203.0.113.7",
      is_authenticated: true,
    });
    expect(parsed.identifier).toBe("203.0.113.7");
    expect(parsed.is_authenticated).toBe(true);
  });

  it("rejects an empty question", () => {
    expect(() =>
      UserMessageSchema.parse({ question: "   " })
    ).toThrow(z.ZodError);
    expect(() => UserMessageSchema.parse({ question: "" })).toThrow(z.ZodError);
  });

  it("rejects a question longer than 2000 characters", () => {
    expect(() =>
      UserMessageSchema.parse({ question: "a".repeat(2001) })
    ).toThrow(z.ZodError);
  });

  it("rejects invalid conversation roles", () => {
    expect(() =>
      UserMessageSchema.parse({
        question: "Hi",
        conversation_history: [{ role: "system", content: "x" }],
      })
    ).toThrow(z.ZodError);
  });

  it("rejects an identifier longer than 128 characters", () => {
    expect(() =>
      AiRequestSchema.parse({
        message: { question: "Hi" },
        identifier: "x".repeat(129),
      })
    ).toThrow(z.ZodError);
  });
});
