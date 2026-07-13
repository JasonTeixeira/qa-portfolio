'use client'

import { useState, useTransition, type ReactNode } from 'react'
import { loopStep } from '@/lib/academy/engine'
import type { LessonBlock } from '@/data/academy/sample-course'
import { recordSprintEvidence } from '@/app/academy/_actions/evidence'
import { ArtifactComposer } from './ArtifactComposer'
import { CodeSurface } from './CodeSurface'
import { gradeTeachback, type GradeTeachbackResult } from '@/app/academy/_actions/grader'
import { Icon, type IconName } from '@/components/academy/ui/Icon'
import { archetypeFor, type Archetype } from './LessonSpine'
import styles from './sprint.module.css'
import arc from './archetype.module.css'

/** Slugs threaded down so a sprint section can emit evidence for the right unit. */
type EvidenceProps = { courseSlug?: string; lessonSlug?: string }

/** Each loop step maps to one clean line icon — the engine's decorative glyph
 *  field is intentionally not rendered. Keyed by the loop-step `key`. */
const STEP_ICON: Record<string, IconName> = {
  'sprint-contract': 'bolt',
  mission: 'target',
  context: 'compass',
  pretest: 'sparkle',
  'worked-example': 'book',
  concept: 'star',
  lab: 'bolt',
  debug: 'search',
  tradeoff: 'refresh',
  verification: 'check',
  quiz: 'sparkle',
  teachback: 'users',
  calibration: 'target',
  transfer: 'arrow-up-right',
  'spaced-review': 'refresh',
  'unlock-gate': 'lock',
}

/** Map an archetype to its surface class in the shared archetype layer.
 *  NARRATIVE has no card — it renders as inset editorial prose so the eye parses
 *  structure without reading. INTERACTIVE / PROOF get distinct panel treatments. */
const ARCHETYPE_SURFACE: Record<Archetype, string> = {
  narrative: arc.narrative,
  interactive: arc.panel,
  proof: arc.proof,
  viz: arc.panel,
}

/** Loop-rail wrapper. Every sprint section carries its loop-step label so the
 *  learner perceives the engine, not just the content — but the SURFACE now
 *  varies by archetype (data-driven off the block type) so 12 sections no longer
 *  read as one repeated card. `tone` still tints the rail/step for danger/warm. */
function Section({
  blockKey,
  children,
  tone,
  proofState,
}: {
  blockKey: string
  children: ReactNode
  tone?: string
  /** For PROOF archetypes: 'pending' (amber) vs 'verified' (green) surface. */
  proofState?: 'pending' | 'verified'
}) {
  const s = loopStep(blockKey)
  const archetype = archetypeFor(blockKey)
  const surface = ARCHETYPE_SURFACE[archetype]
  const proofClass = archetype === 'proof' && proofState === 'verified' ? arc.proofVerified : ''
  const panelToneClass =
    archetype === 'interactive' || archetype === 'viz'
      ? tone === 'warm'
        ? arc.panelProof
        : tone === 'danger'
          ? arc.panelTrap
          : ''
      : ''

  // NARRATIVE: no card, no rail chrome — just the editorial spine + prose. The
  // loop step is announced via the eyebrow so the engine still reads.
  if (archetype === 'narrative') {
    return (
      <section className={`${styles.section} ${surface}`} data-tone={tone} data-archetype="narrative">
        {s ? (
          <span className={arc.narrativeEyebrow}>
            <Icon name={STEP_ICON[s.key] ?? 'circle'} size={13} /> {String(s.step).padStart(2, '0')} · {s.label}
          </span>
        ) : null}
        {children}
      </section>
    )
  }

  return (
    <section
      className={`${styles.section} ${surface} ${proofClass} ${panelToneClass}`}
      data-tone={tone}
      data-archetype={archetype}
    >
      {s ? (
        <header className={styles.rail}>
          <span className={styles.railStep}>{String(s.step).padStart(2, '0')}</span>
          <span className={styles.railMeta}>
            <span className={styles.railLabel}>
              <Icon name={STEP_ICON[s.key] ?? 'circle'} size={14} /> {s.label}
            </span>
            <span className={styles.railWhy}>{s.why}</span>
          </span>
        </header>
      ) : null}
      <div className={styles.body}>{children}</div>
    </section>
  )
}

