'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { FieldNote } from '@/lib/field-notes'

// Palette from the design source (fieldnotes.html).
const COLORS = {
  bg: '#0B0B0E',
  text: '#F2EFE9',
  muted: '#9598A2',
  mutedAlt: '#9C9CA6',
  line: '#1E1E24',
  lineSoft: '#2A2A33',
  accent: '#3D5AFE',
  accentInk: '#8FA0FF',
  green: '#18B663',
  arrow: '#4A4A54',
  rowBg: '#111115',
} as const

// Category → tag color, one-for-one with the design's tint per category.
const CATEGORY_TINT: Record<string, string> = {
  'Repair log': '#E5484D',
  Systems: '#8FA0FF',
  AI: '#FF2D9B',
  Audit: '#E0A93E',
  Career: '#18B663',
  Growth: '#7C3AED',
}

// Course sprint each category routes into (mirrors the design's "routes →" line).
const CATEGORY_ROUTE: Record<string, string> = {
  'Repair log': 'Backend Engineering',
  Systems: 'Engineering Judgment',
  AI: 'AI Engineering & RAG',
  Audit: 'AI Engineering & RAG',
  Career: 'Interview & Portfolio',
  Growth: 'Product Execution',
}

// Filter chips, in the design's order.
const FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'All notes' },
  { key: 'Systems', label: 'Systems' },
  { key: 'Repair log', label: 'Repair logs' },
  { key: 'AI', label: 'AI' },
  { key: 'Audit', label: 'Audits' },
  { key: 'Career', label: 'Career' },
  { key: 'Growth', label: 'Growth' },
]

const MONO = '"JetBrains Mono", monospace'
const DISPLAY = 'Fraunces, Georgia, serif'

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}

function tintFor(category: string): string {
  return CATEGORY_TINT[category] ?? COLORS.accentInk
}

function routeFor(category: string): string {
  return CATEGORY_ROUTE[category] ?? 'Sage Academy'
}

interface FieldNotesListProps {
  notes: FieldNote[]
  total: number
}

export function FieldNotesList({ notes, total }: FieldNotesListProps) {
  const [active, setActive] = useState('all')

  const visible = useMemo(
    () => notes.filter((n) => active === 'all' || n.category === active),
    [notes, active],
  )

  const countLine =
    active === 'all'
      ? `${total} notes · showing latest ${notes.length}`
      : `${visible.length} shown of this category`

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
              style={{
                fontFamily: MONO,
                fontSize: 11.5,
                padding: '9px 16px',
                borderRadius: 20,
                border: `1px solid ${on ? 'rgba(61,90,254,0.6)' : COLORS.line}`,
                color: on ? COLORS.text : COLORS.mutedAlt,
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
            color: COLORS.muted,
          }}
        >
          {countLine}
        </span>
      </div>

      {/* Note rows */}
      <div style={{ border: `1px solid ${COLORS.line}`, borderRadius: 14, overflow: 'hidden' }}>
        {visible.map((note) => (
          <Link
            key={note.slug}
            href={`/field-notes/${note.slug}`}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(90px, 120px) 1fr auto',
              gap: 18,
              alignItems: 'center',
              padding: '19px 24px',
              background: COLORS.rowBg,
              borderBottom: `1px solid ${COLORS.line}`,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: '0.08em',
                color: tintFor(note.category),
                textTransform: 'uppercase',
              }}
            >
              {note.category}
            </span>
            <span style={{ minWidth: 0 }}>
              <span
                style={{
                  display: 'block',
                  fontFamily: DISPLAY,
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
                  color: COLORS.muted,
                }}
              >
                <span>{formatDate(note.date)}</span>
                <span style={{ color: COLORS.green }}>routes → {routeFor(note.category)}</span>
              </span>
            </span>
            <span style={{ color: COLORS.arrow }}>→</span>
          </Link>
        ))}
      </div>

      {/* Cadence strip */}
      <div
        style={{
          marginTop: 18,
          border: `1px dashed ${COLORS.lineSoft}`,
          borderRadius: 12,
          padding: '16px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 13.5, color: COLORS.mutedAlt }}>
          A new note ships every Monday — the same incident the weekly challenge maps.
        </span>
        <span style={{ fontFamily: MONO, fontSize: 11, color: COLORS.accentInk, whiteSpace: 'nowrap' }}>
          RSS · newsletter →
        </span>
      </div>
    </section>
  )
}
