'use client'

import { useEffect, useMemo, useState } from 'react'
import { Hairline, MonoLabel, Surface } from '@/components/el'

const fmtDayLong = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
const fmtMonthYear = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' })
const fmtTime = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const SERIF: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontVariationSettings: "'opsz' 120, 'SOFT' 0, 'WONK' 0",
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

export function PublicScheduler() {
  const [slots, setSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [view, setView] = useState<{ y: number; m: number } | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [slot, setSlot] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [notes, setNotes] = useState('')
  const [honey, setHoney] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookedAt, setBookedAt] = useState<string | null>(null)

  const tz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch {
      return 'your timezone'
    }
  }, [])

  useEffect(() => {
    let alive = true
    fetch('/api/book/slots')
      .then((r) => r.json())
      .then((d: { slots?: string[] }) => {
        if (!alive) return
        const list = d.slots ?? []
        setSlots(list)
        setFailed(list.length === 0)
      })
      .catch(() => alive && setFailed(true))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  // local-day key → slots
  const byDay = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const iso of slots) {
      const k = dayKey(new Date(iso))
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(iso)
    }
    return map
  }, [slots])

  // navigable month range: from the first available month to the last
  const range = useMemo(() => {
    if (slots.length === 0) return null
    const first = new Date(slots[0])
    const last = new Date(slots[slots.length - 1])
    return {
      min: { y: first.getFullYear(), m: first.getMonth() },
      max: { y: last.getFullYear(), m: last.getMonth() },
    }
  }, [slots])

  useEffect(() => {
    if (!view && range) setView(range.min)
  }, [range, view])

  const monthSlots = view ? buildMonthCells(view.y, view.m, byDay) : []
  const selectedSlots = selectedKey ? byDay.get(selectedKey) ?? [] : []
  const selectedDate = selectedSlots.length ? new Date(selectedSlots[0]) : null

  const canPrev = view && range ? view.y * 12 + view.m > range.min.y * 12 + range.min.m : false
  const canNext = view && range ? view.y * 12 + view.m < range.max.y * 12 + range.max.m : false
  const shift = (delta: number) => {
    if (!view) return
    const total = view.y * 12 + view.m + delta
    setView({ y: Math.floor(total / 12), m: total % 12 })
  }

  async function book() {
    if (!slot) return
    if (name.trim().length < 2) return setError('Please enter your name.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Please enter a valid email.')
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), slot, company: company.trim(), notes: notes.trim(), honey }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Could not book that slot. Try another time.')
        if (res.status === 409) {
          fetch('/api/book/slots').then((r) => r.json()).then((d) => setSlots(d.slots ?? []))
          setSlot(null)
        }
      } else {
        setBookedAt(data.startsAt ?? slot)
      }
    } catch {
      setError('Network error. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (bookedAt) {
    return (
      <Surface level={2} bordered className="p-8 sm:p-10 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#18b663]/15 text-2xl text-[#18b663]">✓</div>
        <h3 className="text-2xl text-[var(--sage-ink)]" style={SERIF}>You&apos;re booked.</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--sage-ink-muted)]">
          Your 30-minute discovery call is confirmed for{' '}
          <strong className="text-[var(--sage-ink)]">{fmtDayLong.format(new Date(bookedAt))} · {fmtTime.format(new Date(bookedAt))}</strong>.
        </p>
        <p className="mt-2 text-[13px] text-[var(--sage-ink-faint)]">
          A confirmation and calendar invite are on the way to {email}. I&apos;ll send the meeting link before the call.
        </p>
      </Surface>
    )
  }

  if (loading) {
    return (
      <Surface level={2} bordered className="p-10 text-center">
        <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">Loading open times…</p>
      </Surface>
    )
  }
  if (failed || !view) {
    return (
      <Surface level={2} bordered className="p-8">
        <MonoLabel tone="faint" className="text-[10px]">{'// scheduler'}</MonoLabel>
        <p className="mt-3 text-[15px] text-[var(--sage-ink-muted)]">
          No open slots right now — use the structured intake below and I&apos;ll send times directly.
        </p>
      </Surface>
    )
  }

  return (
    <Surface level={2} bordered ticks className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--sage-border)] px-5 py-3.5 sm:px-6">
        <MonoLabel tone="accent" className="text-[10px]">{'// pick a time'}</MonoLabel>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--sage-ink-faint)]">Times in {tz}</span>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Month calendar */}
        <div className="border-b border-[var(--sage-border)] p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[17px] text-[var(--sage-ink)]" style={SERIF}>{fmtMonthYear.format(new Date(view.y, view.m, 1))}</h3>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Previous month"
                className="grid h-8 w-8 place-items-center rounded-[6px] border border-[var(--sage-border)] text-[var(--sage-ink-muted)] transition-colors hover:border-[var(--sage-border-strong)] hover:text-[var(--sage-ink)] disabled:opacity-30 disabled:pointer-events-none">←</button>
              <button type="button" onClick={() => shift(1)} disabled={!canNext} aria-label="Next month"
                className="grid h-8 w-8 place-items-center rounded-[6px] border border-[var(--sage-border)] text-[var(--sage-ink-muted)] transition-colors hover:border-[var(--sage-border-strong)] hover:text-[var(--sage-ink)] disabled:opacity-30 disabled:pointer-events-none">→</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((w) => (
              <span key={w} className="pb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--sage-ink-faint)]">{w}</span>
            ))}
            {monthSlots.map((cell, i) =>
              cell === null ? (
                <span key={`b${i}`} />
              ) : (
                <button
                  key={cell.key}
                  type="button"
                  disabled={!cell.available}
                  onClick={() => {
                    setSelectedKey(cell.key)
                    setSlot(null)
                  }}
                  aria-pressed={selectedKey === cell.key}
                  className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-[14px] tabular-nums transition-colors ${
                    selectedKey === cell.key
                      ? 'bg-[#3D5AFE] font-semibold text-white'
                      : cell.available
                        ? 'font-medium text-[var(--sage-ink)] hover:bg-[var(--sage-surface-2)]'
                        : 'text-[var(--sage-ink-faint)]/40 pointer-events-none'
                  }`}
                >
                  {cell.day}
                  {cell.available && selectedKey !== cell.key && (
                    <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-[#18b663]" aria-hidden />
                  )}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Times + form */}
        <div className="p-5 sm:p-6">
          {!selectedKey ? (
            <p className="text-[14px] leading-relaxed text-[var(--sage-ink-faint)]">
              Pick a date with a <span className="text-[#18b663]">•</span> to see open times.
            </p>
          ) : !slot ? (
            <>
              <p className="mb-4 text-[15px] font-medium text-[var(--sage-ink)]" style={SERIF}>
                {selectedDate ? fmtDayLong.format(selectedDate) : ''}
              </p>
              <div className="grid max-h-[320px] grid-cols-2 gap-2 overflow-y-auto pr-1">
                {selectedSlots.map((iso) => (
                  <button key={iso} type="button" onClick={() => { setSlot(iso); setError(null) }}
                    className="rounded-[6px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-1)] px-2 py-2.5 text-[13px] tabular-nums text-[var(--sage-ink-muted)] transition-colors hover:border-[#3D5AFE] hover:text-[var(--sage-ink)]">
                    {fmtTime.format(new Date(iso))}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <button type="button" onClick={() => setSlot(null)}
                className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--sage-ink-faint)] hover:text-[var(--sage-ink)]">
                ← {fmtTime.format(new Date(slot))} (change)
              </button>
              <Hairline />
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden value={honey} onChange={(e) => setHoney(e.target.value)} className="hidden" />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" className="w-full rounded-[4px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-2)] px-3 py-2.5 text-[14px] text-[var(--sage-ink)] placeholder:text-[var(--sage-ink-faint)] focus:border-[#3D5AFE] focus:outline-none" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@company.com" autoComplete="email" className="w-full rounded-[4px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-2)] px-3 py-2.5 text-[14px] text-[var(--sage-ink)] placeholder:text-[var(--sage-ink-faint)] focus:border-[#3D5AFE] focus:outline-none" />
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company (optional)" autoComplete="organization" className="w-full rounded-[4px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-2)] px-3 py-2.5 text-[14px] text-[var(--sage-ink)] placeholder:text-[var(--sage-ink-faint)] focus:border-[#3D5AFE] focus:outline-none" />
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="What do you want to cover? (optional)" className="w-full resize-y rounded-[4px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-2)] px-3 py-2.5 text-[14px] text-[var(--sage-ink)] placeholder:text-[var(--sage-ink-faint)] focus:border-[#3D5AFE] focus:outline-none" />
              {error && <p role="alert" className="text-[13px] text-red-300">{error}</p>}
              <button type="button" onClick={book} disabled={submitting}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-[#3D5AFE] px-6 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#08110F] transition-[transform,background] hover:-translate-y-px hover:bg-[#5670ff] disabled:opacity-50 [font-family:var(--font-mono),ui-monospace,monospace]">
                {submitting ? 'Booking…' : 'Confirm booking →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Surface>
  )
}

type Cell = { key: string; day: number; available: boolean } | null

function buildMonthCells(year: number, month: number, byDay: Map<string, string[]>): Cell[] {
  const first = new Date(year, month, 1)
  const lead = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Cell[] = []
  for (let i = 0; i < lead; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${month}-${d}`
    cells.push({ key, day: d, available: byDay.has(key) })
  }
  return cells
}