/** Pull the first strong sentence out of a prose block for a large editorial
 *  pull-quote (breaks the text-wall + gives in-block scale contrast). Returns
 *  the lead sentence and the remainder, or null if the text is too short to split. */
function splitPullQuote(text: string): { quote: string; rest: string } | null {
  const trimmed = text.trim()
  if (trimmed.length < 140) return null // too short to earn a pull-quote
  // Find the end of the first sentence: a . ! or ? followed by whitespace.
  const m = trimmed.match(/[.!?](\s)/)
  if (!m || m.index === undefined) return null
  const cut = m.index + 1
  const quote = trimmed.slice(0, cut).trim()
  const rest = trimmed.slice(cut).trim()
  if (quote.length < 24 || quote.length > 180 || rest.length < 24) return null
  return { quote, rest }
}

/** Thin adapter to the shared CodeSurface well. Keeps the (code, language)
 *  contract worked-example / debug already carry; CodeSurface owns the a11y
 *  (tabIndex=0 / role="region" / aria-label) + token highlighting + gutter. */
function Mono({ code, language, label }: { code: string; language?: 'python' | 'ts' | 'bash'; label?: string }) {
  return <CodeSurface code={code} language={language} filename={label} ariaLabel="Code sample" />
}

function SprintContract({ b, courseSlug, lessonSlug }: { b: Extract<LessonBlock, { type: 'sprint-contract' }> } & EvidenceProps) {
  const rows: [string, string][] = [
    ['Outcome', b.outcome],
    ['Proof required', b.proof],
    ['Unlock standard', b.unlock],
  ]
  return (
    <section className={styles.contract}>
      <div className={styles.contractTop}>
        <span className={styles.contractKicker}><Icon name="bolt" size={13} /> Sprint contract</span>
        <span className={styles.intensity} data-i={b.intensity}>{b.intensity} · {b.time}</span>
      </div>
      <dl className={styles.contractGrid}>
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {b.doNotClaim ? <p className={styles.doNotClaim}>Don&rsquo;t claim after reading: {b.doNotClaim}</p> : null}
      <ArtifactComposer proof={b.proof} outcome={b.outcome} courseSlug={courseSlug} lessonSlug={lessonSlug} />
    </section>
  )
}

function Pretest({ b, courseSlug, lessonSlug }: { b: Extract<LessonBlock, { type: 'pretest' }> } & EvidenceProps) {
  const [val, setVal] = useState('')
  const [shown, setShown] = useState(false)
  const [sent, setSent] = useState(false)
  const [, startTransition] = useTransition()

  // Revealing the model answer after a memory-first attempt = the learner ran the
  // diagnostic AND attempted retrieval. Emit both, at most once per mount.
  const reveal = () => {
    setShown(true)
    if (sent || !courseSlug || !lessonSlug) return
    setSent(true)
    startTransition(() => {
      void recordSprintEvidence(courseSlug, lessonSlug, 'diagnostic_completed')
      void recordSprintEvidence(courseSlug, lessonSlug, 'retrieval_attempted')
    })
  }

  return (
    <Section blockKey="pretest" tone="warm">
      <p className={styles.lead}>{b.prompt}</p>
      <textarea
        className={styles.input}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Answer from memory first — no scrolling ahead."
        aria-label="Pretest answer"
      />
      {!shown ? (
        <button type="button" className={`${arc.btnPrimary} ${arc.btnProof}`} onClick={reveal} disabled={!val.trim()}>
          {val.trim() ? (<>Reveal the answer <Icon name="arrow-right" size={14} /></>) : 'Write a guess to reveal'}
        </button>
      ) : (
        <div className={styles.reveal} role="status" aria-live="polite">
          <span className={styles.revealTag}>Model answer</span>
          <p>{b.reveal}</p>
        </div>
      )}
    </Section>
  )
}

