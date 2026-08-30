import { Resend } from 'resend'

/**
 * Best-effort Resend Audience membership. If RESEND_AUDIENCE_ID isn't set, these
 * no-op quietly — the confirm/unsubscribe flow still works (welcome email is
 * still sent), there just isn't a managed list. Failures never throw.
 */

function client(): { resend: Resend; audienceId: string } | null {
  const key = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!key || !audienceId) return null
  return { resend: new Resend(key), audienceId }
}

export async function addContact(email: string): Promise<void> {
  const c = client()
  if (!c) return
  try {
    await c.resend.contacts.create({ email, audienceId: c.audienceId, unsubscribed: false })
  } catch (err) {
    console.warn('[newsletter] addContact failed:', err instanceof Error ? err.message : err)
  }
}

export async function unsubscribeContact(email: string): Promise<void> {
  const c = client()
  if (!c) return
  try {
    await c.resend.contacts.update({ email, audienceId: c.audienceId, unsubscribed: true })
  } catch (err) {
    console.warn('[newsletter] unsubscribeContact failed:', err instanceof Error ? err.message : err)
  }
}
