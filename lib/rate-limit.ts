// Rate limiter for public POST endpoints.
//
// Uses a SHARED store (Upstash Redis via REST) when UPSTASH_REDIS_REST_URL +
// UPSTASH_REDIS_REST_TOKEN are set — giving one GLOBAL limit across every
// serverless instance (so an attacker can't multiply the limit by spreading
// requests across cold starts). When those env vars are absent (local dev, or
// before Upstash is connected) it falls back to a per-instance in-memory
// limiter. The call sites are identical either way — they just `await`.
//
// To activate the global limiter: connect Upstash Redis (Vercel Marketplace,
// one click) and set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

type Opts = { limit: number; windowMs: number; prefix?: string }

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number }

type HeaderLike = { get(name: string): string | null }

function clientIpFromHeaders(h: HeaderLike): string {
  const fwd = h.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (fwd) return fwd
  const real = h.get('x-real-ip')?.trim()
  if (real) return real
  return 'unknown'
}

function clientIp(req: NextRequest): string {
  return clientIpFromHeaders(req.headers)
}

// ---------------------------------------------------------------------------
// In-memory fallback (per-instance, sliding window). Used when Upstash is off.
// ---------------------------------------------------------------------------
type Bucket = { hits: number[]; lastSeen: number }
const MAX_IPS = 10_000
const buckets = new Map<string, Bucket>()

function evictIfFull() {
  if (buckets.size <= MAX_IPS) return
  let oldestKey: string | null = null
  let oldestTs = Infinity
  for (const [key, b] of buckets) {
    if (b.lastSeen < oldestTs) {
      oldestTs = b.lastSeen
      oldestKey = key
    }
  }
  if (oldestKey) buckets.delete(oldestKey)
}

function recordHitMemory(ip: string, opts: Opts): RateLimitResult {
  const now = Date.now()
  const key = opts.prefix ? `${opts.prefix}:${ip}` : ip
  const bucket = buckets.get(key)
  const fresh = (bucket?.hits ?? []).filter((ts) => now - ts < opts.windowMs)

  if (fresh.length >= opts.limit) {
    const oldest = fresh[0]
    const retryAfterSeconds = Math.max(1, Math.ceil((opts.windowMs - (now - oldest)) / 1000))
    buckets.set(key, { hits: fresh, lastSeen: now })
    return { ok: false, retryAfterSeconds }
  }

  fresh.push(now)
  buckets.set(key, { hits: fresh, lastSeen: now })
  evictIfFull()
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Upstash REST (global, fixed window). One pipelined round-trip per check.
// ---------------------------------------------------------------------------
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const upstashEnabled = Boolean(UPSTASH_URL && UPSTASH_TOKEN)

async function recordHitUpstash(ip: string, opts: Opts): Promise<RateLimitResult> {
  const key = `rl:${opts.prefix ?? 'global'}:${ip}`
  try {
    // INCR the counter; set the window expiry only on the first hit (PEXPIRE … NX);
    // read the remaining TTL for an accurate Retry-After. One pipelined request.
    const res = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['PEXPIRE', key, String(opts.windowMs), 'NX'],
        ['PTTL', key],
      ]),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`upstash ${res.status}`)
    const out = (await res.json()) as Array<{ result?: number }>
    const count = Number(out[0]?.result ?? 0)
    const pttl = Number(out[2]?.result ?? opts.windowMs)
    if (count > opts.limit) {
      const ms = pttl > 0 ? pttl : opts.windowMs
      return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil(ms / 1000)) }
    }
    return { ok: true }
  } catch (err) {
    // Never let a store outage take down the endpoint — degrade to in-memory.
    console.error('[rate-limit] upstash error; falling back to in-memory', err)
    return recordHitMemory(ip, opts)
  }
}

async function recordHit(ip: string, opts: Opts): Promise<RateLimitResult> {
  return upstashEnabled ? recordHitUpstash(ip, opts) : recordHitMemory(ip, opts)
}

export async function checkRateLimit(req: NextRequest, opts: Opts): Promise<RateLimitResult> {
  return recordHit(clientIp(req), opts)
}

/**
 * Variant for contexts where only the request headers are available
 * (server actions, route handlers that already consumed the request body).
 * Pass the awaited result of `headers()` (or any HeaderLike).
 */
export async function checkRateLimitFromHeaders(h: HeaderLike, opts: Opts): Promise<RateLimitResult> {
  return recordHit(clientIpFromHeaders(h), opts)
}

/**
 * Convenience wrapper: returns a 429 NextResponse with Retry-After when limited,
 * or null when the request should proceed.
 */
export async function rateLimit(req: NextRequest, opts: Opts): Promise<NextResponse | null> {
  const result = await checkRateLimit(req, opts)
  if (result.ok) return null
  return NextResponse.json(
    { error: 'Too many requests. Please try again shortly.' },
    { status: 429, headers: { 'Retry-After': String(result.retryAfterSeconds) } },
  )
}
