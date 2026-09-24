import { z } from "zod";

export const IntentResponseSchema = z.object({
  intent: z.enum([
    "service_search",
    "service_information",
    "eligibility_question",
    "document_question",
    "application_steps",
    "fee_question",
    "official_source_request",
    "faq_question",
    "general_guidance",
    "unknown",
  ]),
  // Free-form language code so new languages never require a code change
  language: z.string(),
  confidence: z.number().min(0).max(1),
  service_keyword: z.string().nullable().optional(),
  state_keyword: z.string().nullable().optional(),
  clarification_needed: z.boolean(),
  clarification_question: z.string().nullable().optional(),
});

export type IntentResponse = z.infer<typeof IntentResponseSchema>;

export const AssistantResponseSchema = z.object({
  intent: z.enum([
    "service_search",
    "service_information",
    "eligibility_question",
    "document_question",
    "application_steps",
    "fee_question",
    "official_source_request",
    "faq_question",
    "general_guidance",
    "unknown",
  ]),
  // Free-form language code so new languages never require a code change
  language: z.string(),
  service_id: z.string().nullable(),
  answer: z.string(),
  eligibility: z.array(z.string()).default([]),
  required_documents: z.array(z.string()).default([]),
  next_steps: z.array(z.string()).default([]),
  official_sources: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
    })
  ).default([]),
  needs_clarification: z.boolean(),
  clarification_question: z.string().nullable(),
});

export type AssistantResponse = z.infer<typeof AssistantResponseSchema>;
