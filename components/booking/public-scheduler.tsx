'use client'

import { useEffect, useMemo, useState } from 'react'
import { Hairline, MonoLabel, Surface } from '@/components/el'

type DayGroup = { key: string; date: Date; slots: string[] }

const fmtDayLong = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
const fmtDayShort = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric' })
const fmtMonth = new Intl.DateTimeFormat(undefined, { month: 'short' })
const fmtTime = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
const SERIF: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontVariationSettings: "'opsz' 120, 'SOFT' 0, 'WONK' 0",
}

export function PublicScheduler() {
  const [slots, setSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [dayKey, setDayKey] = useState<string | null>(null)
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

  const days: DayGroup[] = useMemo(() => {
    const map = new Map<string, DayGroup>()
    for (const iso of slots) {
      const date = new Date(iso)
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      if (!map.has(key)) map.set(key, { key, date, slots: [] })
      map.get(key)!.slots.push(iso)
    }
    return [...map.values()].slice(0, 14)
  }, [slots])

  useEffect(() => {
    if (!dayKey && days.length) setDayKey(days[0].key)
  }, [days, dayKey])

  const activeDay = days.find((d) => d.key === dayKey) ?? null

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
          // slot taken — refresh
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

  // ── Success ──
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

  // ── Loading / no availability ──
  if (loading) {
    return (
      <Surface level={2} bordered className="p-10 text-center">
        <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">Loading open times…</p>
      </Surface>
    )
  }
  if (failed || days.length === 0) {
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

      <div className="grid gap-0 md:grid-cols-[200px_1fr]">
        {/* Day rail */}
        <div className="flex gap-2 overflow-x-auto border-b border-[var(--sage-border)] p-3 md:flex-col md:overflow-visible md:border-b-0 md:border-r">
          {days.map((d) => {
            const on = d.key === dayKey
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => {
                  setDayKey(d.key)
                  setSlot(null)
                }}
                className={`flex shrink-0 items-baseline justify-between gap-3 rounded-[6px] px-3 py-2.5 text-left transition-colors md:shrink ${
                  on ? 'bg-[#3D5AFE]/10 text-[var(--sage-ink)]' : 'text-[var(--sage-ink-muted)] hover:bg-[var(--sage-surface-2)]'
                }`}
              >
                <span className="text-[13px] font-medium">{fmtDayShort.format(d.date)}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] opacity-60">
                  {fmtMonth.format(d.date)} · {d.slots.length}
                </span>
              </button>
            )
          })}
        </div>

        {/* Times + form */}
        <div className="p-4 sm:p-6">
          {!slot ? (
            <>
              <p className="mb-4 text-[15px] font-medium text-[var(--sage-ink)]" style={SERIF}>
                {activeDay ? fmtDayLong.format(activeDay.date) : ''}
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {activeDay?.slots.map((iso) => (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => {
                      setSlot(iso)
                      setError(null)
                    }}
                    className="rounded-[6px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-1)] px-2 py-2.5 text-[13px] tabular-nums text-[var(--sage-ink-muted)] transition-colors hover:border-[#3D5AFE] hover:text-[var(--sage-ink)]"
                  >
                    {fmtTime.format(new Date(iso))}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setSlot(null)}
                className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--sage-ink-faint)] hover:text-[var(--sage-ink)]"
              >
                ← {fmtDayLong.format(new Date(slot))} · {fmtTime.format(new Date(slot))} (change)
              </button>
              <Hairline />
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden value={honey} onChange={(e) => setHoney(e.target.value)} className="hidden" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" className="w-full rounded-[4px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-2)] px-3 py-2.5 text-[14px] text-[var(--sage-ink)] placeholder:text-[var(--sage-ink-faint)] focus:border-[#3D5AFE] focus:outline-none" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@company.com" autoComplete="email" className="w-full rounded-[4px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-2)] px-3 py-2.5 text-[14px] text-[var(--sage-ink)] placeholder:text-[var(--sage-ink-faint)] focus:border-[#3D5AFE] focus:outline-none" />
              </div>
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company (optional)" autoComplete="organization" className="w-full rounded-[4px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-2)] px-3 py-2.5 text-[14px] text-[var(--sage-ink)] placeholder:text-[var(--sage-ink-faint)] focus:border-[#3D5AFE] focus:outline-none" />
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="What do you want to cover? (optional)" className="w-full resize-y rounded-[4px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-2)] px-3 py-2.5 text-[14px] text-[var(--sage-ink)] placeholder:text-[var(--sage-ink-faint)] focus:border-[#3D5AFE] focus:outline-none" />
              {error && <p role="alert" className="text-[13px] text-red-300">{error}</p>}
              <button
                type="button"
                onClick={book}
                disabled={submitting}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-[#3D5AFE] px-6 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#08110F] transition-[transform,background] hover:-translate-y-px hover:bg-[#5670ff] disabled:opacity-50 sm:w-auto [font-family:var(--font-mono),ui-monospace,monospace]"
              >
                {submitting ? 'Booking…' : 'Confirm booking →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Surface>
  )
}
