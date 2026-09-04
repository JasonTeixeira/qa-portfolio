'use client'

import { useMemo, useState } from 'react'
import { WAVE1_DEFECTS, type Wave1Defect } from '@/data/academy/wave1-defects'

/**
 * The full, filterable Wave-1 self-audit ledger — every defect we found in our
 * OWN lessons, quoted verbatim, with the fix. Real data (data/academy/wave1-
 * defects.ts), not illustrative. This is the trust flex: publishing our bug
 * report in public.
 */

const INK = '#F2EFE9'
const DIM = '#9598A2'
const LINE = '#1E1E24'
const ACCENT_INK = '#8FA0FF'

const mono = { fontFamily: 'var(--font-mono), monospace' } as const
const serif = { fontFamily: 'var(--font-serif), Georgia, serif' } as const

type Sev = Wave1Defect['severity']
const SEV_ORDER: Sev[] = ['CRITICAL', 'HIGH', 'SYSTEMIC', 'MEDIUM', 'LOW']
const SEV_COLOR: Record<Sev, string> = {
  CRITICAL: '#E5484D',
  HIGH: '#E0A93E',
  SYSTEMIC: '#a78bfa',
  MEDIUM: '#8FA0FF',
  LOW: '#5A5A64',
}

export function DefectLedger() {
  const [sev, setSev] = useState<'ALL' | Sev>('ALL')
  const [q, setQ] = useState('')

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: WAVE1_DEFECTS.length }
    for (const d of WAVE1_DEFECTS) c[d.severity] = (c[d.severity] ?? 0) + 1
    return c
  }, [])

  const needle = q.trim().toLowerCase()
  const rows = useMemo(() => {
    const filtered = WAVE1_DEFECTS.filter(
      (d) =>
        (sev === 'ALL' || d.severity === sev) &&
        (!needle || `${d.lesson} ${d.quote} ${d.finding}`.toLowerCase().includes(needle)),
    )
    const rank = (s: Sev) => SEV_ORDER.indexOf(s)
    return [...filtered].sort((a, b) => rank(a.severity) - rank(b.severity))
  }, [sev, needle])

  const chips: ('ALL' | Sev)[] = ['ALL', ...SEV_ORDER.filter((s) => (counts[s] ?? 0) > 0)]

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 20 }}>
        {chips.map((c) => {
          const on = sev === c
          const color = c === 'ALL' ? ACCENT_INK : SEV_COLOR[c]
          return (
            <button
              key={c}
              type="button"
              onClick={() => setSev(c)}
              aria-pressed={on}
              style={{
                ...mono,
                fontSize: 11,
                padding: '7px 13px',
                borderRadius: 18,
                border: `1px solid ${on ? color : LINE}`,
                background: on ? `${color}1f` : 'transparent',
                color: on ? INK : DIM,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {c === 'ALL' ? 'All' : c.toLowerCase()} · {counts[c] ?? 0}
            </button>
          )
        })}
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search the ledger…"
          aria-label="Search defects"
          style={{ ...mono, marginLeft: 'auto', width: 'clamp(150px, 24vw, 240px)', fontSize: 12, padding: '8px 13px', borderRadius: 18, border: `1px solid ${LINE}`, background: '#0B0B0E', color: INK, outline: 'none' }}
        />
      </div>

      <div style={{ ...mono, fontSize: 11, color: DIM, marginBottom: 14 }}>
        Showing {rows.length} of {WAVE1_DEFECTS.length} audited defects — every one found in our own lessons, quoted verbatim.
      </div>

      <div style={{ borderTop: `1px solid ${LINE}` }}>
        {rows.map((d) => (
          <details key={d.id} style={{ borderBottom: `1px solid ${LINE}` }}>
            <summary
              style={{
                listStyle: 'none',
                cursor: 'pointer',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: 16,
                alignItems: 'center',
                padding: '16px 4px',
              }}
            >
              <span style={{ ...mono, fontSize: 9, letterSpacing: '0.1em', color: SEV_COLOR[d.severity], border: `1px solid ${SEV_COLOR[d.severity]}55`, borderRadius: 5, padding: '3px 7px', whiteSpace: 'nowrap' }}>
                {d.severity}
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ ...mono, fontSize: 10.5, color: DIM }}>{d.lesson}</span>
                <span style={{ display: 'block', fontSize: 14.5, color: INK, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {d.finding.length > 96 ? d.finding.slice(0, 96) + '…' : d.finding}
                </span>
              </span>
              <span aria-hidden="true" style={{ ...mono, fontSize: 18, color: ACCENT_INK, lineHeight: 1 }}>+</span>
            </summary>
            <div style={{ padding: '0 4px 22px', display: 'grid', gap: 14, maxWidth: '80ch' }}>
              <div>
                <div style={{ ...mono, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: DIM, marginBottom: 6 }}>The defective text, verbatim</div>
                <blockquote style={{ ...serif, margin: 0, fontStyle: 'italic', fontSize: 15.5, lineHeight: 1.5, color: INK, borderLeft: `2px solid ${SEV_COLOR[d.severity]}`, paddingLeft: 16 }}>
                  “{d.quote}”
                </blockquote>
              </div>
              <div>
                <div style={{ ...mono, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: DIM, marginBottom: 6 }}>Why it’s wrong</div>
                <p style={{ margin: 0, fontSize: 14, color: '#B6B6C0', lineHeight: 1.6 }}>{d.finding}</p>
              </div>
              <div>
                <div style={{ ...mono, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#18B663', marginBottom: 6 }}>The fix</div>
                <p style={{ margin: 0, fontSize: 14, color: '#B6B6C0', lineHeight: 1.6 }}>{d.fix}</p>
              </div>
            </div>
          </details>
        ))}
        {rows.length === 0 ? <p style={{ ...mono, fontSize: 13, color: DIM, padding: '20px 0' }}>No defects match — try another term or severity.</p> : null}
      </div>
    </div>
  )
}
