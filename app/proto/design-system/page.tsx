import { ArchIcon, ARCH_ICON_KINDS, ARCH_ICON_GROUPS, type ArchIconKind } from '@/components/academy/visuals/arch-icons'

// TEMP gallery — sample of the proprietary "schematic / blueprint" component system
// (icon set + the signature part form). DELETE after review, then roll the winning
// form into DiagramNode so all 449 diagrams inherit it.

const INK = '#F2EFE9'
const MUTE = '#9598A2'
const LINE = '#1E1E24'
const BLUE = '#83AFFF' // blueprint annotation ink
const TONES = {
  default: { line: '#9598A2', ann: BLUE },
  accent: { line: '#3D5AFE', ann: '#83AFFF' },
  warning: { line: '#E5484D', ann: '#E5484D' },
  success: { line: '#18B663', ann: '#18B663' },
} as const
type ToneKey = keyof typeof TONES

/** The signature Sage "part": chamfered technical frame + corner ticks + a header
 *  band (kind · part-no in blueprint-blue) + the schematic glyph + label + a
 *  dimension line. All thin engineering linework. */
function SchematicPart({
  kind,
  label,
  part,
  tone = 'default',
}: {
  kind: ArchIconKind
  label: string
  part: string
  tone?: ToneKey
}) {
  const t = TONES[tone]
  return (
    <svg viewBox="0 0 244 100" width={244} height={100} style={{ overflow: 'visible' }}>
      {/* corner registration ticks (crop marks) */}
      <g stroke={t.ann} strokeWidth={1} opacity={0.7}>
        <path d="M2 10V2h8M234 2h8v8M2 90v8h8M242 90v8h-8" fill="none" />
      </g>
      {/* chamfered part frame (cut top-right corner = the schematic signature) */}
      <path
        d="M8 6H222L238 22V94H8Z"
        fill="var(--ac-surface, #111115)"
        stroke={t.line}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      {/* header band */}
      <line x1="8" y1="30" x2="238" y2="30" stroke={t.line} strokeWidth={1} opacity={0.6} />
      <text x="18" y="22" fill={t.ann} fontFamily="var(--ac-font-mono, monospace)" fontSize="9.5" letterSpacing="1.4">
        {kind.toUpperCase()}
      </text>
      <text x="230" y="22" textAnchor="end" fill={MUTE} fontFamily="var(--ac-font-mono, monospace)" fontSize="9.5">
        {part}
      </text>
      {/* glyph */}
      <g transform="translate(20 44)" style={{ color: t.line }}>
        <ArchIcon kind={kind} size={34} strokeWidth={1.4} />
      </g>
      {/* label */}
      <text x="66" y="62" fill={INK} fontFamily="var(--ac-font-display, Georgia, serif)" fontSize="18" fontWeight={500}>
        {label}
      </text>
      {/* dimension line (blueprint measure) */}
      <g stroke={t.ann} strokeWidth={0.9} opacity={0.6}>
        <path d="M20 78h198" fill="none" />
        <path d="M20 75v6M218 75v6" fill="none" />
      </g>
      <text x="119" y="76" textAnchor="middle" fill={t.ann} fontFamily="var(--ac-font-mono, monospace)" fontSize="8" opacity={0.8}>
        trust boundary
      </text>
    </svg>
  )
}

const SAMPLE_PARTS: { kind: ArchIconKind; label: string; part: string; tone: ToneKey }[] = [
  { kind: 'client', label: 'Browser', part: 'C-01', tone: 'default' },
  { kind: 'gateway', label: 'API Gateway', part: 'G-01', tone: 'accent' },
  { kind: 'auth', label: 'Auth service', part: 'A-01', tone: 'default' },
  { kind: 'service', label: 'Orders API', part: 'S-04', tone: 'default' },
  { kind: 'store', label: 'Orders DB', part: 'D-02', tone: 'success' },
  { kind: 'external', label: '3rd-party', part: 'X-01', tone: 'warning' },
  { kind: 'llm', label: 'Model', part: 'M-01', tone: 'accent' },
  { kind: 'queue', label: 'Job queue', part: 'Q-01', tone: 'default' },
]

export default function DesignSystemGallery() {
  return (
    <main style={{ background: '#0B0B0E', minHeight: '100vh', color: INK, padding: '48px clamp(16px,4vw,64px)' }}>
      <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.14em', color: BLUE, textTransform: 'uppercase' }}>
        Sage design system — schematic / blueprint (sample)
      </p>
      <h1 style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: 'clamp(2rem,1.4rem+2vw,3rem)', fontWeight: 500, margin: '8px 0 4px', letterSpacing: '-0.02em' }}>
        The architecture vocabulary
      </h1>
      <p style={{ color: MUTE, maxWidth: 620, lineHeight: 1.6 }}>
        Proprietary schematic glyphs + the signature Sage part form. Every component
        of a system, one drawing language — thin engineering linework, cut corners,
        blueprint annotations, part numbers, and semantic tone.
      </p>

      {/* the parts */}
      <h2 style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 12, letterSpacing: '0.12em', color: MUTE, textTransform: 'uppercase', marginTop: 48 }}>
        Components (the signature part form)
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 28, marginTop: 20, maxWidth: 1120 }}>
        {SAMPLE_PARTS.map((p) => (
          <SchematicPart key={p.part} {...p} />
        ))}
      </div>

      {/* the full glyph bank, grouped by category */}
      <h2 style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 12, letterSpacing: '0.12em', color: MUTE, textTransform: 'uppercase', marginTop: 56 }}>
        The component bank ({ARCH_ICON_KINDS.length})
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 20, maxWidth: 1120 }}>
        {ARCH_ICON_GROUPS.map((grp) => (
          <div key={grp.group}>
            <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.1em', color: BLUE, textTransform: 'uppercase', marginBottom: 10 }}>
              {grp.group} · {grp.kinds.length}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(116px, 1fr))', gap: 2, background: LINE, border: `1px solid ${LINE}` }}>
              {grp.kinds.map((k) => (
                <div key={k} style={{ background: '#111115', padding: '20px 10px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11 }}>
                  <span style={{ color: INK }}>
                    <ArchIcon kind={k} size={28} />
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9.5, color: MUTE, letterSpacing: '0.04em' }}>{k}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
