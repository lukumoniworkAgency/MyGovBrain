import { describe, expect, it } from "vitest";
import type { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/ai/route";

function makePostRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new Request("http://localhost/api/ai", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("GET /api/ai", () => {
  it("rejects GET with 405", async () => {
    const res = await GET();
    expect(res.status).toBe(405);
    const data = await res.json();
    expect(data.code).toBe("VALIDATION_ERROR");
  });
});

describe("POST /api/ai request validation", () => {
  it("returns 400 when message.question is missing", async () => {
    const res = await POST(makePostRequest({ message: {} }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when message is missing entirely", async () => {
    const res = await POST(makePostRequest({ user_id: "u1" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when question is only whitespace", async () => {
    const res = await POST(makePostRequest({ message: { question: "   " } }));
    expect(res.status).toBe(400);
  });

  it("returns a sanitized 503 for malformed JSON without leaking internals", async () => {
    const res = await POST(makePostRequest("{not json"));
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.code).toBe("SERVICE_UNAVAILABLE");
    // The raw parsing error must not be exposed to the client
    expect(data.error).not.toContain("JSON");
    expect(data.error).not.toContain("SyntaxError");
    expect(data.error).toContain("AI service is temporarily unavailable");
  });

  // NOTE: the rate-limit identity is derived from x-forwarded-for / x-real-ip
  // headers (never from the request body). This is covered deterministically by
  // tests/rate-limit.test.ts instead of a slow, costly live AI call here.
});
