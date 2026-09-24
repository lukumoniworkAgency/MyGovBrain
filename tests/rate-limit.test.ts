import { afterEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit } from "@/lib/ai/ai-service";

afterEach(() => {
  vi.useRealTimers();
});

describe("checkRateLimit", () => {
  it("allows anonymous requests up to the anonymous limit, then blocks", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const id = "rate-anon-basic";

    for (let i = 0; i < 10; i++) {
      const result = await checkRateLimit(id, false);
      expect(result.allowed).toBe(true);
    }

    const blocked = await checkRateLimit(id, false);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("resets the window after 60 seconds", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T01:00:00Z"));
    const id = "rate-anon-window";

    for (let i = 0; i < 10; i++) {
      await checkRateLimit(id, false);
    }
    expect((await checkRateLimit(id, false)).allowed).toBe(false);

    // Advance past the window
    vi.setSystemTime(new Date("2026-01-01T01:01:01Z"));
    expect((await checkRateLimit(id, false)).allowed).toBe(true);
  });

  it("gives authenticated users a higher limit than anonymous users", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T02:00:00Z"));
    const id = "rate-auth-higher";

    // Anonymous would stop at 10; authenticated must go past that
    for (let i = 0; i < 10; i++) {
      expect((await checkRateLimit(id, true)).allowed).toBe(true);
    }

    // Keep going up to the authenticated limit (50)
    for (let i = 0; i < 40; i++) {
      expect((await checkRateLimit(id, true)).allowed).toBe(true);
    }

    expect((await checkRateLimit(id, true)).allowed).toBe(false);
  });

  it("tracks anonymous and authenticated counts separately", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T03:00:00Z"));
    const id = "rate-separate";

    for (let i = 0; i < 10; i++) {
      await checkRateLimit(id, false);
    }
    expect((await checkRateLimit(id, false)).allowed).toBe(false);

    // A different identifier is unaffected
    expect((await checkRateLimit("rate-separate-other", false)).allowed).toBe(true);
    // And the authenticated bucket for the same identifier is unaffected
    expect((await checkRateLimit(id, true)).allowed).toBe(true);
  });

  it("keeps identifiers independent", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T04:00:00Z"));

    for (let i = 0; i < 10; i++) {
      await checkRateLimit("rate-id-a", false);
    }
    expect((await checkRateLimit("rate-id-a", false)).allowed).toBe(false);
    expect((await checkRateLimit("rate-id-b", false)).allowed).toBe(true);
  });
});
