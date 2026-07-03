'use client'

import * as React from 'react'

/* ── Design palette (exact hex from Sage Academy "How It Works" source) ──── */
const C = {
  bg: '#0B0B0E',
  surface: '#111115',
  panel: '#08080A',
  text: '#F2EFE9',
  sub: '#9C9CA6',
  muted: '#9598A2',
  faint: '#4A4A54',
  line: '#1E1E24',
  lineStrong: '#2A2A33',
  accent: '#3D5AFE',
  accentSoft: '#8FA0FF',
  green: '#18B663',
  gold: '#E0A93E',
  coral: '#E5484D',
} as const

const SERIF = 'Fraunces, Georgia, serif'
const MONO = '"JetBrains Mono", ui-monospace, monospace'

/* Accent color per step marker (matches the source step index colors). */
type Accent = 'accent' | 'gold' | 'green' | 'coral'
const ACCENT_HEX: Record<Accent, string> = {
  accent: C.accentSoft,
  gold: C.gold,
  green: C.green,
  coral: C.coral,
}

interface Step {
  n: string
  name: string
  body: string
  accent: Accent
  card: React.ReactNode
}

/* ── Loop steps: title + copy + illustration card (operator-authored) ────── */
const STEPS: Step[] = [
  {
    n: '01',
    name: 'Frame',
    accent: 'accent',
    body: 'Turn a messy stake into a precise, falsifiable question. Most engineers debug the wrong problem beautifully — framing is the skill that stops that.',
    card: <FrameCard />,
  },
  {
    n: '02',
    name: 'Route',
    accent: 'accent',
    body: 'Choose where to look first: cheapest disproof wins. Two paths get ruled out on paper before you touch anything.',
    card: <RouteCard />,
  },
  {
    n: '03',
    name: 'Map',
    accent: 'gold',
    body: 'Draw the system with directions, owners, and defended omissions. The failure becomes a location, not a vibe.',
    card: <MapCard />,
  },
  {
    n: '04',
    name: 'Decide',
    accent: 'accent',
    body: 'Commit in writing: options, costs, and the constraint that forced your hand. A memo, not a hunch.',
    card: <DecideCard />,
  },
  {
    n: '05',
    name: 'Prove',
    accent: 'green',
    body: "A concrete check a skeptic can run. The starter fails; your fix passes; the output can't be faked.",
    card: <ProveCard />,
  },
  {
    n: '06',
    name: 'Review',
    accent: 'gold',
    body: 'Your artifact is read the way a staff engineer reads it — your score is capped by the weakest claim.',
    card: <ReviewCard />,
  },
  {
    n: '07',
    name: 'Repair',
    accent: 'coral',
    body: 'Broken cases are the curriculum. One repair lifts the cap — and teaches more than ten passing runs.',
    card: <RepairCard />,
  },
  {
    n: '08',
    name: 'Space',
    accent: 'accent',
    body: "Recall prompts arrive on the forgetting curve's schedule, not yours. Six minutes, then back to work.",
    card: <SpaceCard />,
  },
  {
    n: '09',
    name: 'Transfer',
    accent: 'accent',
    body: "The same move, applied in a new domain. That's the moment knowledge becomes judgment.",
    card: <TransferCard />,
  },
  {
    n: '10',
    name: 'Package',
    accent: 'green',
    body: 'The artifact joins your ledger: claim, artifact, verdict. Shareable, verifiable, yours.',
    card: <PackageCard />,
  },
]

