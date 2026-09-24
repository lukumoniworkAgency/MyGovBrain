import { type AssistantResponse } from "../schemas/assistant-response";

interface LocalProviderOptions {
  serviceContext?: string;
}

export class LocalProvider {
  private serviceContext: string;

  constructor(options: LocalProviderOptions = {}) {
    this.serviceContext = options.serviceContext ?? "";
  }

  async detectIntent(userMessage: string): Promise<{
    intent: "unknown";
    language: "en";
    confidence: number;
    service_keyword: string | null;
    state_keyword: string | null;
    clarification_needed: boolean;
    clarification_question: string | null;
  }> {
    // Local provider has no NLP, so it only reports whether there was input
    // at all. A real provider (Gemini) performs full intent detection.
    const hasInput = userMessage.trim().length > 0;
    return {
      intent: "unknown",
      language: "en",
      confidence: hasInput ? 0.3 : 0,
      service_keyword: null,
      state_keyword: null,
      clarification_needed: false,
      clarification_question: null,
    };
  }

  async generateAnswer(
    userMessage: string,
    context: string = this.serviceContext,
    language: string = "en"
  ): Promise<AssistantResponse> {
    // If context contains service information, use it
    if (context && context.length > 0) {
      return {
        intent: "service_information",
        language,
        service_id: null,
        answer: this.extractFromContext(context, userMessage, language),
        eligibility: this.extractSection(context, "eligibility"),
        required_documents: this.extractSection(context, "documents"),
        next_steps: this.extractSection(context, "apply"),
        official_sources: [],
        needs_clarification: false,
        clarification_question: null,
      };
    }

    // No context available
    return {
      intent: "unknown",
      language,
      service_id: null,
      answer: "I couldn't verify this information from the available official sources. Please try browsing our service directory for verified information.",
      eligibility: [],
      required_documents: [],
      next_steps: [],
      official_sources: [],
      needs_clarification: false,
      clarification_question: null,
    };
  }

  async generateStructuredResponse(
    userMessage: string,
    dbContext: string,
    options: { language?: string; serviceId?: string } = {}
  ): Promise<AssistantResponse> {
    return this.generateAnswer(userMessage, dbContext, options.language ?? "en");
  }

  private extractFromContext(context: string, query: string, language: string): string {
    const lowerContext = context.toLowerCase();
    const queryWords = query.toLowerCase().split(/\s+/).filter((word) => word.length > 3);

    // Consider the context relevant when it shares a meaningful word with the
    // query or clearly contains government-service information.
    const sharesWord = queryWords.some((word) => lowerContext.includes(word));
    if (sharesWord || lowerContext.includes("service") || lowerContext.includes("government")) {
      return this.formatAnswer(context, language);
    }

    return "I couldn't find specific information matching your request in the available sources.";
  }

  private extractSection(context: string, keyword: string): string[] {
    const sections: string[] = [];
    const lines = context.split("\n");

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes(keyword) && line.trim().length > 10) {
        sections.push(line.trim());
      }
    }

    return sections.slice(0, 5); // Limit to 5 items
  }

  private formatAnswer(context: string, language: string): string {
    if (language === "hi") {
      return "मेरे पास इस सेवा के बारे में कुछ जानकारी है। कृपया नीचे दी गई जानकारी देखें।";
    }
    if (language === "as") {
      return "আমি এই সেবা বিষয়ে কিছু তথ্য রয়েছে। দয়া করে নিচের তথ্যটি দেখুন।";
    }
    return "I have some information about this service. Please see the details below.";
  }
}
