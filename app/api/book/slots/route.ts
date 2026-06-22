import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { computeOpenSlots, type AvailabilityWindow, type BusyWindow } from '@/lib/booking/slots'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Public: open discovery-call slots (UTC ISO). The client renders them in its own timezone. */
export async function GET() {
  try {
    const sb = supabaseAdmin()
    const nowIso = new Date().toISOString()
    const [availabilityRes, bookingsRes] = await Promise.all([
      sb
        .from('studio_availability')
        .select('weekday, start_time, end_time, timezone, slot_minutes, is_active')
        .eq('is_active', true),
      sb.from('bookings').select('starts_at, ends_at').eq('status', 'confirmed').gte('ends_at', nowIso),
    ])

    if (availabilityRes.error) {
      return NextResponse.json({ slots: [], durationMinutes: 30, error: 'availability_unavailable' })
    }

    const { slots, durationMinutes } = computeOpenSlots(
      (availabilityRes.data ?? []) as AvailabilityWindow[],
      (bookingsRes.data ?? []) as BusyWindow[],
      { horizonDays: 60, minNoticeHours: 12 },
    )

    return NextResponse.json(
      { slots, durationMinutes },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=120' } },
    )
  } catch {
    return NextResponse.json({ slots: [], durationMinutes: 30, error: 'slots_failed' })
  }
}
