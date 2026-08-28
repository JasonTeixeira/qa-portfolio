import type { Metadata } from 'next'
import Link from 'next/link'
import { AcademyNav } from '@/components/academy/marketing/AcademyNav'
import { AcademyFooter } from '@/components/academy/marketing/AcademyFooter'

const MONO = '"JetBrains Mono", monospace'
const DISPLAY = 'Fraunces, Georgia, serif'

// Real routes verified in-repo:
// - Course 00 "Engineering Judgment" → /academy/course/[slug] with the seed slug
//   'career-engineering_judgment_foundation' (GATE_COURSE_SLUG in
//   components/academy/path/PathDomainSection.tsx, line 14).
// - "See how proof works" → /academy/how-we-audit (the live proof/self-audit
//   page). why-proof was folded into this page (301), so its old destination
//   would self-loop; how-we-audit is where "how proof works" is actually shown.
// - "See the loop" → /academy/resources/sprint-loop (the real sprint-loop explainer,
//   app/academy/resources/sprint-loop/page.tsx).
const COURSE_00_HREF = '/academy/course/career-engineering_judgment_foundation'
const WHY_PROOF_HREF = '/academy/how-we-audit'
const SPRINT_LOOP_HREF = '/academy/resources/sprint-loop'

export const metadata: Metadata = {
  title: 'Proof, not paper · Sage Academy',
  description:
    'Forget the certificate. Ship the proof. A badge says you showed up. A proof says you can build — and anyone can check it. Our credential isn’t a printable PDF; it’s a verifiable, revocable proof record.',
}

const PROSE_STYLE = {
  margin: '28px 0 0',
  fontSize: 17.5,
  lineHeight: 1.75,
  color: '#B6B6C0',
  textWrap: 'pretty' as const,
}

const QUOTE_TEXT_STYLE = {
  fontFamily: DISPLAY,
  fontStyle: 'italic' as const,
  fontWeight: 500,
  fontSize: 'clamp(24px, 2.8vw, 32px)',
  lineHeight: 1.25,
  letterSpacing: '-0.012em',
  color: '#F2EFE9',
}

const EYEBROW_STYLE = {
  fontFamily: MONO,
  fontSize: 11.5,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.16em',
  color: '#8FA0FF',
}

const H2_STYLE = {
  margin: '0 0 4px',
  fontFamily: DISPLAY,
  fontWeight: 600,
  fontSize: 'clamp(28px, 4vw, 46px)',
  lineHeight: 1.02,
  letterSpacing: '-0.02em',
  textWrap: 'balance' as const,
}

// The centerpiece contrast. Left = the certificate (illustrative, deliberately
// generic — no vendor named). Right = the proof (every line true to the product,
// see the "grounded in" comments below the component).
type ContrastRow = {
  cert: string
  proof: string
}

const CONTRAST_ROWS: ContrastRow[] = [
  {
    cert: 'Proves you showed up',
    proof: 'Proves you shipped a defensible artifact',
  },
  {
    cert: 'A PDF you print',
    proof: 'A public URL anyone can verify',
  },
  {
    cert: 'Multiple-choice, self-graded',
    proof: 'Passed a real server-side check',
  },
  {
    cert: 'Unverifiable once it leaves your inbox',
    proof: 'Lives in an evidence ledger you can export',
  },
  {
    cert: 'Never revoked, expires on a calendar',
    proof: 'Revoked only when the proof stops holding',
  },
]

// Each card maps to a real mechanism in the codebase — cited in the comment.
type MechanismCard = {
  tag: string
  title: string
  body: string
  accent: string
}

