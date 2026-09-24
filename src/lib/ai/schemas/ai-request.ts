import { z } from "zod";

export const UserMessageSchema = z.object({
  // Rejects empty and whitespace-only questions, capped at 2000 characters
  question: z
    .string()
    .max(2000)
    .refine((value) => value.trim().length > 0, {
      message: "Question must not be empty",
    }),
  language_code: z.string().optional(),
  service_id: z.string().optional(),
  state_code: z.string().optional(),
  conversation_history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ).optional(),
});

export type UserMessage = z.infer<typeof UserMessageSchema>;

export const AiRequestSchema = z.object({
  message: UserMessageSchema,
  user_id: z.string().optional(),
  // Server-derived client identifier (e.g. IP address) used only for rate
  // limiting. Populated by the API route, not trusted from arbitrary input.
  identifier: z.string().max(128).optional(),
  is_authenticated: z.boolean().default(false),
});

export type AiRequest = z.infer<typeof AiRequestSchema>;

export const AiErrorSchema = z.object({
  error: z.string(),
  code: z.enum(["INVALID_REQUEST", "SERVICE_UNAVAILABLE", "RATE_LIMIT", "DATABASE_ERROR", "AI_ERROR", "VALIDATION_ERROR"]),
  fallback_info: z.record(z.string(), z.string()).optional(),
});

export type AiError = z.infer<typeof AiErrorSchema>;

export type AiUsage = {
  tokens_used: number;
  provider: string;
  latency_ms: number;
};
