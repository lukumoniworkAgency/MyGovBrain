// Pluggable rate-limit store for AI requests.
//
// Default: in-memory store (fine for a single server instance / development).
// Production: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to use an
// Upstash Redis (REST) store — no SDK required, requests go through server-side
// fetch only, so credentials never reach the browser.

export interface RateLimitHit {
  count: number;
  resetAt: number;
}

export interface RateLimitStore {
  /** Increment the counter for `key` within the rolling window and return the
   * current count and the timestamp at which the window resets. */
  increment(key: string, windowMs: number): Promise<RateLimitHit>;
}

/** In-memory fixed-window counter. Not suitable for multi-instance
 * deployments — use UpstashRateLimitStore there instead. */
export class MemoryRateLimitStore implements RateLimitStore {
  private buckets = new Map<string, { count: number; resetAt: number }>();

  async increment(key: string, windowMs: number): Promise<RateLimitHit> {
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      const resetAt = now + windowMs;
      this.buckets.set(key, { count: 1, resetAt });
      return { count: 1, resetAt };
    }

    bucket.count += 1;
    return { count: bucket.count, resetAt: bucket.resetAt };
  }
}

/** Upstash Redis REST API store (https://upstash.com/docs/redis/rest/gettingstarted).
 * Works with any Upstash Redis database using batched INCR/PTTL commands. */
export class UpstashRateLimitStore implements RateLimitStore {
  constructor(
    private readonly url: string,
    private readonly token: string
  ) {}

  private async run(commands: unknown[][]): Promise<unknown[]> {
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(commands),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Upstash rate-limit store request failed: ${response.status}`);
    }

    const data = (await response.json()) as { result: unknown }[];
    return data.map((entry) => entry.result);
  }

  async increment(key: string, windowMs: number): Promise<RateLimitHit> {
    const [countResult, ttlResult] = (await this.run([
      ["INCR", key],
      ["PTTL", key],
    ])) as [string | number, string | number];

    let count = Number(countResult);
    let ttl = Number(ttlResult);

    if (!Number.isFinite(count) || count < 1) {
      count = 1;
    }

    // PTTL returns -2 (missing key) or -1 (key without expiry). In both cases
    // this is the first hit of the window, so attach the expiry.
    if (ttl < 0) {
      await this.run([["PEXPIRE", key, String(windowMs)]]);
      ttl = windowMs;
    }

    return { count, resetAt: Date.now() + ttl };
  }
}

let storeInstance: RateLimitStore | null = null;

/** Returns the configured store: Upstash when REST credentials exist in the
 * environment, otherwise the in-memory fallback. */
export function getRateLimitStore(): RateLimitStore {
  if (!storeInstance) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    storeInstance =
      url && token ? new UpstashRateLimitStore(url, token) : new MemoryRateLimitStore();
  }
  return storeInstance;
}

/** Test-only helper: forget the cached store so factory selection can be
 * re-evaluated (e.g. after changing environment variables). */
export function resetRateLimitStoreForTests(): void {
  storeInstance = null;
}
