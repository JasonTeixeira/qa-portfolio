/**
 * Objection-crushing FAQ. Native <details>/<summary> — accessible, keyboard-
 * friendly, zero JS. Answers stay in the honest, proof-first voice; the job
 * question is answered straight (we don't promise a job), which is itself the
 * trust move. FAQPage JSON-LD for rich results.
 */

import Link from 'next/link'

const INK = '#F2EFE9'
const LINE = '#1E1E24'

const mono = { fontFamily: 'var(--font-mono), monospace' } as const
const serif = { fontFamily: 'var(--font-serif), Georgia, serif' } as const

type QA = { q: string; a: string }

const FAQS: QA[] = [
  {
    q: 'I’m a total beginner — is this too advanced?',
    a: 'No. Courses start at your first line of code. Every lesson hands you something broken, you fix it, and a check confirms it — so you’re always doing, never just watching. You can read a full lesson free before you decide.',
  },
  {
    q: '$25 a month — what’s the catch?',
    a: 'None. You start with a 7-day free trial — full access, cancel anytime, and we remind you before it renews. After that it’s $25/month with a 14-day money-back guarantee. No up-front bootcamp bill, no income-share fine print, no lock-in.',
  },
  {
    q: 'Will this get me a job?',
    a: 'We won’t promise that — hiring involves luck, timing, and people we don’t control, and anyone who guarantees a job is selling you fine print. What we promise is the thing that actually earns interviews: verifiable proof you can build, that a hiring manager can open and run.',
  },
  {
    q: 'How is this different from a cheap course library?',
    a: 'A video library ends in a completion badge. Every Sage course ends in proof that’s checked by code — a passing lab, a built project, a certificate that resolves at a public link. You leave with evidence, not hours watched.',
  },
  {
    q: 'Do employers actually care about the certificate?',
    a: 'The certificate is the wrapper; the proof it links to is the point. Anyone can open the public /verify link and confirm what you built and that it passed real checks. That’s worth more than a paper credential they have to take on faith.',
  },
  {
    q: 'Is the content any good?',
    a: 'We hold our own courses to the same bar we teach. Before launch we ran our own rule on our own lessons, found 73 defects — quoted verbatim, including a critical one in our own first lesson — fixed them, and published the receipts.',
  },
]

export function FaqSection() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <section id="faq" style={{ borderTop: `1px solid ${LINE}` }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(56px, 8vw, 100px) clamp(20px, 4vw, 48px)' }}>
        <div style={{ ...mono, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#8FA0FF' }}>Straight answers</div>
        <h2 style={{ ...serif, margin: '14px 0 32px', fontWeight: 600, fontSize: 'clamp(30px, 3.6vw, 48px)', lineHeight: 1.04, letterSpacing: '-0.025em', textWrap: 'balance' }}>
          The questions you were about to ask.
        </h2>

        <div style={{ borderTop: `1px solid ${LINE}` }}>
          {FAQS.map((f) => (
            <details key={f.q} style={{ borderBottom: `1px solid ${LINE}` }}>
              <summary
                style={{
                  ...serif,
                  listStyle: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 20,
                  padding: '22px 4px',
                  fontSize: 'clamp(17px, 1.7vw, 21px)',
                  fontWeight: 500,
                  color: INK,
                }}
              >
                {f.q}
                <span aria-hidden="true" style={{ ...mono, fontSize: 22, color: '#8FA0FF', lineHeight: 1, flexShrink: 0 }}>+</span>
              </summary>
              <p style={{ margin: '0 4px 24px', color: '#9C9CA6', fontSize: 15.5, lineHeight: 1.7, maxWidth: '70ch' }}>{f.a}</p>
            </details>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginTop: 36 }}>
          <Link href="/academy/signup" style={{ display: 'inline-flex', alignItems: 'center', background: '#3D5AFE', color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 600, padding: '15px 28px', borderRadius: 26, boxShadow: '0 0 22px rgba(61,90,254,0.35)' }}>
            Start free
          </Link>
          <Link href="/academy/help" style={{ ...mono, fontSize: 12, color: '#8FA0FF', textDecoration: 'none' }}>
            still have a question? talk to us →
          </Link>
        </div>
      </div>
    </section>
  )
}
