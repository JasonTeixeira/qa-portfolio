import crypto from 'node:crypto'

/**
 * Newsletter helpers — Resend-only, stateless double-opt-in.
 *
 * No database: the confirm link carries an HMAC-signed token ({email, source,
 * expiry}), so there's no "pending subscriber" row to store. On confirm we add
 * the address to a Resend Audience (if configured) — that audience IS the
 * subscriber list. One provider, one key.
 */

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidEmail(email: string): boolean {
  return !!email && email.length <= 320 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
}

/** Signing secret — prefer a dedicated var, fall back so tokens always sign. */
function secret(): string {
  return (
    process.env.NEWSLETTER_SECRET ||
    process.env.CRON_SECRET ||
    process.env.RESEND_API_KEY ||
    'dev-insecure-newsletter-secret'
  )
}

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

/** Sign a confirm/unsubscribe token — base64url(payload).base64url(hmac). */
export function signToken(email: string, source = ''): string {
  const payload = JSON.stringify({ e: normalizeEmail(email), s: source, x: Date.now() + TOKEN_TTL_MS })
  const b = Buffer.from(payload).toString('base64url')
  const sig = crypto.createHmac('sha256', secret()).update(b).digest('base64url')
  return `${b}.${sig}`
}

/** Verify a token; returns { email, source } or null (bad sig / expired / malformed). */
export function verifyToken(token: string): { email: string; source: string } | null {
  const [b, sig] = (token || '').split('.')
  if (!b || !sig) return null
  const expected = crypto.createHmac('sha256', secret()).update(b).digest('base64url')
  const sigBuf = Buffer.from(sig)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null
  try {
    const p = JSON.parse(Buffer.from(b, 'base64url').toString('utf8')) as { e?: string; s?: string; x?: number }
    if (!p.e || typeof p.x !== 'number' || Date.now() > p.x) return null
    return { email: p.e, source: p.s || '' }
  } catch {
    return null
  }
}
