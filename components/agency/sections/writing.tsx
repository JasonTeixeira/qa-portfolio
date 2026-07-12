import Link from 'next/link'

import { Reveal } from '@/components/agency/core'
import { SectionShell } from '@/components/agency/section-shell'

interface WritingPiece {
  title: string
  thesis: string
  proves: string
  /** Root-absolute blog URL. Present only for published pieces. */
  href?: string
}

const WRITING_PIECES: readonly WritingPiece[] = [
  {
    title: 'How I test AI systems when the answer is probabilistic',
    thesis: "You can't assert equality on a probabilistic answer — you assert properties.",
    proves: 'PROVES: EVAL DESIGN',
    href: '/blog/testing-probabilistic-ai',
  },
  {
    title: 'What a reliable automation workflow needs before production',
    thesis: "Not done until someone else can run, inspect, and recover it.",
    proves: 'PROVES: OPERATIONAL MATURITY',
  },
  {
    title: 'How I think about Playwright coverage and flaky tests',
    thesis: 'Flaky tests are debt — fix the root cause or delete them.',
    proves: 'PROVES: QA STRATEGY',
    href: '/blog/playwright-coverage-and-flaky-tests',
  },
  {
    title: 'The difference between a demo bot and an operational AI workflow',
    thesis: 'A demo proves possibility. Operations prove repeatability under failure.',
    proves: 'PROVES: PRODUCTION THINKING',
  },
  {
    title: 'A release gate is a trust contract, not a checklist',
    thesis: 'A gate earns its place when non-QA stakeholders can ship from it.',
    proves: 'PROVES: COMMUNICATION',
    href: '/blog/release-gate-trust-contract',
  },
]

function WritingRowBody({ piece }: { piece: WritingPiece }) {
  return (
    <>
      <h3 className="ag-writing-title">{piece.title}</h3>
      <p className="ag-writing-thesis">{piece.thesis}</p>
      <p className="ag-writing-status">
        {piece.proves} ·{' '}
        {piece.href ? (
          <span className="ag-writing-tag ag-writing-tag--live">PUBLISHED →</span>
        ) : (
          <span className="ag-writing-tag" aria-disabled="true">
            DRAFT
          </span>
        )}
      </p>
    </>
  )
}

/** Section 07 — editorial rows of technical writing. */
export function WritingSection() {
  return (
    <SectionShell id="writing" num="06" kicker="TECHNICAL WRITING" ghost="06">
      <ul className="ag-writing-list">
        {WRITING_PIECES.map((piece, index) => (
          <Reveal key={piece.title} as="li" delay={index * 70}>
            {piece.href ? (
              <Link href={piece.href} className="ag-writing-row">
                <WritingRowBody piece={piece} />
              </Link>
            ) : (
              <div className="ag-writing-row">
                <WritingRowBody piece={piece} />
              </div>
            )}
          </Reveal>
        ))}
      </ul>
      <Reveal delay={WRITING_PIECES.length * 70}>
        <p className="ag-writing-all-posts">
          <Link href="/blog" className="ag-writing-all-posts-link">
            ALL POSTS — THE PROOF LOG →
          </Link>
        </p>
      </Reveal>
    </SectionShell>
  )
}