function WorkedExample({ b }: { b: Extract<LessonBlock, { type: 'worked-example' }> }) {
  const steps = (b.steps ?? []).filter(Boolean)
  return (
    <Section blockKey="worked-example">
      <p className={arc.narrativeBody}>{b.intro}</p>
      {b.code ? <Mono code={b.code} language={b.language} /> : null}
      {steps.length ? <ol className={styles.steps}>{steps.map((s, i) => <li key={i}>{s}</li>)}</ol> : null}
      {b.commonMistake ? <p className={styles.mistake}><strong>Common mistake:</strong> {b.commonMistake}</p> : null}
    </Section>
  )
}

function Concept({ b }: { b: Extract<LessonBlock, { type: 'concept' }> }) {
  const split = splitPullQuote(b.text)
  return (
    <Section blockKey="concept" tone="cool">
      {b.title ? <h3 className={arc.narrativeTitle}>{b.title}</h3> : null}
      {split ? (
        <>
          <p className={arc.pullQuote}>{split.quote}</p>
          <p className={arc.narrativeBody}>{split.rest}</p>
        </>
      ) : (
        <p className={arc.narrativeBody}>{b.text}</p>
      )}
    </Section>
  )
}

/** MISSION — the lesson's opening hook. A long mission gets a big serif lead line
 *  (pull-quote scale-contrast) + a body paragraph so it never reads as a wall. */
function Mission({ b }: { b: Extract<LessonBlock, { type: 'mission' }> }) {
  const split = splitPullQuote(b.text)
  return (
    <Section blockKey="mission">
      {split ? (
        <>
          <p className={styles.missionText}>{split.quote}</p>
          <p className={arc.narrativeBody}>{split.rest}</p>
        </>
      ) : (
        <p className={styles.missionText}>{b.text}</p>
      )}
    </Section>
  )
}

/** CONTEXT — narrative prose; a long one is broken with the editorial pull-quote. */
function Context({ b }: { b: Extract<LessonBlock, { type: 'context' }> }) {
  const split = splitPullQuote(b.text)
  return (
    <Section blockKey="context">
      {split ? (
        <>
          <p className={arc.pullQuote}>{split.quote}</p>
          <p className={arc.narrativeBody}>{split.rest}</p>
        </>
      ) : (
        <p className={arc.narrativeBody}>{b.text}</p>
      )}
    </Section>
  )
}

function DebugBlock({ b }: { b: Extract<LessonBlock, { type: 'debug' }> }) {
  const [shown, setShown] = useState(false)
  return (
    <Section blockKey="debug" tone="danger">
      <p className={styles.lead}><strong>Symptom:</strong> {b.symptom}</p>
      <Mono code={b.brokenCode} language={b.language} label="broken case" />
      <p className={styles.task}>{b.task}</p>
      {!shown ? (
        <button type="button" className={arc.btnGhost} onClick={() => setShown(true)}>Show the fix <Icon name="arrow-right" size={14} /></button>
      ) : (
        <div className={styles.reveal}><span className={styles.revealTag}>Fix</span><p>{b.fix}</p></div>
      )}
    </Section>
  )
}

function Tradeoff({ b }: { b: Extract<LessonBlock, { type: 'tradeoff' }> }) {
  const [pick, setPick] = useState<'a' | 'b' | null>(null)
  return (
    <Section blockKey="tradeoff">
      <p className={styles.lead}>{b.question}</p>
      <div className={styles.tradeoffGrid}>
        {(['a', 'b'] as const).map((k) => {
          const o = k === 'a' ? b.optionA : b.optionB
          return (
            <button key={k} type="button" className={styles.tradeoffCard} data-on={pick === k} onClick={() => setPick(k)}>
              <span className={styles.tradeoffLabel}>{o?.label}</span>
              <span className={styles.tradeoffText}>{o?.text}</span>
            </button>
          )
        })}
      </div>
      {pick ? (
        <div className={styles.reveal} role="status" aria-live="polite">
          <span className={styles.revealTag}>Engineering judgment</span>
          <p>{b.guidance}</p>
        </div>
      ) : null}
    </Section>
  )
}

