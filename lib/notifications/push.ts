import 'server-only'
import webpush from 'web-push'

/**
 * Web-push sender. Degrades gracefully: with no VAPID keys configured it no-ops
 * (matches the email pipeline's "queued" fallback) so dev + preview never throw.
 */

let configured = false

function ensureVapid(): boolean {
  const pub = process.env.VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  if (!pub || !priv) return false
  if (!configured) {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:hello@sageideas.dev', pub, priv)
    configured = true
  }
  return true
}

export function pushConfigured(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
}

export function pushPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY ?? null
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

export interface WebPushSub {
  endpoint: string
  p256dh: string
  auth: string
}

export type PushResult = { ok: true } | { ok: false; reason: string; gone?: boolean }

export async function sendPush(sub: WebPushSub, payload: PushPayload): Promise<PushResult> {
  if (!ensureVapid()) return { ok: false, reason: 'missing_vapid' }
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
    )
    return { ok: true }
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode
    // 404/410 → the subscription is dead and should be pruned by the caller.
    return { ok: false, reason: `push_failed_${status ?? 'unknown'}`, gone: status === 404 || status === 410 }
  }
}