export function HowItWorksContent() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(120% 80% at 50% -10%, rgba(255,255,255,0.035) 0%, transparent 55%) ' +
          C.bg,
        color: C.text,
        fontFamily: '"Hanken Grotesk", var(--font-sans), sans-serif',
        fontSize: 16,
        lineHeight: 1.6,
        overflowX: 'hidden',
      }}
    >
      {/* Hero */}
      <header
        style={{
          maxWidth: 920,
          margin: '0 auto',
          padding:
            'clamp(96px, 11vw, 152px) clamp(20px, 4vw, 48px) clamp(40px, 5vw, 64px)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11.5,
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: C.accentSoft,
          }}
        >
          The mastery loop
        </div>
        <h1
          style={{
            margin: '18px auto 0',
            fontFamily: SERIF,
            fontWeight: 600,
            fontSize: 'clamp(38px, 5.4vw, 72px)',
            lineHeight: 1,
            letterSpacing: '-0.028em',
            maxWidth: '18ch',
            textWrap: 'balance',
          }}
        >
          Frame it. Map it. Prove it.
        </h1>
        <p
          style={{
            margin: '22px auto 0',
            color: C.sub,
            fontSize: 17,
            maxWidth: '56ch',
            textWrap: 'pretty',
          }}
        >
          Every course is an instance of the loop senior engineers run on
          autopilot. Ten moves, each one visible, each one ending in something a
          reviewer can inspect.
        </p>
      </header>

      {/* The loop */}
      <section
        aria-label="The mastery loop"
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding:
            '24px clamp(20px, 4vw, 48px) clamp(56px, 8vw, 96px)',
        }}
      >
        {STEPS.map((s, i) => (
          <LoopRow key={s.n} step={s} flip={i % 2 === 1} index={i} />
        ))}
      </section>

      {/* Closing CTA */}
      <section
        style={{ borderTop: `1px solid ${C.line}`, background: '#0D0D11' }}
      >
        <div
          style={{
            maxWidth: 780,
            margin: '0 auto',
            padding:
              'clamp(56px, 8vw, 96px) clamp(20px, 4vw, 48px)',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              margin: '0 auto',
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 'clamp(28px, 3.4vw, 44px)',
              lineHeight: 1.06,
              letterSpacing: '-0.022em',
              maxWidth: '24ch',
              textWrap: 'balance',
            }}
          >
            In 25 minutes you&rsquo;ll turn a messy incident into a decision a
            reviewer can inspect.
          </h2>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
              marginTop: 28,
              flexWrap: 'wrap',
            }}
          >
            <a
              href="/academy?source=how-it-works"
              className="hiw-cta-primary"
              style={{
                display: 'inline-flex',
                color: '#fff',
                background: C.accent,
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 600,
                padding: '15px 28px',
                borderRadius: 26,
                boxShadow: '0 0 24px rgba(61,90,254,0.35)',
                whiteSpace: 'nowrap',
              }}
            >
              Start with Engineering Judgment
            </a>
            <a
              href="/academy"
              className="hiw-cta-ghost"
              style={{
                display: 'inline-flex',
                color: C.text,
                border: `1px solid ${C.lineStrong}`,
                textDecoration: 'none',
                fontSize: 15,
                padding: '14px 28px',
                borderRadius: 26,
                whiteSpace: 'nowrap',
              }}
            >
              Browse the catalog
            </a>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${C.line}` }}>
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '30px clamp(20px, 4vw, 48px)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted }}>
            Sage Academy · frame → route → map → decide → prove
          </span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.faint }}>
            © 2026 Sage Ideas LLC
          </span>
        </div>
      </footer>

      <style>{`
        .hiw-cta-primary { transition: transform .2s ease, box-shadow .2s ease; }
        .hiw-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 0 32px rgba(61,90,254,0.5); }
        .hiw-cta-ghost { transition: border-color .2s ease, color .2s ease; }
        .hiw-cta-ghost:hover { border-color: rgba(61,90,254,0.55); }
      `}</style>
    </div>
  )
}

/* ── One loop row: copy column + illustration card, alternating sides ────── */
function LoopRow({
  step,
  flip,
  index,
}: {
  step: Step
  flip: boolean
  index: number
}) {
  return (
    <div
      id={`step-${index + 1}`}
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
        gap: 'clamp(20px, 3vw, 44px)',
        alignItems: 'center',
        padding: 'clamp(28px, 4vw, 44px) 0',
        borderBottom: `1px solid ${C.line}`,
        direction: flip ? 'rtl' : 'ltr',
      }}
    >
      {/* Copy column */}
      <div style={{ direction: 'ltr', position: 'relative' }}>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: -8,
            top: -34,
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 88,
            lineHeight: 1,
            color: 'rgba(255,255,255,0.05)',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {step.n}
        </div>
        <div style={{ position: 'relative' }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: ACCENT_HEX[step.accent],
              marginBottom: 10,
            }}
          >
            {step.n} / 10
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 'clamp(26px, 2.8vw, 36px)',
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
            }}
          >
            {step.name}
          </div>
          <p
            style={{
              margin: '14px 0 0',
              color: C.sub,
              fontSize: 15,
              maxWidth: '46ch',
              textWrap: 'pretty',
            }}
          >
            {step.body}
          </p>
        </div>
      </div>

      {/* Illustration card */}
      <div
        style={{
          direction: 'ltr',
          border: `1px solid ${C.line}`,
          borderRadius: 16,
          background: C.surface,
          padding: 24,
          minHeight: 170,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        {step.card}
      </div>
    </div>
  )
}

/* ── Illustration cards ──────────────────────────────────────────────────── */

function Chip({
  children,
  dashed,
  color = C.muted,
}: {
  children: React.ReactNode
  dashed?: boolean
  color?: string
}) {
  return (
    <span
      style={{
        border: `1px ${dashed ? 'dashed' : 'solid'} ${C.lineStrong}`,
        borderRadius: 6,
        padding: '7px 12px',
        fontFamily: MONO,
        fontSize: 10.5,
        color,
      }}
    >
      {children}
    </span>
  )
}

function FrameCard() {
  return (
    <>
      <div
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8, opacity: 0.6 }}
      >
        <Chip dashed>3am pager</Chip>
        <Chip dashed>angry ticket</Chip>
        <Chip dashed>red graph</Chip>
      </div>
      <div style={{ color: C.faint, fontSize: 16, paddingLeft: 4 }}>↓</div>
      <div
        style={{
          border: '1.5px solid rgba(61,90,254,0.55)',
          background: 'rgba(61,90,254,0.07)',
          borderRadius: 9,
          padding: '12px 16px',
          fontSize: 14,
          color: C.text,
          fontWeight: 500,
        }}
      >
        &ldquo;Where can a charge be issued twice?&rdquo;
      </div>
    </>
  )
}

function RouteRow({
  label,
  active,
}: {
  label: string
  active?: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span
        style={{
          width: active ? 56 : 34,
          borderTop: active
            ? `2px solid ${C.accent}`
            : `1.5px dashed ${C.lineStrong}`,
        }}
      />
      {active ? (
        <span
          style={{
            border: '1.5px solid rgba(61,90,254,0.55)',
            background: 'rgba(61,90,254,0.07)',
            borderRadius: 7,
            padding: '8px 13px',
            fontSize: 13,
            color: C.text,
          }}
        >
          {label}
        </span>
      ) : (
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            color: C.faint,
            textDecoration: 'line-through',
          }}
        >
          {label}
        </span>
      )}
    </div>
  )
}

function RouteCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <RouteRow label="check the client" />
      <RouteRow label="trace the retry path" active />
      <RouteRow label="blame the CDN" />
    </div>
  )
}

function MapCard() {
  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            border: `1px solid ${C.lineStrong}`,
            borderRadius: 7,
            padding: '8px 12px',
            fontSize: 12,
            color: C.muted,
            background: '#141418',
          }}
        >
          checkout
        </span>
        <span style={{ color: C.faint }}>→</span>
        <span
          style={{
            border: `1.5px solid ${C.gold}`,
            borderRadius: 7,
            padding: '8px 12px',
            fontSize: 12,
            color: C.text,
            background: 'rgba(224,169,62,0.08)',
          }}
        >
          retry path
        </span>
        <span style={{ color: C.faint }}>→</span>
        <span
          style={{
            border: `1.5px solid ${C.green}`,
            borderRadius: 11,
            padding: '8px 12px',
            fontSize: 12,
            color: C.text,
            background: 'rgba(24,182,99,0.08)',
          }}
        >
          ledger
        </span>
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10.5,
          color: C.muted,
          borderTop: `1px solid ${C.line}`,
          paddingTop: 10,
        }}
      >
        every omission carries a written defense
      </div>
    </>
  )
}

function DecideCard() {
  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}
      >
        <div
          style={{
            border: `1px solid ${C.lineStrong}`,
            borderRadius: 9,
            padding: 13,
            fontSize: 12.5,
            color: C.muted,
          }}
        >
          distributed locks
        </div>
        <div
          style={{
            border: '1.5px solid rgba(24,182,99,0.55)',
            background: 'rgba(24,182,99,0.06)',
            borderRadius: 9,
            padding: 13,
            fontSize: 12.5,
            color: C.text,
          }}
        >
          ✓ idempotency keys
        </div>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.muted }}>
        the &ldquo;why&rdquo; is written down
      </div>
    </>
  )
}

function ProveCard() {
  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.line}`,
        borderRadius: 10,
        padding: '14px 16px',
        fontFamily: MONO,
        fontSize: 11.5,
        lineHeight: 1.9,
      }}
    >
      <div style={{ color: C.muted }}>$ npm run check</div>
      <div style={{ color: C.muted }}>3 retries issued → 1 charge recorded</div>
      <div style={{ color: C.green }}>✓ PASS — can&rsquo;t be faked</div>
    </div>
  )
}

