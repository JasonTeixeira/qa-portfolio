import Link from 'next/link';

/* ── Fixed dark palette (design spec) ── */
const C = {
  panelBg: '#0D0D11',
  surface: '#111115',
  text: '#F2EFE9',
  muted: '#9598A2',
  line: '#1E1E24',
  green: '#18B663',
  accent: '#3D5AFE',
  accentInk: '#8FA0FF',
  dim: '#B6B6C0',
  faint: '#4A4A54',
} as const;

const FONT_DISPLAY = 'var(--ac-font-display, Fraunces, Georgia, serif)';
const FONT_MONO = "var(--ac-font-mono, 'JetBrains Mono', ui-monospace, monospace)";

/**
 * Left value-prop panel of the Academy auth split screen. Presentation only —
 * pure static content, no auth wiring. Hidden below the split breakpoint.
 */
export function AcademyValuePanel() {
  return (
    <div
      style={{
        background:
          'radial-gradient(80% 60% at 30% 0%, rgba(61,90,254,0.09) 0%, transparent 60%) ' +
          C.panelBg,
        borderRight: `1px solid ${C.line}`,
        padding: 'clamp(32px, 5vw, 64px)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 300,
      }}
    >
      {/* Logo */}
      <Link
        href="/academy"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
          color: 'inherit',
          alignSelf: 'flex-start',
        }}
      >
        <span
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 26,
            height: 26,
            borderRadius: 8,
            background: C.accent,
            color: '#fff',
            fontSize: 12,
            boxShadow: '0 0 18px rgba(61,90,254,0.35)',
          }}
        >
          ◆
        </span>
        <span style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.01em', color: C.text }}>
          Sage Academy
        </span>
      </Link>

      {/* Headline + proof card */}
      <div style={{ margin: 'auto 0', padding: '40px 0' }}>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            fontSize: 'clamp(26px, 2.8vw, 38px)',
            lineHeight: 1.1,
            letterSpacing: '-0.022em',
            maxWidth: '18ch',
            textWrap: 'balance',
            color: C.text,
          }}
        >
          In 25 minutes, you&rsquo;ll have shipped your first{' '}
          <em style={{ fontStyle: 'italic', fontWeight: 500, color: C.accentInk }}>proof.</em>
        </div>

        {/* Mini artifact / proof card */}
        <div
          style={{
            marginTop: 28,
            border: `1px solid ${C.line}`,
            borderRadius: 12,
            background: C.surface,
            overflow: 'hidden',
            maxWidth: 430,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '13px 18px',
              borderBottom: `1px solid ${C.line}`,
            }}
          >
            <span style={dot} />
            <span style={{ fontSize: 13, color: '#B6B6C0', flex: 1 }}>
              Framed the incident as a question
            </span>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                letterSpacing: '0.08em',
                padding: '3px 8px',
                borderRadius: 4,
                color: C.green,
                border: '1px solid rgba(24,182,99,0.4)',
                whiteSpace: 'nowrap',
              }}
            >
              PASSED
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px' }}>
            <span style={dot} />
            <span style={{ fontSize: 13, color: '#B6B6C0', flex: 1 }}>
              decision-memo.md · row one of your ledger
            </span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.accentInk, whiteSpace: 'nowrap' }}>
              +25 min ↑
            </span>
          </div>
        </div>

        {/* Social proof line */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 28,
            flexWrap: 'wrap',
            fontFamily: FONT_MONO,
            fontSize: 11,
            color: C.muted,
          }}
        >
          <span>
            <span style={{ color: C.text }}>12,480</span> engineers
          </span>
          <span>
            <span style={{ color: C.green }}>2,847</span> proofs this week
          </span>
          <span>
            <span style={{ color: C.text }}>14-day</span> honest guarantee
          </span>
        </div>
      </div>

      {/* Footer strip */}
      <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.faint }}>
        frame → route → map → decide → prove
      </div>
    </div>
  );
}

const dot: React.CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: '50%',
  background: '#18B663',
  flexShrink: 0,
};
