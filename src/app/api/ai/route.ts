import { NextRequest, NextResponse } from "next/server";
import { detectIntent, generateAnswer } from "@/lib/ai/ai-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body?.message?.question?.trim()) {
      return NextResponse.json(
        { error: "Message is required", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Get client identifier (user_id) for rate limiting via the service layer
    const user_id = body.user_id as string | undefined;
    const is_authenticated = (body.is_authenticated as boolean) ?? false;

    // Server-derived identifier for rate limiting (IP for anonymous users)
    const clientIdentifier =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    // Detect intent first
    const intentResult = await detectIntent({
      message: body.message,
      user_id,
      identifier: clientIdentifier,
      is_authenticated,
    });

    // If clarification is needed, return immediately
    if (intentResult.intent.clarification_needed) {
      return NextResponse.json({
        response: {
          intent: intentResult.intent.intent,
          language: intentResult.intent.language,
          service_id: null,
          answer: "",
          eligibility: [],
          required_documents: [],
          next_steps: [],
          official_sources: [],
          needs_clarification: true,
          clarification_question: intentResult.intent.clarification_question ?? null,
        },
        usage: intentResult.usage,
        needs_clarification: true,
      });
    }

    // Generate full answer
    const answerResult = await generateAnswer({
      message: {
        question: body.message.question,
        language_code: body.message.language_code,
        service_id: body.message.service_id,
        state_code: body.message.state_code,
        conversation_history: body.message.conversation_history,
      },
      user_id,
      identifier: clientIdentifier,
      is_authenticated,
    });

    return NextResponse.json({
      response: answerResult.response,
      usage: answerResult.usage,
      needs_clarification: false,
    });
  } catch (error) {
    console.error("AI API error:", error);

    const errorCode = (error as { code?: string })?.code ?? "AI_ERROR";

    // Don't expose internal errors to client
    return NextResponse.json(
      {
        error:
          errorCode === "RATE_LIMIT"
            ? "Too many requests. Please wait a moment and try again."
            : "AI service is temporarily unavailable. You can still browse our service directory for verified information.",
        code: errorCode === "RATE_LIMIT" ? "RATE_LIMIT" : "SERVICE_UNAVAILABLE",
      },
      { status: errorCode === "VALIDATION_ERROR" ? 400 : errorCode === "RATE_LIMIT" ? 429 : 503 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed", code: "VALIDATION_ERROR" },
    { status: 405 }
  );
}