function ReviewCard() {
  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: MONO,
          fontSize: 10.5,
          color: C.muted,
        }}
      >
        <span>MASTERY</span>
        <span style={{ color: C.gold }}>78</span>
      </div>
      <div
        style={{
          position: 'relative',
          height: 8,
          borderRadius: 4,
          background: '#1A1A20',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '78%',
            borderRadius: 4,
            background: 'linear-gradient(90deg, #3D5AFE, #6E83FF)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '78%',
            top: -4,
            bottom: -4,
            width: 2,
            background: C.gold,
          }}
        />
      </div>
      <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.gold }}>
        capped by PROOF — one claim didn&rsquo;t hold
      </div>
    </>
  )
}

function RepairCard() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flexWrap: 'wrap',
      }}
    >
      <span
        style={{
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: 34,
          color: C.coral,
        }}
      >
        71
      </span>
      <span style={{ color: C.faint, fontSize: 18 }}>→</span>
      <span
        style={{
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: 34,
          color: C.green,
        }}
      >
        94
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10.5,
          color: C.muted,
          marginLeft: 'auto',
        }}
      >
        the repair IS the lesson
      </span>
    </div>
  )
}

function SpaceCard() {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <SpaceDot />
        <span style={{ flex: '1 1 0%', borderTop: '1.5px solid #26262E' }} />
        <SpaceDot />
        <span style={{ flex: '2 1 0%', borderTop: '1.5px solid #26262E' }} />
        <SpaceDot />
        <span style={{ flex: '4 1 0%', borderTop: '1.5px solid #26262E' }} />
        <SpaceDot hollow />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: MONO,
          fontSize: 10,
          color: C.muted,
        }}
      >
        <span>1d</span>
        <span>3d</span>
        <span>7d</span>
        <span style={{ color: C.green }}>30d</span>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.muted }}>
        it holds under pressure, not just until the quiz
      </div>
    </>
  )
}

