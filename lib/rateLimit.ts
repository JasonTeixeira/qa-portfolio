type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Simple in-memory fixed-window limiter.
 *
 * Notes:
 * - Works for a single Node process (local dev / single server).
 * - In production (multi-instance), swap to DynamoDB/Redis.
 */
export function rateLimitOrThrow(opts: {
  key: string;
  limit: number;
  windowMs: number;
}): void {
  const now = Date.now();
  const b = buckets.get(opts.key);

  if (!b || now >= b.resetAt) {
    buckets.set(opts.key, { count: 1, resetAt: now + opts.windowMs });
    return;
  }

  if (b.count >= opts.limit) {
    const seconds = Math.ceil((b.resetAt - now) / 1000);
    throw new Error(`Rate limit exceeded. Try again in ${seconds}s.`);
  }

  b.count += 1;
}