function Verification({ b }: { b: Extract<LessonBlock, { type: 'verification' }> }) {
  const items = (b.items ?? []).filter(Boolean)
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false))
  const done = checked.filter(Boolean).length
  const allDone = items.length > 0 && done === items.length
  const toggle = (i: number) => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))
  return (
    <Section blockKey="verification" tone="cool" proofState={allDone ? 'verified' : 'pending'}>
      {b.intro ? <p className={styles.lead}>{b.intro}</p> : null}
      <ul className={styles.checklist}>
        {items.map((it, i) => (
          <li key={i}>
            <button type="button" role="checkbox" aria-checked={!!checked[i]} data-on={!!checked[i]} onClick={() => toggle(i)}>
              <span className={styles.box} aria-hidden="true">{checked[i] ? <Icon name="check" size={12} /> : null}</span>
              <span>{it}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className={styles.progress} data-complete={allDone}>
        {allDone ? (<><Icon name="check" size={14} /> Verified — proof complete</>) : `${done}/${items.length} proofs`}
      </p>
    </Section>
  )
}

function Teachback({ b, courseSlug, lessonSlug }: { b: Extract<LessonBlock, { type: 'teachback' }> } & EvidenceProps) {
  const [val, setVal] = useState('')
  const [verdict, setVerdict] = useState<GradeTeachbackResult | null>(null)
  const [pending, startTransition] = useTransition()
  const canGrade = !!courseSlug && !!lessonSlug

  // Submit the explanation to the AI grader. A genuine pass lifts the explain-back
  // cap server-side; a fail opens a repair. Never block the UI; the action never throws.
  const submit = () => {
    if (!courseSlug || !lessonSlug || !val.trim()) return
    startTransition(async () => {
      const result = await gradeTeachback(courseSlug, lessonSlug, val)
      setVerdict(result)
    })
  }

  return (
    <Section blockKey="teachback" tone="warm">
      <p className={styles.lead}>Explain it out loud — to an AI, a reviewer, or the rubber duck. Cover each prompt with a concrete example and one edge case.</p>
      <ul className={styles.prompts}>
        {(b.prompts ?? []).filter(Boolean).map((p, i) => <li key={i}>{p}</li>)}
      </ul>
      {canGrade ? (
        <>
          <textarea
            className={styles.input}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Explain the concept back in your own words — one concrete example, one edge case."
            aria-label="Teach-back explanation"
            disabled={pending}
          />
          <button type="button" className={`${arc.btnPrimary} ${arc.btnProof}`} onClick={submit} disabled={pending || !val.trim()}>
            {pending ? 'Grading…' : (<>Submit for grading <Icon name="arrow-right" size={14} /></>)}
          </button>
          {verdict ? (
            <div className={styles.reveal} data-verdict={!verdict.available ? 'na' : verdict.passed ? 'pass' : 'fail'} role="status" aria-live="polite">
              <span className={styles.revealTag}>
                {!verdict.available ? 'Grader' : verdict.passed ? (<><Icon name="check" size={13} /> Passed</>) : 'Needs work'}
              </span>
              {verdict.feedback ? <p>{verdict.feedback}</p> : null}
            </div>
          ) : null}
        </>
      ) : null}
      <p className={styles.hint}>Passing bar: average 4/5, nothing below 3, one concrete example, one edge case, one next improvement.</p>
    </Section>
  )
}

function Calibration({ b }: { b: Extract<LessonBlock, { type: 'calibration' }> }) {
  const [tab, setTab] = useState<'weak' | 'passing' | 'excellent'>('passing')
  const text = b[tab]
  return (
    <Section blockKey="calibration">
      <p className={styles.lead}>Calibrate your <strong>{b.artifact}</strong> against the bank.</p>
      <div className={styles.calTabs} role="tablist" aria-label="Calibration level">
        {(['weak', 'passing', 'excellent'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} data-level={t} data-on={tab === t} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      <div className={styles.calBody} data-level={tab}>{text}</div>
      <p className={styles.mistake}><strong>Reviewer note:</strong> {b.note}</p>
    </Section>
  )
}

function Transfer({ b, courseSlug, lessonSlug }: { b: Extract<LessonBlock, { type: 'transfer' }> } & EvidenceProps) {
  const [sent, setSent] = useState(false)
  const [, startTransition] = useTransition()
  const canEmit = !!courseSlug && !!lessonSlug

  // Engaging the transfer section = the learner attempted to apply the skill to a
  // new context. Fire once per mount; never block the UI.
  const markAttempted = () => {
    if (sent || !courseSlug || !lessonSlug) return
    setSent(true)
    startTransition(() => {
      void recordSprintEvidence(courseSlug, lessonSlug, 'transfer_attempted')
    })
  }

  return (
    <Section blockKey="transfer">
      <p className={styles.lead}>{b.text}</p>
      {canEmit ? (
        <button type="button" className={`${arc.btnPrimary} ${sent ? arc.btnVerify : ''}`} onClick={markAttempted} disabled={sent} data-on={sent}>
          {sent ? (<><Icon name="check" size={14} /> Transfer attempt logged</>) : (<>Mark transfer attempted <Icon name="arrow-right" size={14} /></>)}
        </button>
      ) : null}
    </Section>
  )
}

const DEFAULT_SCHEDULE = ['Same day · recall without notes', 'Next day · redo the pretest', 'Day 3 · solve a similar task', 'Day 7 · explain in interview format', 'Day 14–30 · transfer to a new project']

function SpacedReview({ b }: { b: Extract<LessonBlock, { type: 'spaced-review' }> }) {
  const custom = (b.schedule ?? []).filter(Boolean)
  const sched = custom.length ? custom : DEFAULT_SCHEDULE
  return (
    <Section blockKey="spaced-review" tone="cool">
      <ol className={styles.schedule}>
        {sched.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
    </Section>
  )
}

function UnlockGate({ b }: { b: Extract<LessonBlock, { type: 'unlock-gate' }> }) {
  const criteria = (b.criteria ?? []).filter(Boolean)
  const [checked, setChecked] = useState<boolean[]>(() => criteria.map(() => false))
  const allDone = criteria.length > 0 && checked.length >= criteria.length && criteria.every((_, i) => checked[i])
  const toggle = (i: number) => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))
  return (
    <section className={styles.gate} data-open={allDone}>
      <header className={styles.rail}>
        <span className={styles.railStep} aria-hidden="true"><Icon name="lock" size={14} /></span>
        <span className={styles.railMeta}>
          <span className={styles.railLabel}><Icon name="lock" size={14} /> Unlock gate</span>
          <span className={styles.railWhy}>Advance only with proof</span>
        </span>
      </header>
      <ul className={styles.checklist}>
        {criteria.map((c, i) => (
          <li key={i}>
            <button type="button" role="checkbox" aria-checked={!!checked[i]} data-on={!!checked[i]} onClick={() => toggle(i)}>
              <span className={styles.box} aria-hidden="true">{checked[i] ? <Icon name="check" size={12} /> : null}</span>
              <span>{c}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className={styles.gateState} role="status" aria-live="polite">
        {allDone ? (<><Icon name="check" size={14} /> Gate cleared — you may unlock the next sprint</>) : 'Meet every criterion to unlock'}
      </p>
    </section>
  )
}

/** Returns a renderer for an engine section block, or null for legacy content blocks. */
export function SprintBlock({ block, courseSlug, lessonSlug }: { block: LessonBlock } & EvidenceProps): ReactNode {
  switch (block.type) {
    case 'sprint-contract': return <SprintContract b={block} courseSlug={courseSlug} lessonSlug={lessonSlug} />
    case 'mission': return <Mission b={block} />
    case 'context': return <Context b={block} />
    case 'pretest': return <Pretest b={block} courseSlug={courseSlug} lessonSlug={lessonSlug} />
    case 'worked-example': return <WorkedExample b={block} />
    case 'concept': return <Concept b={block} />
    case 'debug': return <DebugBlock b={block} />
    case 'tradeoff': return <Tradeoff b={block} />
    case 'verification': return <Verification b={block} />
    case 'teachback': return <Teachback b={block} courseSlug={courseSlug} lessonSlug={lessonSlug} />
    case 'calibration': return <Calibration b={block} />
    case 'transfer': return <Transfer b={block} courseSlug={courseSlug} lessonSlug={lessonSlug} />
    case 'spaced-review': return <SpacedReview b={block} />
    case 'unlock-gate': return <UnlockGate b={block} />
    default: return null
  }
}
