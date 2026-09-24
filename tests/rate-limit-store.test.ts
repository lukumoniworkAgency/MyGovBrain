import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MemoryRateLimitStore,
  UpstashRateLimitStore,
  getRateLimitStore,
  resetRateLimitStoreForTests,
} from "@/lib/ai/rate-limit-store";
import { checkRateLimit } from "@/lib/ai/ai-service";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  resetRateLimitStoreForTests();
});

describe("MemoryRateLimitStore", () => {
  it("counts hits inside a window and restarts after it expires", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-01T00:00:00Z"));
    const store = new MemoryRateLimitStore();

    const first = await store.increment("mem-1", 60_000);
    expect(first.count).toBe(1);
    expect(first.resetAt).toBe(Date.now() + 60_000);

    const second = await store.increment("mem-1", 60_000);
    expect(second.count).toBe(2);
    expect(second.resetAt).toBe(first.resetAt);

    vi.setSystemTime(new Date("2026-02-01T00:01:01Z"));
    const afterWindow = await store.increment("mem-1", 60_000);
    expect(afterWindow.count).toBe(1);
  });

  it("keeps keys independent", async () => {
    const store = new MemoryRateLimitStore();
    await store.increment("key-a", 60_000);
    await store.increment("key-a", 60_000);
    const other = await store.increment("key-b", 60_000);
    expect(other.count).toBe(1);
  });
});

describe("UpstashRateLimitStore", () => {
  it("runs batched INCR/PTTL and attaches an expiry on the first hit", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ result: "1" }, { result: "-2" }],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ result: "OK" }] });
    vi.stubGlobal("fetch", fetchMock);

    const store = new UpstashRateLimitStore("https://example.upstash.io", "test-token");
    const before = Date.now();
    const hit = await store.increment("k", 60_000);

    expect(hit.count).toBe(1);
    expect(hit.resetAt).toBeGreaterThanOrEqual(before + 60_000);
    expect(hit.resetAt).toBeLessThanOrEqual(Date.now() + 60_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [incrUrl, incrInit] = fetchMock.mock.calls[0];
    expect(incrUrl).toBe("https://example.upstash.io");
    expect(JSON.parse(incrInit.body)).toEqual([["INCR", "k"], ["PTTL", "k"]]);
    expect(incrInit.headers.authorization).toBe("Bearer test-token");

    const [, expireInit] = fetchMock.mock.calls[1];
    expect(JSON.parse(expireInit.body)).toEqual([["PEXPIRE", "k", "60000"]]);
  });

  it("does not reset the expiry while the TTL is still present", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [{ result: "7" }, { result: "45000" }],
    });
    vi.stubGlobal("fetch", fetchMock);

    const store = new UpstashRateLimitStore("https://example.upstash.io", "t");
    const hit = await store.increment("k", 60_000);

    expect(hit.count).toBe(7);
    expect(hit.resetAt).toBe(Date.now() + 45_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws when Upstash responds with an error status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false, status: 500 }));
    const store = new UpstashRateLimitStore("https://example.upstash.io", "t");
    await expect(store.increment("k", 60_000)).rejects.toThrow("Upstash");
  });
});

describe("getRateLimitStore", () => {
  it("returns the in-memory store when no credentials are configured", () => {
    expect(getRateLimitStore()).toBeInstanceOf(MemoryRateLimitStore);
  });

  it("returns the Upstash store when REST credentials are configured", () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    resetRateLimitStoreForTests();
    expect(getRateLimitStore()).toBeInstanceOf(UpstashRateLimitStore);
  });
});

describe("checkRateLimit with an unavailable store", () => {
  it("fails closed instead of granting unlimited access", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    resetRateLimitStoreForTests();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const result = await checkRateLimit("failing-store-ip", false);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
});