function SpaceDot({ hollow }: { hollow?: boolean }) {
  return (
    <span
      style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        flexShrink: 0,
        ...(hollow
          ? { border: `2px solid ${C.green}`, background: 'transparent' }
          : { background: C.accent }),
      }}
    />
  )
}

function TransferCard() {
  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          alignItems: 'stretch',
        }}
      >
        <div
          style={{
            border: `1px solid ${C.line}`,
            borderRadius: 9,
            padding: 13,
            textAlign: 'center',
          }}
        >
          <TransferGlyph />
          <div style={{ fontFamily: MONO, fontSize: 10, color: C.muted }}>
            payments: retries
          </div>
        </div>
        <div
          style={{
            border: '1.5px solid rgba(61,90,254,0.4)',
            borderRadius: 9,
            padding: 13,
            textAlign: 'center',
            background: 'rgba(61,90,254,0.04)',
          }}
        >
          <TransferGlyph />
          <div style={{ fontFamily: MONO, fontSize: 10, color: C.muted }}>
            email: duplicate sends
          </div>
        </div>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.muted }}>
        same shape, new domain
      </div>
    </>
  )
}

function TransferGlyph() {
  return (
    <div
      style={{
        width: 14,
        height: 14,
        background: 'rgba(61,90,254,0.5)',
        border: `1.5px solid ${C.accent}`,
        transform: 'rotate(45deg)',
        margin: '4px auto 10px',
      }}
    />
  )
}

function PackageCard() {
  return (
    <div
      style={{
        border: `1px solid ${C.line}`,
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 15px',
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        <span
          style={{
            fontSize: 13,
            color: C.text,
            fontWeight: 500,
            flex: '1 1 0%',
          }}
        >
          Can bound a change before shipping
        </span>
        <span style={{ fontFamily: MONO, fontSize: 10, color: C.accentSoft }}>
          decision-memo.md
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 8.5,
            letterSpacing: '0.08em',
            padding: '3px 8px',
            borderRadius: 4,
            color: C.green,
            border: '1px solid rgba(24,182,99,0.4)',
            background: 'rgba(24,182,99,0.07)',
          }}
        >
          PASSED
        </span>
      </div>
      <div
        style={{
          padding: '10px 15px',
          fontFamily: MONO,
          fontSize: 10,
          color: C.muted,
        }}
      >
        row 14 of your evidence ledger
      </div>
    </div>
  )
}
