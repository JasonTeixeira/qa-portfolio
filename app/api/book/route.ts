import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/server'
import { checkRateLimitFromHeaders } from '@/lib/rate-limit'
import { computeOpenSlots, type AvailabilityWindow, type BusyWindow } from '@/lib/booking/slots'
import { sendBookingConfirmation } from '@/lib/booking/confirm-email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  slot: z.string().datetime({ offset: true }),
  notes: z.string().trim().max(2000).optional(),
  company: z.string().trim().max(200).optional(),
  honey: z.string().max(0).optional(), // honeypot — must be empty
})

export async function POST(req: Request) {
  const h = await headers()
  const rl = checkRateLimitFromHeaders(h, { limit: 5, windowMs: 15 * 60 * 1000, prefix: 'public-book' })
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many attempts. Try again shortly.' }, { status: 429 })
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const parsed = schema.safeParse(raw)
  if (!parsed.success) return NextResponse.json({ error: 'Please check your details.' }, { status: 400 })
  const body = parsed.data
  if (body.honey) return NextResponse.json({ ok: true }) // silently drop bots

  const sb = supabaseAdmin()
  const nowIso = new Date().toISOString()

  // Recompute the open slots and confirm the requested slot is genuinely offered.
  const [availabilityRes, bookingsRes] = await Promise.all([
    sb.from('studio_availability').select('weekday, start_time, end_time, timezone, slot_minutes, is_active').eq('is_active', true),
    sb.from('bookings').select('starts_at, ends_at').eq('status', 'confirmed').gte('ends_at', nowIso),
  ])
  const { slots, durationMinutes } = computeOpenSlots(
    (availabilityRes.data ?? []) as AvailabilityWindow[],
    (bookingsRes.data ?? []) as BusyWindow[],
    { horizonDays: 21, minNoticeHours: 12 },
  )
  const requested = new Date(body.slot).toISOString()
  if (!slots.includes(requested)) {
    return NextResponse.json({ error: 'That time is no longer available — pick another.' }, { status: 409 })
  }

  const startUtc = new Date(requested)
  const endUtc = new Date(startUtc.getTime() + durationMinutes * 60_000)

  // Race-safe overlap re-check immediately before insert.
  const { data: clash } = await sb
    .from('bookings')
    .select('id')
    .lt('starts_at', endUtc.toISOString())
    .gt('ends_at', startUtc.toISOString())
    .eq('status', 'confirmed')
    .limit(1)
  if ((clash ?? []).length > 0) {
    return NextResponse.json({ error: 'That time was just taken — pick another.' }, { status: 409 })
  }

  const icsUid = `${randomUUID()}@sageideas.dev`
  const noteBlock = [body.company ? `Company: ${body.company}` : '', body.notes ?? ''].filter(Boolean).join('\n')
  const { data: inserted, error } = await sb
    .from('bookings')
    .insert({
      starts_at: startUtc.toISOString(),
      ends_at: endUtc.toISOString(),
      meeting_kind: 'discovery',
      status: 'confirmed',
      ics_uid: icsUid,
      guest_name: body.name,
      guest_email: body.email,
      notes: noteBlock || null,
    })
    .select('id, starts_at')
    .single()
  if (error || !inserted) {
    return NextResponse.json({ error: 'Could not book that slot. Try again.' }, { status: 500 })
  }

  // Audit + confirmation email (best-effort; never fail the booking on these).
  try {
    await sb.from('audit_log').insert({
      action: 'public_booking.created',
      entity_type: 'booking',
      entity_id: inserted.id,
      after: { guest_email: body.email, starts_at: inserted.starts_at, meeting_kind: 'discovery' },
    })
  } catch {
    /* non-fatal */
  }
  void sendBookingConfirmation({
    to: body.email,
    name: body.name,
    startUtc,
    durationMinutes,
    icsUid,
    notes: body.notes,
  }).catch(() => undefined)

  return NextResponse.json({ ok: true, startsAt: inserted.starts_at })
}
