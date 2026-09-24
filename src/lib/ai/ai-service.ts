import { GeminiProvider } from "./providers/gemini";
import { LocalProvider } from "./providers/local";
import { AssistantResponseSchema, type AssistantResponse } from "./schemas/assistant-response";
import { AiRequestSchema } from "./schemas/ai-request";
import { getService, getServices, getCategories, selectTranslation } from "@/lib/data";
import { getRateLimitStore } from "./rate-limit-store";

// Provider instances (singletons)
let geminiProvider: GeminiProvider | null = null;
let localProvider: LocalProvider | null = null;

function getGeminiProvider(): GeminiProvider {
  if (!geminiProvider) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    geminiProvider = new GeminiProvider({ apiKey });
  }
  return geminiProvider;
}

function getLocalProvider(): LocalProvider {
  if (!localProvider) {
    localProvider = new LocalProvider();
  }
  return localProvider;
}

// Rate limits are backed by a pluggable store (in-memory by default,
// Upstash Redis REST when UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN are
// configured). See ./rate-limit-store.ts.
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const ANONYMOUS_RATE_LIMIT = 10;
const AUTHENTICATED_RATE_LIMIT = 50;

export async function checkRateLimit(
  identifier: string,
  isAuthenticated: boolean
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const limit = isAuthenticated ? AUTHENTICATED_RATE_LIMIT : ANONYMOUS_RATE_LIMIT;
  const key = `ailimit:${identifier}:${isAuthenticated ? "auth" : "anon"}`;

  try {
    const { count, resetAt } = await getRateLimitStore().increment(key, RATE_LIMIT_WINDOW_MS);

    if (count > limit) {
      return { allowed: false, remaining: 0, resetAt };
    }
    return { allowed: true, remaining: limit - count, resetAt };
  } catch {
    // Fail closed: if the backing store is unavailable we must not grant
    // unlimited anonymous AI access.
    return {
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + RATE_LIMIT_WINDOW_MS,
    };
  }
}


async function buildContext(request: { message: { service_id?: string; state_code?: string; question: string; language_code?: string } }): Promise<string> {
  const parts: string[] = [];

  if (request.message.service_id) {
    const service = await getService(request.message.state_code ?? "", request.message.service_id);
    if (service.data) {
      const { translation } = selectTranslation(service.data.translations, request.message.language_code ?? "en");
      parts.push(`SERVICE: ${translation?.name ?? service.data.slug}`);
      if (translation) {
        parts.push(`DESCRIPTION: ${translation.short_description ?? ""}`);
        if (translation.full_description) parts.push(`FULL DESCRIPTION: ${translation.full_description}`);
        parts.push(`HOW TO APPLY: ${translation.how_to_apply_text ?? ""}`);
        parts.push(`ELIGIBILITY: ${translation.eligibility_text ?? ""}`);
      }
      if (service.data.documents?.length) {
        parts.push(`REQUIRED DOCUMENTS: ${service.data.documents.map((d: { name: string }) => d.name).join(", ")}`);
      }
      if (service.data.sources?.length) {
        parts.push(
          `OFFICIAL SOURCES (only these URLs may be cited): ${service.data.sources
            .map((s: { source_title: string; source_url: string }) => `${s.source_title} — ${s.source_url}`)
            .join("; ")}`
        );
      }
    } else {
      parts.push("SERVICE NOT FOUND IN DATABASE for the given state/service.");
    }
  } else {
    const services = await getServices({ query: request.message.question });
    if (services.data.length) {
      parts.push(`POTENTIALLY RELEVANT SERVICES: ${services.data.slice(0, 5).map((s: { slug: string; translations: { name: string }[] }) => `${s.translations?.[0]?.name ?? s.slug} (${s.slug})`).join(", ")}`);
    }
    const categories = await getCategories();
    if (categories.data.length) {
      parts.push(`AVAILABLE CATEGORIES: ${categories.data.map((c: { name: string }) => c.name).join(", ")}`);
    }
  }

  if (!parts.length) {
    parts.push("NO VERIFIED DATABASE CONTEXT AVAILABLE.");
  }

  return parts.join("\n\n");
}

