import type { Metadata } from 'next'
import Link from 'next/link'
import { AcademyNav, AcademyFooter } from '@/components/academy/landing/AcademyChrome'

/**
 * "How we audit ourselves" — pre-launch social proof that is actually true.
 * Every number and quoted defect on this page comes verbatim from the
 * Wave-1 content gauntlet of 2026-08-15 (docs/academy/WAVE1_GIT_LESSONS_LEDGER.md,
 * commit 3abbfbf2): 18 independent auditor/rewriter/verifier passes over the
 * 34 git-resident lessons, every runnable Python claim executed.
 */

const INK = '#F2EFE9'
const LINE = '#1E1E24'
const GREEN = '#18B663'
const AMBER = '#E0A93E'
const RED = '#E5484D'

const mono = { fontFamily: 'var(--font-mono), monospace' } as const
const serif = { fontFamily: 'var(--font-serif), Georgia, serif' } as const

export const metadata: Metadata = {
  title: 'How we audit ourselves — Sage Academy',
  description:
    'Before launch we ran our own rule on our own lessons: 18 independent audit passes, every code claim executed, 73 defects found and fixed, re-verified to a 95+ bar. The receipts, in public.',
  alternates: { canonical: 'https://www.sageideas.dev/academy/how-we-audit' },
}

const STATS = [
  ['34', 'lessons audited'],
  ['73', 'defects found — each with a verbatim quote'],
  ['17', 'critical or high severity'],
  ['47', 'fixes applied'],
  ['34/34', 're-verified at ≥95, zero critical, zero high'],
]

const DEFECTS = [
  {
    severity: 'CRITICAL',
    color: RED,
    lesson: 'your-first-program · debug block',
    quote:
      'Without quotes the computer reads Hello and world! as commands to look up, not text to show — and there is no such command, so it errors.',
    finding:
      'The lesson taught a false error mechanism: the broken code print(Hello, world!) never reaches name lookup — Python stops with a SyntaxError at the “!”. A learner following our own advice (“read the error message”) would see their screen contradict the lesson.',
    fix: 'Rewritten to teach the true mechanism, verified by running both variants with python3.',
  },
  {
    severity: 'SYSTEMIC',
    color: AMBER,
    lesson: 'all nine First-Steps labs',
    quote: '  # your code here',
    finding:
      'Every lab starter carried an indented “# your code here” marker. An absolute beginner typing at that indentation hits IndentationError — before indentation has been taught.',
    fix: 'All nine starters corrected; starter and fixed versions executed to confirm the intended failure and pass.',
  },
  {
    severity: 'HIGH',
    color: AMBER,
    lesson: 'review-rubric · debug block',
    quote: 'Name the two structural errors in how the rubric was applied.',
    finding: 'The task asked for two errors while the lesson’s own answer names three.',
    fix: 'Task and answer renumbered consistently.',
  },
]

export default function HowWeAuditPage() {
  return (
    <>
      <AcademyNav />
      <div
        style={{
          minHeight: '100vh',
          background: '#0B0B0E',
          backgroundImage: 'radial-gradient(120% 80% at 50% -10%, rgba(255,255,255,0.035) 0%, transparent 55%)',
          color: INK,
          fontFamily: 'var(--font-sans), sans-serif',
          fontSize: 16,
          lineHeight: 1.6,
        }}
      >
        <main style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(56px, 8vw, 104px) clamp(20px, 4vw, 48px) 88px' }}>
          <div style={{ ...mono, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#8FA0FF' }}>
            The house rule, applied to the house
          </div>
          <h1 style={{ ...serif, margin: '18px 0 0', fontWeight: 600, fontSize: 'clamp(34px, 4.6vw, 56px)', lineHeight: 1.02, letterSpacing: '-0.026em', textWrap: 'balance' }}>
            Before we ask you to prove anything, we audit ourselves.
          </h1>
          <p style={{ margin: '22px 0 0', color: '#9C9CA6', maxWidth: '58ch', textWrap: 'pretty' }}>
            On August 15, 2026 we ran our lessons through the same gauntlet we teach: eighteen
            independent audit, repair, and verification passes over every git-resident lesson —
            with every runnable code claim actually executed, not eyeballed. Here is what it
            found, uncut.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 1, marginTop: 40, background: LINE, border: `1px solid ${LINE}`, borderRadius: 14, overflow: 'hidden' }}>
            {STATS.map(([num, label]) => (
              <div key={label} style={{ background: '#111115', padding: '20px 18px' }}>
                <div style={{ ...serif, fontWeight: 600, fontSize: 28, letterSpacing: '-0.02em', color: num === '34/34' ? GREEN : INK }}>{num}</div>
                <div style={{ ...mono, marginTop: 6, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9598A2', lineHeight: 1.5 }}>{label}</div>
              </div>
            ))}
          </div>

          <h2 style={{ ...serif, margin: '56px 0 8px', fontWeight: 560, fontSize: 'clamp(24px, 2.8vw, 34px)', letterSpacing: '-0.02em' }}>
            Real defects we caught in our own lessons
          </h2>
          <p style={{ margin: '0 0 24px', color: '#9C9CA6', maxWidth: '58ch' }}>
            Quoted exactly as the auditors filed them. We publish these because a curriculum that
            grades your work has to be willing to show its own report card.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {DEFECTS.map((d) => (
              <div key={d.lesson} style={{ border: `1px solid ${LINE}`, borderRadius: 14, background: '#111115', padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ ...mono, fontSize: 9.5, letterSpacing: '0.08em', padding: '4px 9px', borderRadius: 5, color: d.color, border: `1px solid ${d.color}66`, background: `${d.color}12` }}>
                    {d.severity}
                  </span>
                  <span style={{ ...mono, fontSize: 11, color: '#9598A2' }}>{d.lesson}</span>
                </div>
                <blockquote style={{ ...mono, margin: '14px 0 0', padding: '12px 16px', borderLeft: `2px solid ${d.color}`, background: '#0B0B0E', fontSize: 12.5, color: '#B6B6C0', whiteSpace: 'pre-wrap' }}>
                  {d.quote}
                </blockquote>
                <p style={{ margin: '14px 0 0', fontSize: 14.5, color: '#9C9CA6' }}>{d.finding}</p>
                <p style={{ margin: '10px 0 0', fontSize: 14, color: GREEN }}>✓ {d.fix}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48, border: '1px solid rgba(61,90,254,0.35)', borderRadius: 14, background: 'rgba(61,90,254,0.05)', padding: 26 }}>
            <div style={{ ...mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8FA0FF', marginBottom: 10 }}>
              Why this page exists
            </div>
            <p style={{ margin: 0, fontSize: 14.5, color: '#B6B6C0', maxWidth: '64ch' }}>
              We don&apos;t have testimonials yet, and we won&apos;t invent them. What we have is the
              standard itself, applied to us first: independent verifiers, executed evidence, and a
              gate we published before you arrived. When the first cohort ships proofs, their
              ledgers — not quotes — will sit here.
            </p>
            <div style={{ display: 'flex', gap: 18, marginTop: 18, flexWrap: 'wrap' }}>
              <Link href="/academy/proof-not-paper" style={{ ...mono, fontSize: 12, color: '#8FA0FF', textDecoration: 'none' }}>
                the manifesto →
              </Link>
              <Link href="/academy/engine" style={{ ...mono, fontSize: 12, color: GREEN, textDecoration: 'none' }}>
                run a lesson check yourself →
              </Link>
            </div>
          </div>
        </main>
      </div>
      <AcademyFooter />
    </>
  )
}