const MECHANISM_CARDS: MechanismCard[] = [
  {
    // lib/academy/scaffold.ts — 'sprint-contract' + 'unlock-gate' node types.
    tag: 'sprint contract · unlock gate',
    title: 'You advance by proving, not watching',
    body: 'A lesson opens the next only when its criteria are met. There is no "mark complete" button to click your way past — the gate reads your proof, not your attendance.',
    accent: '#3D5AFE',
  },
  {
    // app/academy/_actions/evidence.ts — verifyLab().
    tag: 'server-checked labs',
    title: 'The lab starter fails until you do the work',
    body: 'Lab submissions are checked on the server, not in your browser. A green result is a claim someone else could re-run — which is the only kind of green worth anything.',
    accent: '#18B663',
  },
  {
    // app/api/academy/export/route.ts + lib/academy/evidence.ts.
    tag: 'evidence ledger · export',
    title: 'Every proof lands in a ledger you own',
    body: 'Sprints proven, courses completed, artifacts built — all recorded, and all exportable as a single JSON file you (or an employer) can keep and audit independently.',
    accent: '#E0A93E',
  },
  {
    // app/academy/certificate/[code]/page.tsx — the URL is the verify endpoint.
    tag: 'verifiable proof record',
    title: 'The certificate URL is the verification',
    body: 'There is no separate "verify" step to trust. The public certificate page itself reports status — VALID or REVOKED — from the same fields anyone can read.',
    accent: '#8FA0FF',
  },
]