export async function detectIntent(
  request: { message: { question: string; language_code?: string; service_id?: string; state_code?: string }; user_id?: string; identifier?: string; is_authenticated: boolean }
): Promise<{ intent: { intent: string; language: string; confidence: number; service_keyword: string | null; state_keyword: string | null; clarification_needed: boolean; clarification_question: string | null }; usage: { tokens_used: number; provider: string; latency_ms: number } }> {
  const validated = AiRequestSchema.parse(request);
  const identifier = validated.identifier ?? validated.user_id ?? "anonymous";

  const rateLimit = await checkRateLimit(identifier, validated.is_authenticated);
  if (!rateLimit.allowed) {
    throw { error: "Too many requests. Please try again later.", code: "RATE_LIMIT" };
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;

  try {
    const provider = geminiApiKey ? getGeminiProvider() : getLocalProvider();
    let context = "";
    if (validated.message.service_id) {
      const service = await getService(validated.message.state_code ?? "", validated.message.service_id);
      if (service.data) {
        const { translation } = selectTranslation(service.data.translations, validated.message.language_code ?? "en");
        context = JSON.stringify({
          name: translation?.name ?? service.data.slug,
          description: translation?.short_description ?? "",
          how_to_apply: translation?.how_to_apply_text ?? "",
          eligibility: translation?.eligibility_text ?? "",
        });
      }
    }
    const result = await provider.detectIntent(validated.message.question, context || undefined);
    return {
      intent: {
        ...result,
        service_keyword: result.service_keyword ?? null,
        state_keyword: result.state_keyword ?? null,
        clarification_question: result.clarification_question ?? null,
      },
      usage: { tokens_used: 0, provider: geminiApiKey ? "gemini" : "local", latency_ms: 0 },
    };
  } catch (error) {
    // Fall back to the local provider on ANY provider failure (retired model,
    // network error, quota, invalid key) so the API keeps working and the user
    // still gets verified database-backed information.
    console.error("detectIntent provider error, falling back to local:", error);
    try {
      const provider = getLocalProvider();
      const result = await provider.detectIntent(validated.message.question);
      return {
        intent: {
          ...result,
          service_keyword: result.service_keyword ?? null,
          state_keyword: result.state_keyword ?? null,
          clarification_question: result.clarification_question ?? null,
        },
        usage: { tokens_used: 0, provider: "local", latency_ms: 0 },
      };
    } catch {
      throw { error: "Intent detection is temporarily unavailable", code: "SERVICE_UNAVAILABLE" };
    }
  }
}

export async function generateAnswer(
  request: { message: { question: string; language_code?: string; service_id?: string; state_code?: string; conversation_history?: { role: string; content: string }[] }; user_id?: string; identifier?: string; is_authenticated: boolean }
): Promise<{ response: { intent: string; language: string; service_id: string | null; answer: string; eligibility: string[]; required_documents: string[]; next_steps: string[]; official_sources: { title: string; url: string }[]; needs_clarification: boolean; clarification_question: string | null }; usage: { tokens_used: number; provider: string; latency_ms: number } }> {
  const validated = AiRequestSchema.parse(request);
  const identifier = validated.identifier ?? validated.user_id ?? "anonymous";

  const rateLimit = await checkRateLimit(identifier, validated.is_authenticated);
  if (!rateLimit.allowed) {
    throw { error: "Too many requests. Please try again later.", code: "RATE_LIMIT" };
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;

  try {
    const provider = geminiApiKey ? getGeminiProvider() : getLocalProvider();
    const context = await buildContext(validated);
    const result = await provider.generateAnswer(validated.message.question, context, validated.message.language_code ?? "en");
    // Validate the provider output before returning it to the application
    const response = AssistantResponseSchema.parse(result) as AssistantResponse;
    return { response, usage: { tokens_used: 0, provider: geminiApiKey ? "gemini" : "local", latency_ms: 0 } };
  } catch (error) {
    // AI failure fallback: never surface provider errors to users. Return a
    // local, database-grounded answer instead (website stays useful w/o AI).
    console.error("generateAnswer provider error, falling back to local:", error);
    try {
      const provider = getLocalProvider();
      const context = await buildContext(validated);
      const result = await provider.generateAnswer(validated.message.question, context, validated.message.language_code ?? "en");
      const response = AssistantResponseSchema.parse(result) as AssistantResponse;
      return { response, usage: { tokens_used: 0, provider: "local", latency_ms: 0 } };
    } catch (fallbackError) {
      console.error("Local provider fallback failed:", fallbackError);
      throw { error: "AI service is temporarily unavailable. You can still browse our service directory.", code: "SERVICE_UNAVAILABLE" };
    }
  }
}
