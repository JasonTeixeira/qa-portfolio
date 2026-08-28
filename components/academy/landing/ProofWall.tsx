import Link from 'next/link'

/**
 * "Receipts, not testimonials." The honest social-proof section: instead of
 * inventing quotes for a product with no cohort yet, it shows the receipts we
 * actually have — real catalog counts, the verbatim result of running our own
 * quality rule on our own lessons (the Wave-1 self-audit), and the verifiable-
 * certificate mechanism. The sample certificate is labelled a sample; every
 * real cert resolves at a public /verify link. Nothing here is fabricated.
 */

const INK = '#F2EFE9'
const LINE = '#1E1E24'
const GREEN = '#18B663'
const RED = '#E5484D'
const ACCENT = '#3D5AFE'

const mono = { fontFamily: 'var(--font-mono), monospace' } as const
const serif = { fontFamily: 'var(--font-serif), Georgia, serif' } as const

export function ProofWall({ coursesCount, lessonsCount }: { coursesCount: number; lessonsCount: number }) {
  const counters: [string, string][] = [
    [String(coursesCount), 'courses'],
    [String(lessonsCount), 'lessons'],
    ['73', 'defects we found in our own lessons'],
    ['34/34', 're-verified at ≥95'],
    ['100%', 'proofs verifiable by code'],
  ]

  return (
    <section id="receipts" style={{ borderTop: `1px solid ${LINE}`, background: '#0D0D11' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: 'clamp(56px, 8vw, 100px) clamp(20px, 4vw, 48px)' }}>
        <div style={{ maxWidth: 680 }}>
          <div style={{ ...mono, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#8FA0FF' }}>Proof, not promises</div>
          <h2 style={{ ...serif, margin: '14px 0 0', fontWeight: 600, fontSize: 'clamp(30px, 3.6vw, 48px)', lineHeight: 1.04, letterSpacing: '-0.025em', textWrap: 'balance' }}>
            We don&apos;t have testimonials. We have <em style={{ fontStyle: 'italic', color: '#8FA0FF' }}>receipts.</em>
          </h2>
          <p style={{ margin: '18px 0 0', color: '#9C9CA6', fontSize: 16.5, maxWidth: '60ch', textWrap: 'pretty' }}>
            No cohort has finished yet, so there are no quotes we&apos;d have to invent. What we do have: our own
            quality rule, run on our own lessons, in public — plus certificates a hiring manager can verify at a link.
          </p>
        </div>

        {/* Live counters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(24px, 4vw, 56px)', marginTop: 44, paddingBottom: 40, borderBottom: `1px solid ${LINE}` }}>
          {counters.map(([n, label]) => (
            <div key={label} style={{ minWidth: 0 }}>
              <div style={{ ...serif, fontWeight: 600, fontSize: 'clamp(30px, 3.6vw, 44px)', color: label.includes('verifiable') ? GREEN : INK, lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 13, color: '#9598A2', marginTop: 8, maxWidth: '18ch' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 20, marginTop: 40 }}>
          {/* Receipt 1: a real defect we found in our OWN lesson */}
          <div style={{ border: `1px solid ${LINE}`, borderRadius: 16, background: '#111115', padding: 28, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ ...mono, fontSize: 10, letterSpacing: '0.1em', color: RED, border: `1px solid rgba(229,72,77,0.4)`, borderRadius: 6, padding: '3px 8px' }}>CRITICAL · FOUND IN OUR OWN LESSON</span>
            </div>
            <p style={{ ...serif, margin: 0, fontSize: 19, lineHeight: 1.4, color: INK, letterSpacing: '-0.01em' }}>
              “The lesson taught a false error mechanism — a learner following our own advice, ‘read the error message,’
              would see their screen contradict the lesson.”
            </p>
            <p style={{ margin: '16px 0 0', fontSize: 13.5, color: '#9C9CA6', lineHeight: 1.6 }}>
              We caught it by running every code claim ourselves, quoted it verbatim, fixed it, and re-verified. That&apos;s
              the same rule every course has to pass before it reaches you.
            </p>
            <Link href="/academy/how-we-audit" style={{ ...mono, fontSize: 11.5, color: '#8FA0FF', textDecoration: 'underline', textUnderlineOffset: 3, marginTop: 20 }}>
              read all 73 receipts →
            </Link>
          </div>

          {/* Receipt 2: the verifiable certificate mechanism (sample, honestly labelled) */}
          <div style={{ border: `1px solid ${LINE}`, borderRadius: 16, background: '#111115', padding: 28, display: 'flex', flexDirection: 'column' }}>
            <div style={{ ...mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9598A2', marginBottom: 16 }}>The certificate a reviewer can check</div>
            <div style={{ border: `1px solid rgba(61,90,254,0.35)`, borderRadius: 12, background: 'linear-gradient(165deg, #0E1020, #0B0B0E)', padding: 22, position: 'relative' }}>
              <span style={{ ...mono, position: 'absolute', top: 12, right: 12, fontSize: 9, letterSpacing: '0.14em', color: '#5A5A64', border: `1px solid ${LINE}`, borderRadius: 5, padding: '2px 6px' }}>SAMPLE</span>
              <div style={{ ...mono, fontSize: 10, letterSpacing: '0.12em', color: '#8FA0FF' }}>SAGE ACADEMY · CERTIFICATE</div>
              <div style={{ ...serif, fontSize: 20, color: INK, margin: '10px 0 4px', letterSpacing: '-0.01em' }}>Engineering Judgment</div>
              <div style={{ fontSize: 12.5, color: '#9C9CA6' }}>proof of a completed sprint, checked by code</div>
              <div style={{ ...mono, display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontSize: 11, color: GREEN }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN }} /> VALID · verifiable at /verify/&lt;code&gt;
              </div>
            </div>
            <p style={{ margin: '16px 0 0', fontSize: 13.5, color: '#9C9CA6', lineHeight: 1.6 }}>
              Every real certificate resolves at a public link anyone can open — no login, no screenshot to trust. The proof
              is the point, not the paper.
            </p>
            <Link href="/academy/proof-not-paper" style={{ ...mono, fontSize: 11.5, color: '#8FA0FF', textDecoration: 'underline', textUnderlineOffset: 3, marginTop: 20 }}>
              why proof beats a paper credential →
            </Link>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginTop: 36 }}>
          <Link
            href="/academy/signup"
            style={{ display: 'inline-flex', alignItems: 'center', background: ACCENT, color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 600, padding: '15px 28px', borderRadius: 26, boxShadow: '0 0 22px rgba(61,90,254,0.35)' }}
          >
            Start building proof
          </Link>
          <Link href="/academy/how-we-audit" style={{ ...mono, fontSize: 12, color: '#8FA0FF', textDecoration: 'none' }}>
            see how we hold ourselves to this →
          </Link>
        </div>
      </div>
    </section>
  )
}
