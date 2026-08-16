'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { FieldNoteRow } from './note-meta'

/**
 * Filters + note list + "The Monday note" subscribe strip, 1:1 with
 * "Sage Field Notes.dc.html" (FILTERS + LIST section). The note data is real
 * (loaded from content/field-notes by the server page); the subscribe box
 * posts to the real /api/newsletter/subscribe endpoint instead of the mock's
 * localStorage stub.
 */

const MONO = 'var(--font-mono), monospace'
const SERIF = 'var(--font-serif), Georgia, serif'

// Filter chips, in the design's order. Keys match real note categories.
const FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'All notes' },
  { key: 'Systems', label: 'Systems' },
  { key: 'Repair log', label: 'Repair logs' },
  { key: 'AI', label: 'AI' },
  { key: 'Audit', label: 'Audits' },
  { key: 'Career', label: 'Career' },
  { key: 'Growth', label: 'Growth' },
]

interface FieldNotesListProps {
  notes: FieldNoteRow[]
}

export function FieldNotesList({ notes }: FieldNotesListProps) {
  const [active, setActive] = useState('all')
  const [email, setEmail] = useState('')
  const [subState, setSubState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')

  const visible = useMemo(
    () => notes.filter((n) => active === 'all' || n.category === active),
    [notes, active],
  )

  // Honesty: the mock hardcodes "62 notes" — we show the real published count.
  const countLine =
    active === 'all'
      ? `${notes.length} notes · showing all ${notes.length}`
      : `${visible.length} shown of this category`

  async function subscribe() {
    const v = email.trim()
    if (!v || v.indexOf('@') < 1) {
      setSubState('error')
      setTimeout(() => setSubState('idle'), 1400)
      return
    }
    setSubState('busy')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: v, source: 'field-notes' }),
      })
      setSubState(res.ok ? 'done' : 'error')
      if (!res.ok) setTimeout(() => setSubState('idle'), 1600)
    } catch {
      setSubState('error')
      setTimeout(() => setSubState('idle'), 1600)
    }
  }

  return (
    <section
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 clamp(20px, 4vw, 48px) clamp(56px, 8vw, 96px)',
      }}
    >
      {/* Filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '24px 0 26px' }}>
        {FILTERS.map((f) => {
          const on = active === f.key
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setActive(f.key)}
              className="fn-chip"
              style={{
                fontFamily: MONO,
                fontSize: 11.5,
                padding: '9px 16px',
                borderRadius: 20,
                border: `1px solid ${on ? 'rgba(61,90,254,0.6)' : '#1E1E24'}`,
                color: on ? '#F2EFE9' : '#9C9CA6',
                background: on ? 'rgba(61,90,254,0.12)' : 'transparent',
                cursor: 'pointer',
                userSelect: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {f.label}
            </button>
          )
        })}
        <span
          style={{
            marginLeft: 'auto',
            alignSelf: 'center',
            fontFamily: MONO,
            fontSize: 11,
            color: '#9598A2',
          }}
        >
          {countLine}
        </span>
      </div>

      {/* Note rows */}
      <div style={{ border: '1px solid #1E1E24', borderRadius: 14, overflow: 'hidden' }}>
        {visible.map((note) => (
          <Link
            key={note.slug}
            href={`/field-notes/${note.slug}`}
            className="fn-row"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(90px, 120px) 1fr auto',
              gap: 18,
              alignItems: 'center',
              padding: '19px 24px',
              background: '#111115',
              borderBottom: '1px solid #1E1E24',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: '0.08em',
                color: note.tint,
                textTransform: 'uppercase',
              }}
            >
              {note.category}
            </span>
            <span style={{ minWidth: 0 }}>
              <span
                style={{
                  display: 'block',
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: 18,
                  letterSpacing: '-0.012em',
                  lineHeight: 1.25,
                }}
              >
                {note.title}
              </span>
              <span
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 14,
                  marginTop: 4,
                  fontFamily: MONO,
                  fontSize: 10.5,
                  color: '#9598A2',
                }}
              >
                <span>{note.dateLabel}</span>
                <span>{note.readMin} min</span>
                <span style={{ color: '#18B663' }}>routes → {note.route}</span>
              </span>
            </span>
            <span style={{ color: '#4A4A54' }}>→</span>
          </Link>
        ))}
      </div>

      {/* The Monday note — subscribe strip */}
      <div
        style={{
          marginTop: 18,
          border: '1px solid rgba(61,90,254,0.3)',
          borderRadius: 14,
          background: 'linear-gradient(115deg, #10131F 0%, #111115 70%)',
          padding: '22px 26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 18,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ minWidth: 240, flex: 1 }}>
          <span
            style={{
              display: 'block',
              fontFamily: MONO,
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: '#8FA0FF',
              marginBottom: 6,
            }}
          >
            The Monday note
          </span>
          <span style={{ display: 'block', fontSize: 14, color: '#9C9CA6' }}>
            A new incident, mapped in public, every Monday — the same one the{' '}
            <Link href="/academy/challenge" style={{ color: '#8FA0FF', textDecoration: 'none' }}>
              weekly challenge
            </Link>{' '}
            runs.
          </span>
        </span>
        {subState === 'done' ? (
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: '#18B663', whiteSpace: 'nowrap' }}>
            ✓ you&apos;re in — see you Monday
          </span>
        ) : (
          <span style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260, maxWidth: 360 }}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') subscribe()
              }}
              type="email"
              placeholder="you@work.dev"
              aria-label="Email for the Monday note"
              style={{
                flex: 1,
                minWidth: 0,
                background: '#0F0F13',
                border: `1px solid ${subState === 'error' ? 'rgba(229,72,77,0.6)' : '#2A2A33'}`,
                borderRadius: 10,
                padding: '11px 14px',
                fontSize: 13.5,
                color: '#F2EFE9',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={subscribe}
              disabled={subState === 'busy'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#3D5AFE',
                color: '#fff',
                border: 0,
                borderRadius: 10,
                padding: '0 18px',
                fontSize: 13.5,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: subState === 'busy' ? 'wait' : 'pointer',
                whiteSpace: 'nowrap',
                userSelect: 'none',
                opacity: subState === 'busy' ? 0.7 : 1,
              }}
            >
              {subState === 'busy' ? 'Sending…' : 'Subscribe'}
            </button>
          </span>
        )}
      </div>
    </section>
  )
}
