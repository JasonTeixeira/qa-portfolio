/**
 * Open-slots engine for the public scheduler. Reads recurring availability windows
 * (studio_availability: weekday + start/end time + IANA timezone + slot length) and the
 * existing confirmed bookings, and returns the open slots as UTC instants. The client
 * renders them in the VISITOR's timezone. DST-safe (no date-fns-tz needed) via Intl.
 */

export interface AvailabilityWindow {
  weekday: number // 0 = Sunday … 6 = Saturday
  start_time: string // 'HH:MM:SS'
  end_time: string
  timezone: string // IANA, e.g. 'America/New_York'
  slot_minutes: number
  is_active: boolean
}

export interface BusyWindow {
  starts_at: string // ISO
  ends_at: string
}

export interface SlotOptions {
  now?: Date
  horizonDays?: number // how far out to offer slots
  minNoticeHours?: number // earliest bookable slot from now
}

/** Offset (ms) that `timeZone` is ahead of UTC at the given instant. */
function tzOffsetMs(timeZone: string, at: Date): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const p: Record<string, number> = {}
  for (const part of dtf.formatToParts(at)) if (part.type !== 'literal') p[part.type] = Number(part.value)
  // Intl renders 24:00 as hour 24 on some engines — normalize.
  const hour = p.hour === 24 ? 0 : p.hour
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, hour, p.minute, p.second)
  return asUtc - at.getTime()
}

/** UTC instant for a wall-clock date/time interpreted in `timeZone`. */
function zonedTimeToUtc(y: number, mo: number, d: number, h: number, min: number, timeZone: string): Date {
  const guess = Date.UTC(y, mo - 1, d, h, min)
  const offset = tzOffsetMs(timeZone, new Date(guess))
  return new Date(guess - offset)
}

/** The y/m/d calendar date of `instant` in `timeZone`. */
function calendarDateIn(instant: Date, timeZone: string): { y: number; mo: number; d: number } {
  const dtf = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
  const [y, mo, d] = dtf.format(instant).split('-').map(Number)
  return { y, mo, d }
}

function parseHM(t: string): [number, number] {
  const [h, m] = t.split(':').map(Number)
  return [h, m]
}

/** Open slots (UTC ISO start strings) across the booking horizon. */
export function computeOpenSlots(
  availability: AvailabilityWindow[],
  busy: BusyWindow[],
  opts: SlotOptions = {},
): { slots: string[]; durationMinutes: number } {
  const now = opts.now ?? new Date()
  const horizonDays = opts.horizonDays ?? 21
  const minNoticeMs = (opts.minNoticeHours ?? 12) * 3_600_000
  const active = availability.filter((a) => a.is_active)
  if (active.length === 0) return { slots: [], durationMinutes: 30 }

  const tz = active[0].timezone
  const durationMinutes = active[0].slot_minutes
  const earliest = now.getTime() + minNoticeMs

  const busyRanges = busy.map((b) => [new Date(b.starts_at).getTime(), new Date(b.ends_at).getTime()] as const)
  const overlaps = (s: number, e: number) => busyRanges.some(([bs, be]) => s < be && e > bs)

  // Iterate calendar dates using a UTC-midnight container (DST-free; weekday is TZ-agnostic).
  const start = calendarDateIn(now, tz)
  const cursor = Date.UTC(start.y, start.mo - 1, start.d)
  const slots: string[] = []

  for (let i = 0; i <= horizonDays; i++) {
    const day = new Date(cursor + i * 86_400_000)
    const y = day.getUTCFullYear()
    const mo = day.getUTCMonth() + 1
    const d = day.getUTCDate()
    const weekday = day.getUTCDay()

    for (const win of active.filter((a) => a.weekday === weekday)) {
      const [sh, sm] = parseHM(win.start_time)
      const [eh, em] = parseHM(win.end_time)
      const windowEndMin = eh * 60 + em
      for (let mins = sh * 60 + sm; mins + win.slot_minutes <= windowEndMin; mins += win.slot_minutes) {
        const startUtc = zonedTimeToUtc(y, mo, d, Math.floor(mins / 60), mins % 60, win.timezone)
        const ms = startUtc.getTime()
        const endMs = ms + win.slot_minutes * 60_000
        if (ms < earliest) continue
        if (overlaps(ms, endMs)) continue
        slots.push(startUtc.toISOString())
      }
    }
  }

  return { slots: [...new Set(slots)].sort(), durationMinutes }
}
