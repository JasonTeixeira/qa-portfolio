import { Reveal } from '@/components/agency/core'
import { SectionShell } from '@/components/agency/section-shell'

interface WritingPiece {
  title: string
  thesis: string
  proves: string
  isPublished: boolean
}

const BLOG_URL = 'https://sageideas.dev/blog'

const WRITING_PIECES: readonly WritingPiece[] = [
  {
    title: 'How I test AI systems when the answer is probabilistic',
    thesis:
      "You can't assert equality on a probabilistic answer — you assert properties: grounding, structure, refusal behavior, drift.",
    proves: 'PROVES: EVAL DESIGN',
    isPublished: true,
  },
  {
    title: 'What a reliable automation workflow needs before production',
    thesis: "A workflow isn't done until someone else can run it, inspect it, and recover it.",
    proves: 'PROVES: OPERATIONAL MATURITY',
    isPublished: false,
  },
  {
    title: 'How I think about Playwright coverage and flaky tests',
    thesis:
      'Flaky tests are production debt — diagnose the root cause or delete the test. Never retry-loop your way to green.',
    proves: 'PROVES: QA STRATEGY',
    isPublished: false,
  },
  {
    title: 'The difference between a demo bot and an operational AI workflow',
    thesis: 'A demo proves possibility. An operational workflow proves repeatability under failure.',
    proves: 'PROVES: PRODUCTION THINKING',
    isPublished: false,
  },
  {
    title: 'A release gate is a trust contract, not a checklist',
    thesis:
      'A gate earns its place when a non-QA stakeholder can read the output and make a ship decision.',
    proves: 'PROVES: COMMUNICATION',
    isPublished: false,
  },
]

function WritingRowBody({ piece }: { piece: WritingPiece }) {
  return (
    <>
      <h3 className="ag-writing-title">{piece.title}</h3>
      <p className="ag-writing-thesis">{piece.thesis}</p>
      <p className="ag-writing-status">
        {piece.proves} ·{' '}
        {piece.isPublished ? (
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
    <SectionShell id="writing" num="07" kicker="TECHNICAL WRITING" ghost="07">
      <ul className="ag-writing-list">
        {WRITING_PIECES.map((piece, index) => (
          <Reveal key={piece.title} as="li" delay={index * 70}>
            {piece.isPublished ? (
              <a href={BLOG_URL} className="ag-writing-row">
                <WritingRowBody piece={piece} />
              </a>
            ) : (
              <div className="ag-writing-row">
                <WritingRowBody piece={piece} />
              </div>
            )}
          </Reveal>
        ))}
      </ul>
    </SectionShell>
  )
}
