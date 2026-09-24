import { GoogleGenerativeAI } from "@google/generative-ai";
import { AssistantResponseSchema, type AssistantResponse } from "../schemas/assistant-response";
import { IntentResponseSchema, type IntentResponse } from "../schemas/assistant-response";

interface GeminiProviderOptions {
  apiKey: string;
  model?: string;
}

export class GeminiProvider {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(options: GeminiProviderOptions) {
    this.genAI = new GoogleGenerativeAI(options.apiKey);
    // Overridable via GEMINI_MODEL. Older models (gemini-1.5-flash,
    // gemini-2.5-flash) now return 404 for new API keys, so default to the
    // model Google currently recommends for this key generation.
    this.model = options.model ?? process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
  }

  async detectIntent(userMessage: string, context?: string): Promise<IntentResponse> {
    const prompt = `You are a government services assistant for Indian citizens. Analyze the following user message and determine their intent.

User message: "${userMessage}"
${context ? `Context: ${context}` : ""}

Determine:
1. What the user is asking about (intent)
2. What language they are using
3. Any specific service or state mentioned
4. Whether you need more information (clarification_needed)
5. Your confidence level (0-1)

Return ONLY a valid JSON object with this exact structure:
{
  "intent": "one of: service_search, service_information, eligibility_question, document_question, application_steps, fee_question, official_source_request, faq_question, general_guidance, unknown",
  "language": "en|hi|as|other",
  "confidence": 0.0-1.0,
  "service_keyword": "specific service name if mentioned, otherwise null",
  "state_keyword": "state name if mentioned, otherwise null",
  "clarification_needed": true|false,
  "clarification_question": "question to ask if clarification needed, otherwise null"
}

Example for "Mujhe income certificate chahiye":
{"intent":"service_search","language":"hi","confidence":0.95,"service_keyword":"income certificate","state_keyword":null,"clarification_needed":false,"clarification_question":null}

Example for "What documents do I need?":
{"intent":"document_question","language":"en","confidence":0.85,"service_keyword":null,"state_keyword":null,"clarification_needed":true,"clarification_question":"Which state are you applying in?"}

Respond with ONLY the JSON object, no other text.`;

    const result = await this.genAI.getGenerativeModel({ model: this.model }).generateContent(prompt);
    const response = result.response?.text() ?? "{}";

    try {
      return IntentResponseSchema.parse(JSON.parse(response));
    } catch {
      return {
        intent: "unknown",
        language: "en",
        confidence: 0,
        clarification_needed: false,
        clarification_question: null,
      };
    }
  }

  async generateAnswer(
    userMessage: string,
    context: string,
    language: string = "en"
  ): Promise<AssistantResponse> {
    const prompt = `You are GovGuide AI, an independent guidance assistant for Indian government services. You help citizens understand and navigate verified government service information.

IMPORTANT RULES:
1. You MUST base your answer ONLY on the verified context provided below
2. If the context doesn't contain an answer, say: "I couldn't verify this information from the available official sources."
3. NEVER make up government information, fees, documents, or procedures
4. NEVER fabricate URLs or official source information
5. Keep responses short, clear, and easy to understand
6. For Hindi responses, respond in Hindi. For Assamese, respond in Assamese.
7. Use simple language suitable for all citizens
8. For Easy Mode users, use very short sentences and large text

CURRENT CONTEXT (VERIFIED INFORMATION):
${context}

USER QUESTION: "${userMessage}"

Please provide a helpful answer based ONLY on the verified context above. If information is missing, ask a clarifying question or indicate that the information is not available.

Return ONLY a valid JSON object with this exact structure:
{
  "intent": "service_information|eligibility_question|document_question|application_steps|fee_question|official_source_request|general_guidance|unknown",
  "language": "en|hi|as",
  "service_id": "service id from context or null",
  "answer": "Your answer in the user's language based only on verified context",
  "eligibility": ["eligibility requirement 1", "eligibility requirement 2"],
  "required_documents": ["document 1", "document 2"],
  "next_steps": ["step 1", "step 2"],
  "official_sources": [{"title": "Source title", "url": "https://..."}],
  "needs_clarification": false,
  "clarification_question": null
}

If clarification is needed:
{"needs_clarification": true, "clarification_question": "Please specify which state you are in."}

RESPOND WITH ONLY THE JSON OBJECT.`;

    const result = await this.genAI.getGenerativeModel({ model: this.model }).generateContent(prompt);
    const response = result.response?.text() ?? "{}";

    try {
      const parsed = JSON.parse(response);
      return AssistantResponseSchema.parse(parsed);
    } catch {
      // Fallback: return basic response
      return {
        intent: "unknown",
        language,
        service_id: null,
        answer: "I apologize, but I couldn't process your request properly. Please try rephrasing your question.",
        eligibility: [],
        required_documents: [],
        next_steps: [],
        official_sources: [],
        needs_clarification: false,
        clarification_question: null,
      };
    }
  }

  async generateStructuredResponse(
    userMessage: string,
    dbContext: string,
    options: { language?: string; serviceId?: string } = {}
  ): Promise<AssistantResponse> {
    return this.generateAnswer(userMessage, dbContext, options.language ?? "en");
  }
}