export default function ProofNotPaperPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(120% 80% at 50% -10%, rgba(255,255,255,0.035) 0%, transparent 55%) #0B0B0E',
        color: '#F2EFE9',
        fontFamily: '"Hanken Grotesk", sans-serif',
        fontSize: 16,
        lineHeight: 1.6,
        overflowX: 'hidden',
      }}
    >
      {/* Focus-visible ring for article links. Inline styles cannot express
          :focus-visible; this scoped rule satisfies SC 2.4.11. */}
      <style>{`
        main a:focus-visible {
          outline: 2px solid #3D5AFE;
          outline-offset: 3px;
          border-radius: 4px;
        }
      `}</style>

      {/* Nav */}
      <AcademyNav />

      <main>
      <article
        style={{
          maxWidth: 820,
          margin: '0 auto',
          padding:
            'clamp(56px, 8vw, 112px) clamp(20px, 4vw, 48px) clamp(64px, 9vw, 110px)',
        }}
      >
        {/* 1 · Hero */}
        <header>
          <div style={EYEBROW_STYLE}>The wedge · credentialism</div>
          <h1
            style={{
              margin: '20px 0 0',
              fontFamily: DISPLAY,
              fontWeight: 600,
              fontSize: 'clamp(44px, 7.5vw, 104px)',
              lineHeight: 0.96,
              letterSpacing: '-0.032em',
              textWrap: 'balance',
            }}
          >
            Forget the certificate.
            <br />
            <em style={{ fontStyle: 'italic', fontWeight: 500, color: '#18B663' }}>
              Ship the proof.
            </em>
          </h1>
          <p style={{ ...PROSE_STYLE, marginTop: 32, fontSize: 19, color: '#C9C9D2' }}>
            A badge says you showed up. A proof says you can build — and anyone
            can check it.
          </p>
        </header>

        {/* 2 · The enemy */}
        <section style={{ marginTop: 'clamp(56px, 8vw, 96px)' }}>
          <div style={EYEBROW_STYLE}>The enemy</div>
          <h2 style={{ ...H2_STYLE, marginTop: 18 }}>Certification theater</h2>
          <p style={PROSE_STYLE}>
            There is a whole industry built on a quiet swap: it sells attendance
            and memorization, then dresses them up as competence. You sit
            through the material. You answer questions someone else wrote, in an
            order someone else picked, from options someone else supplied. A
            certificate prints. And now — supposedly — you can build the thing.
          </p>
          <p style={PROSE_STYLE}>
            That is the abstraction worth naming as the enemy. Not any one
            program or vendor — the <em>lie</em> underneath all of them: that a
            badge, a PDF, or a passed multiple-choice exam is the same as
            standing up a working system under real constraints. It isn&apos;t.
            A credential that proves you sat through it is not a credential that
            proves you can ship it.
          </p>
          <blockquote
            style={{
              margin: '40px 0 0',
              padding: '8px 0 8px 28px',
              borderLeft: '2px solid #E5484D',
            }}
          >
            <span style={QUOTE_TEXT_STYLE}>
              A badge is a receipt for time spent. Nobody hires a receipt.
            </span>
          </blockquote>
        </section>

        {/* 3 · The contrast — the centerpiece */}
        <section style={{ marginTop: 'clamp(56px, 8vw, 96px)' }}>
          <div style={EYEBROW_STYLE}>The contrast</div>
          <h2 style={{ ...H2_STYLE, marginTop: 18 }}>
            The certificate vs. the proof
          </h2>
          <p style={{ ...PROSE_STYLE, marginBottom: 8 }}>
            Same ambition, opposite standard of evidence. One asks you to trust
            it. The other hands you a link and dares you to check.
          </p>

          {/* Illustrative comparison — conceptual, not live data. */}
          <figure
            aria-label="Illustration: a certificate compared line-by-line against a verifiable proof record"
            style={{
              margin: '28px 0 0',
              border: '1px solid #1E1E24',
              borderRadius: 16,
              background: '#111115',
              overflow: 'hidden',
            }}
          >
            {/* header row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                borderBottom: '1px solid #1E1E24',
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  borderRight: '1px solid #1E1E24',
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: '#E5484D',
                  }}
                >
                  ▲ The certificate
                </div>
                <div style={{ fontSize: 12.5, color: '#7A7A84', marginTop: 6 }}>
                  what a badge actually attests
                </div>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: '#18B663',
                  }}
                >
                  ✓ The proof
                </div>
                <div style={{ fontSize: 12.5, color: '#7A7A84', marginTop: 6 }}>
                  what a proof record attests
                </div>
              </div>
            </div>

            {CONTRAST_ROWS.map((row, i) => (
              <div
                key={row.proof}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  borderBottom:
                    i < CONTRAST_ROWS.length - 1 ? '1px solid #1E1E24' : 'none',
                }}
              >
                <div
                  style={{
                    padding: '15px 20px',
                    borderRight: '1px solid #1E1E24',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: 14,
                    color: '#9598A2',
                  }}
                >
                  <span
                    aria-hidden
                    style={{ color: '#E5484D', lineHeight: 1.4 }}
                  >
                    ✕
                  </span>
                  <span>{row.cert}</span>
                </div>
                <div
                  style={{
                    padding: '15px 20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: 14,
                    color: '#E4E2DC',
                    fontWeight: 500,
                  }}
                >
                  <span
                    aria-hidden
                    style={{ color: '#18B663', lineHeight: 1.4 }}
                  >
                    ✓
                  </span>
                  <span>{row.proof}</span>
                </div>
              </div>
            ))}
            <figcaption
              style={{
                padding: '11px 20px',
                borderTop: '1px solid #1E1E24',
                fontFamily: MONO,
                fontSize: 9.5,
                letterSpacing: '0.06em',
                color: '#4A4A54',
              }}
            >
              Illustrative comparison · not live data
            </figcaption>
          </figure>
        </section>

        {/* 4 · How proof works here */}
        <section style={{ marginTop: 'clamp(56px, 8vw, 96px)' }}>
          <div style={EYEBROW_STYLE}>The mechanism</div>
          <h2 style={{ ...H2_STYLE, marginTop: 18 }}>How proof works here</h2>
          <p style={{ ...PROSE_STYLE, marginBottom: 4 }}>
            Nothing above is a slogan. Each line maps to a real gate in the
            product — here is what enforces it.
          </p>

          <div
            style={{
              marginTop: 28,
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: 14,
            }}
          >
            {MECHANISM_CARDS.map((card) => (
              <div
                key={card.title}
                style={{
                  border: '1px solid #1E1E24',
                  borderRadius: 16,
                  background: '#111115',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: card.accent,
                  }}
                >
                  {card.tag}
                </span>
                <span
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 600,
                    fontSize: 20,
                    lineHeight: 1.15,
                    letterSpacing: '-0.01em',
                    color: '#F2EFE9',
                  }}
                >
                  {card.title}
                </span>
                <span style={{ fontSize: 14, lineHeight: 1.6, color: '#9598A2' }}>
                  {card.body}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 5 · The turn — our own credential, reframed */}
        <section style={{ marginTop: 'clamp(56px, 8vw, 96px)' }}>
          <div style={EYEBROW_STYLE}>The turn</div>
          <h2 style={{ ...H2_STYLE, marginTop: 18 }}>
            So yes — you earn a certificate here
          </h2>
          <p style={PROSE_STYLE}>
            Let&apos;s be honest about the tension. This academy does issue a
            certificate. The difference is what stands behind it. Ours is not
            paper you print and file away — it&apos;s a proof record. You shipped
            a defensible artifact, it passed a real check, and it lives at a
            public URL where the certificate page itself reports its status.
          </p>

          {/* Real verify shape — mirrors the fields on the public certificate page.
              app/academy/certificate/[code]/page.tsx →
              components/academy/certificate/Certificate.tsx. Illustrative code. */}
          <figure
            aria-label="Illustration: the verify response shape a public certificate page returns"
            style={{
              margin: '28px 0 0',
              border: '1px solid #1E1E24',
              borderRadius: 14,
              background: '#0E0E12',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 18px',
                borderBottom: '1px solid #1E1E24',
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: '0.06em',
                  color: '#9598A2',
                }}
              >
                $ curl sageideas.dev/academy/certificate/&lt;code&gt;
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  letterSpacing: '0.1em',
                  padding: '3px 9px',
                  borderRadius: 5,
                  color: '#18B663',
                  border: '1px solid rgba(24,182,99,0.4)',
                  background: 'rgba(24,182,99,0.07)',
                }}
              >
                VALID
              </span>
            </div>
            <pre
              style={{
                margin: 0,
                padding: '16px 18px',
                fontFamily: MONO,
                fontSize: 12.5,
                lineHeight: 1.7,
                color: '#B6B6C0',
                overflowX: 'auto',
              }}
            >
              <code>
                {'{ "status": "VALID", "proofs_held": 6,\n'}
                {'  "revoked": false }'}
              </code>
            </pre>
            <figcaption
              style={{
                padding: '9px 18px',
                borderTop: '1px solid #1E1E24',
                fontFamily: MONO,
                fontSize: 9.5,
                letterSpacing: '0.06em',
                color: '#4A4A54',
              }}
            >
              Illustrative shape · the URL is the verify endpoint
            </figcaption>
          </figure>

          <p style={PROSE_STYLE}>
            And it stands only as long as the proof holds. A calendar
            doesn&apos;t expire it and a subscription doesn&apos;t renew it —
            it&apos;s revocable, tied to the artifact underneath. That&apos;s the
            whole reframe: not a certificate you keep, a certificate you can
            actually verify.
          </p>
          <blockquote
            style={{
              margin: '40px 0 0',
              padding: '8px 0 8px 28px',
              borderLeft: '2px solid #18B663',
            }}
          >
            <span style={QUOTE_TEXT_STYLE}>
              Not paper you keep. A proof record anyone can check.
            </span>
          </blockquote>
        </section>

        {/* 6 · CTA row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            marginTop: 'clamp(56px, 8vw, 88px)',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href={COURSE_00_HREF}
            style={{
              display: 'inline-flex',
              color: '#fff',
              background: '#3D5AFE',
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
          </Link>
          <Link
            href={WHY_PROOF_HREF}
            style={{
              display: 'inline-flex',
              color: '#F2EFE9',
              border: '1px solid #2A2A33',
              textDecoration: 'none',
              fontSize: 15,
              padding: '14px 28px',
              borderRadius: 26,
              whiteSpace: 'nowrap',
            }}
          >
            See how proof works
          </Link>
          <Link
            href={SPRINT_LOOP_HREF}
            style={{
              display: 'inline-flex',
              color: '#9598A2',
              textDecoration: 'none',
              fontSize: 15,
              padding: '14px 22px',
              borderRadius: 26,
              whiteSpace: 'nowrap',
            }}
          >
            See the loop →
          </Link>
        </div>
      </article>
      </main>

      <AcademyFooter tagline="forget the certificate → ship the proof" />
    </div>
  )
}
