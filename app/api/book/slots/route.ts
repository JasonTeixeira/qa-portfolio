import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { computeOpenSlots, type AvailabilityWindow, type BusyWindow } from '@/lib/booking/slots'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// How far ahead bookings are allowed. The availability model is INFINITE (recurring weekly);
// this is just the business cap, and the slots are computed on-demand per requested window,
// so raising it costs nothing. Override with BOOKING_MAX_ADVANCE_DAYS (e.g. 730 for 2 years).
const MAX_ADVANCE_DAYS = Number(process.env.BOOKING_MAX_ADVANCE_DAYS) || 365

/**
 * Public open slots for a requested [from, to] window (the client asks one month at a time).
 * Defaults to the next ~45 days when no window is given. Returns the max bookable date so the
 * calendar knows how far it may navigate.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const now = new Date()
    const maxBookable = new Date(now.getTime() + MAX_ADVANCE_DAYS * 86_400_000)

    const parse = (v: string | null, fallback: Date) => {
      const d = v ? new Date(v) : fallback
      return isNaN(d.getTime()) ? fallback : d
    }
    let from = parse(url.searchParams.get('from'), now)
    let to = parse(url.searchParams.get('to'), new Date(now.getTime() + 45 * 86_400_000))
    if (from.getTime() < now.getTime()) from = now
    if (to.getTime() > maxBookable.getTime()) to = maxBookable

    if (to.getTime() <= from.getTime()) {
      return NextResponse.json({ slots: [], durationMinutes: 30, maxBookable: maxBookable.toISOString() })
    }

    const sb = supabaseAdmin()
    const [availabilityRes, bookingsRes] = await Promise.all([
      sb
        .from('studio_availability')
        .select('weekday, start_time, end_time, timezone, slot_minutes, is_active')
        .eq('is_active', true),
      // Only bookings that could overlap this window.
      sb
        .from('bookings')
        .select('starts_at, ends_at')
        .eq('status', 'confirmed')
        .gte('ends_at', from.toISOString())
        .lte('starts_at', to.toISOString()),
    ])

    if (availabilityRes.error) {
      return NextResponse.json({ slots: [], durationMinutes: 30, maxBookable: maxBookable.toISOString() })
    }

    const { slots, durationMinutes } = computeOpenSlots(
      (availabilityRes.data ?? []) as AvailabilityWindow[],
      (bookingsRes.data ?? []) as BusyWindow[],
      { from, to, minNoticeHours: 12 },
    )

    return NextResponse.json(
      { slots, durationMinutes, maxBookable: maxBookable.toISOString() },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=120' } },
    )
  } catch {
    return NextResponse.json({ slots: [], durationMinutes: 30 })
  }
}
