'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Course, Lesson, LessonBlock } from '@/data/academy/sample-course'
import { markLessonComplete } from '@/app/academy/_actions/progress'
import { CelebrationToast } from '@/components/academy/celebration/CelebrationToast'
import type { Celebration } from '@/lib/academy/gamification-logic'
import { StateBadge } from '@/components/academy/shell/StateBadge'
import { ScoreCapMeter } from '@/components/academy/shell/ScoreCapMeter'
import type { UnitState } from '@/lib/academy/evidence-events-logic'
import type { ScoreResolution } from '@/lib/academy/caps-logic'
import { SprintBlock } from './SprintBlocks'
import { NotesPanel } from './NotesPanel'
import { SageMark } from '@/components/academy/brand/SageMark'
import type { LessonNote } from '@/lib/academy/notes'
import { Icon } from '@/components/academy/ui/Icon'
import { CourseRail } from './CourseRail'
import { SageDiagram } from '@/components/academy/visuals/SageDiagram'
import { NarratedDiagram } from '@/components/academy/visuals/NarratedDiagram'
import { SageViz } from '@/components/academy/visuals/SageViz'
import { SageCodeWalkthrough } from '@/components/academy/visuals/SageCodeWalkthrough'
import { SageCompare } from '@/components/academy/visuals/SageCompare'
import { RevealStagger } from '@/components/academy/visuals/reveal'
import { LessonSpine, blockAnchorId } from './LessonSpine'
import { CodeSurface } from './CodeSurface'
import styles from './lesson.module.css'
import arc from './archetype.module.css'

/** The lesson's `code` block now renders through the shared CodeSurface well
 *  (line-number gutter + language chip + token highlighting + copy control). */
function CodeBlock({ block }: { block: Extract<LessonBlock, { type: 'code' }> }) {
  return (
    <CodeSurface
      code={block.code}
      language={block.language}
      filename={block.filename}
      copyable
      ariaLabel={`Code — ${block.filename}`}
    />
  )
}

function QuizBlock({ block }: { block: Extract<LessonBlock, { type: 'quiz' }> }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = selected === block.answer
  return (
    <div className={`${arc.panel} ${styles.quiz}`}>
      <span className={`${arc.badge} ${arc.badgeAction}`}><Icon name="sparkle" size={12} /> Quick check</span>
      <p className={styles.quizQ}>{block.question}</p>
      <ul className={styles.quizOptions}>
        {(block.options ?? []).map((opt, i) => {
          const state = checked
            ? i === block.answer ? 'correct' : i === selected ? 'wrong' : ''
            : i === selected ? 'sel' : ''
          return (
            <li key={i}>
              <button type="button" data-state={state} disabled={checked} onClick={() => setSelected(i)}>
                {opt}
              </button>
            </li>
          )
        })}
      </ul>
      {!checked ? (
        <button type="button" className={arc.btnPrimary} disabled={selected === null} onClick={() => setChecked(true)}>
          Check answer <Icon name="arrow-right" size={15} />
        </button>
      ) : (
        <div className={styles.quizResult} data-correct={correct} role="status" aria-live="polite">
          <strong>{correct ? (<><Icon name="check" size={15} /> Correct!</>) : (<><Icon name="x" size={15} /> Not quite.</>)}</strong>
          {block.explanation ? <p>{block.explanation}</p> : null}
          {!correct ? (
            <button type="button" className={styles.quizRetry} onClick={() => { setChecked(false); setSelected(null) }}>Try again</button>
          ) : null}
        </div>
      )}
    </div>
  )
}

function Block({
  block,
  labHref,
  courseSlug,
  lessonSlug,
}: {
  block: LessonBlock
  labHref: string
  courseSlug?: string
  lessonSlug?: string
}) {
  switch (block.type) {
    case 'prose':
      return (
        <div className={arc.narrative}>
          <p className={arc.narrativeBody}>{block.text}</p>
        </div>
      )
    case 'code':
      return <CodeBlock block={block} />
    case 'video':
      // No video player is wired yet — render an honest, non-interactive placeholder
      // (a real Play control would announce an action it can't perform).
      return (
        <figure className={styles.video}>
          <div className={styles.play} aria-hidden="true">
            <Icon name="play" size={20} />
          </div>
          <figcaption className={styles.videoCap}>{block.title} · video walkthrough coming soon</figcaption>
        </figure>
      )
    case 'lab':
      return (
        <div className={`${arc.panel} ${styles.lab}`}>
          <div>
            <span className={`${arc.badge} ${arc.badgeProof}`}><Icon name="bolt" size={12} /> Guided lab · in-browser</span>
            <h3 className={styles.labTitle}>{block.title}</h3>
            <p className={styles.labSummary}>{block.summary}</p>
          </div>
          <Link href={labHref} className={`${arc.btnPrimary} ${arc.btnProof}`}>Open lab <Icon name="arrow-right" size={16} /></Link>
        </div>
      )
    case 'callout':
      return (
        <aside className={styles.callout} data-tone={block.tone}>
          <span className={styles.calloutTag}>{block.tone === 'tip' ? 'TIP' : 'NOTE'}</span>
          <p>{block.text}</p>
        </aside>
      )
    case 'quiz':
      return <QuizBlock block={block} />
    case 'diagram': {
      // Branded system-map renderer; the reveal wrapper fades the figure up in
      // the house motion language (reduced-motion → final state instantly).
      // visualBleed widens it past the 680px prose column (node labels stay legible).
      // When the diagram carries a NARRATION storyboard, render the NarratedDiagram
      // engine so the figure explains itself beat-by-beat (voice-sync-ready); else
      // the standard SageDiagram.
      const storyboard = Array.isArray(block.storyboard) && block.storyboard.length > 0 ? block.storyboard : null
      return (
        <div className={`${styles.visualBleed} ${arc.vizBlock}`} data-viz="wide">
          <RevealStagger>
            {storyboard ? (
              <NarratedDiagram
                title={block.title}
                subtitle={block.subtitle}
                nodes={block.nodes}
                edges={block.edges}
                legend={block.legend}
                rankdir={block.rankdir}
                caption={block.caption}
                height={block.height}
                storyboard={storyboard}
              />
            ) : (
              <SageDiagram
                title={block.title}
                subtitle={block.subtitle}
                nodes={block.nodes}
                edges={block.edges}
                legend={block.legend}
                rankdir={block.rankdir}
                caption={block.caption}
                height={block.height}
              />
            )}
          </RevealStagger>
        </div>
      )
    }
    case 'viz':
      return (
        <div className={`${styles.visualBleed} ${arc.vizBlock}`} data-viz="wide">
          <RevealStagger>
            <SageViz
              title={block.title}
              subtitle={block.subtitle}
              chart={block.chart}
              data={block.data}
              unit={block.unit}
            />
          </RevealStagger>
        </div>
      )
    case 'code-walkthrough':
      // Animated, terminal-look code stepper; self-contained (own controls +
      // reduced-motion static state), so no reveal wrapper needed.
      return (
        <div className={`${styles.visualBleed} ${arc.vizBlock}`} data-viz="wide">
          <SageCodeWalkthrough
            title={block.title}
            subtitle={block.subtitle}
            filename={block.filename}
            language={block.language}
            code={block.code}
            steps={block.steps}
            caption={block.caption}
          />
        </div>
      )
    case 'compare':
      return (
        <div className={`${styles.visualBleed} ${arc.vizBlock}`} data-viz="wide">
          <RevealStagger>
            <SageCompare
              title={block.title}
              subtitle={block.subtitle}
              left={block.left}
              right={block.right}
              mono={block.mono}
              caption={block.caption}
            />
          </RevealStagger>
        </div>
      )
    default:
      // Sage Learning Engine V2 sprint sections render themselves.
      return <SprintBlock block={block} courseSlug={courseSlug} lessonSlug={lessonSlug} />
  }
}

export function LessonPlayer({
  course,
  lesson,
  signedIn = false,
  initialCompleted = false,
  locked = false,
  labHref,
  unitState,
  unitScore,
  notes = [],
}: {
  course: Course
  lesson: Lesson
  signedIn?: boolean
  initialCompleted?: boolean
  locked?: boolean
  /** Override the lab URL (used by the off-catalog flagship sprint). */
  labHref?: string
  /** Tier-0 evidence-spine unit state for the header chip. */
  unitState?: UnitState
  /** Tier-0 capped mastery score for the header meter (null when no user). */
  unitScore?: ScoreResolution | null
  /** The current learner's notes for this lesson (empty when signed out). */
  notes?: LessonNote[]
}) {
  const resolvedLabHref = labHref ?? `/academy/learn/${course.slug}/${lesson.slug}/lab`
  const router = useRouter()
  const [completed, setCompleted] = useState(initialCompleted)
  const [celebration, setCelebration] = useState<Celebration | null>(null)
  const [pending, startTransition] = useTransition()
  const pct = course.lessonsTotal ? Math.round((course.lessonsDone / course.lessonsTotal) * 100) : 0

  const lessonHref = (slug: string) => `/academy/learn/${course.slug}/${slug}`

  // PROOF GATE (blocker #4). The footer primary only promotes to a real
  // "Mark complete" once the sprint's proofs are satisfied. Proofs are satisfied
  // when the evidence-spine unit is 'complete', or the lesson was already
  // completed, or this lesson isn't evidence-tracked at all (no unitState —
  // e.g. a plain content lesson), so we never trap a learner with no gate to clear.
  const proofsMet = completed || !unitState || unitState === 'complete'

  // Quiet advance: move to the next section WITHOUT marking complete. Used by the
  // gated footer while proofs are still outstanding, so a learner can read ahead
  // but cannot skip the proof by hitting the primary CTA.
  const onAdvance = () => {
    if (lesson.nextSlug) router.push(lessonHref(lesson.nextSlug))
    else router.refresh()
  }

  const onComplete = () => {
    startTransition(async () => {
      const res = await markLessonComplete(course.slug, lesson.slug)
      if (res.ok) {
        setCompleted(true)
        const advance = () => {
          if (lesson.nextSlug) router.push(lessonHref(lesson.nextSlug)) // advance to the next lesson
          else router.refresh()
        }
        // Show the dopamine payoff first, then advance once it's been seen.
        if (res.celebration) {
          setCelebration(res.celebration)
          setTimeout(advance, 2000)
        } else {
          advance()
        }
      }
    })
  }

  // Keyboard navigation: j → next lesson, k → previous, c → mark complete.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
      if (e.key === 'j' && lesson.nextSlug) { e.preventDefault(); router.push(lessonHref(lesson.nextSlug)) }
      else if (e.key === 'k' && lesson.prevSlug) { e.preventDefault(); router.push(lessonHref(lesson.prevSlug)) }
      // `c` marks complete only once proofs are met; before that it's inert so
      // the shortcut can't bypass the proof gate (mirrors the footer promotion).
      else if (e.key === 'c' && signedIn && !completed && !pending && proofsMet) { e.preventDefault(); onComplete() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.nextSlug, lesson.prevSlug, signedIn, completed, pending, proofsMet])

  return (
    <div className={styles.root}>
      <CelebrationToast value={celebration} onClear={() => setCelebration(null)} />
      {/* top bar — mono breadcrumb strip with the ◆ mark + mastery chip (design) */}
      <header className={styles.topbar}>
        <Link href="/academy/dashboard" className={styles.topbarBrand}>
          <SageMark size={24} radius={7} />
          <span className={styles.brandLabel}>← dashboard</span>
        </Link>
        <span className={styles.crumb}>
          {course.title} <span className={styles.crumbSlash} aria-hidden="true">/</span>{' '}
          <span className={styles.crumbHere}>{lesson.title}</span>
        </span>
        <span className={styles.spacer} />
        {unitScore ? (
          <span className={styles.masteryChip} data-capped={unitScore.binding !== null || undefined}>
            mastery {unitScore.score}{unitScore.binding !== null ? ' · capped' : ''}
          </span>
        ) : null}
      </header>

      {/* course side-menu: collapsible module → lesson tree (desktop rail + mobile drawer) */}
      <CourseRail course={course} lessonHref={lessonHref} />

      {/* main */}
      <main className={styles.main}>
        <article className={`${styles.lesson} ${arc.scope}`}>
          <header className={styles.lessonHeader}>
            <p className={styles.eyebrow}>{lesson.eyebrow}</p>
            <h1 className={styles.title}>{lesson.title}</h1>
          </header>
          {(unitState || unitScore) ? (
            <div className={styles.masteryRow}>
              <div className={styles.masteryLine}>
                {unitState ? <StateBadge state={unitState} /> : null}
                {unitScore ? (
                  <div className={styles.masteryMeter}>
                    {/* Labeled "Best mastery" so the number reads as prior/best —
                        NOT this-session progress (blocker #5 reconciliation). */}
                    <ScoreCapMeter resolution={unitScore} label="Best mastery" />
                  </div>
                ) : null}
              </div>
              {/* Reconcile the two numbers a learner sees at once (blocker #5):
                  "Best mastery" = the prior/best capped score for this unit; the
                  sidebar % + the in-lesson "Step N of M" are THIS session's
                  position. Mastery is evidence-gated, not completion-gated. */}
              <p className={styles.masteryNote}>
                Best mastery is your prior best for this unit — evidence-gated, not the same as this session&rsquo;s progress. Complete the sprint proofs to lift it toward 100.
              </p>
            </div>
          ) : null}
          {locked ? (
            <div className={styles.paywall} role="region" aria-label="Membership required">
              {/* a teaser: the first block, then the gate */}
              {lesson.blocks[0] ? (
                <div className={styles.paywallTease} aria-hidden="true">
                  <Block block={lesson.blocks[0]} labHref="#" />
                </div>
              ) : null}
              <div className={styles.gate}>
                <span className={styles.gateKicker}><Icon name="lock" size={13} /> Pro lesson</span>
                <h2 className={styles.gateTitle}>You&apos;re one step from the good part.</h2>
                <p className={styles.gateBody}>
                  You&apos;ve got the momentum — don&apos;t lose it. Start a free 7-day trial and keep going right now.
                  One membership opens the rest of this course and every other one.
                </p>
                <ul style={{ listStyle: 'none', margin: '4px 0 20px', padding: 0, display: 'grid', gap: 8 }}>
                  {['Every course as it ships — labs, projects, proofs', 'In-browser labs checked by code, not vibes', 'Certificates verifiable at a public link'].map((t) => (
                    <li key={t} style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontSize: 14, color: '#9C9CA6' }}>
                      <Icon name="check" size={14} /> {t}
                    </li>
                  ))}
                </ul>
                <Link href="/academy/join" className={styles.gateBtn}>Start 7-day free trial <Icon name="arrow-right" size={16} /></Link>
                <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, color: '#5A5A64', margin: '12px 0 0' }}>
                  Cancel anytime · we remind you before day 7 · no lock-in
                </p>
                {!signedIn ? (
                  <a href="/login?next=/academy/join" className={styles.gateLink}>Already a member? Sign in</a>
                ) : null}
              </div>
            </div>
          ) : (
            <>
              <LessonSpine blocks={lesson.blocks} />
              {lesson.blocks.map((b, i) => (
                <div key={i} id={blockAnchorId(i)} data-block-index={i}>
                  <Block block={b} labHref={resolvedLabHref} courseSlug={course.slug} lessonSlug={lesson.slug} />
                </div>
              ))}
            </>
          )}
          {!locked ? (
            <section className={styles.notesSlot} aria-label="Your notes">
              <NotesPanel
                courseSlug={course.slug}
                lessonSlug={lesson.slug}
                signedIn={signedIn}
                notes={notes}
              />
            </section>
          ) : null}
        </article>
      </main>

      {/* footer */}
      <footer className={styles.footer}>
        {lesson.prevSlug ? (
          <Link className={styles.prev} href={lessonHref(lesson.prevSlug)}><Icon name="arrow-left" size={13} /> {lesson.prevLabel}</Link>
        ) : (
          <span />
        )}
        {/* course-progress track — the design footer's 4px accent bar */}
        <span className={styles.footerBar} aria-hidden="true">
          <span className={styles.footerBarFill} style={{ width: `${pct}%` }} />
        </span>
        <span className={styles.kbdHint} aria-hidden="true">
          <kbd>j</kbd>/<kbd>k</kbd> move{proofsMet && !completed ? (<> · <kbd>c</kbd> complete</>) : null}
        </span>
        {locked ? (
          // Membership unlock is the one place the footer carries a true primary CTA.
          <Link className={`${arc.btnPrimary} ${styles.footerCta}`} href="/academy/join">Unlock all-access <Icon name="arrow-right" size={16} /></Link>
        ) : signedIn && completed ? (
          // Already complete → a quiet, verified "continue" (no re-complete).
          <button
            type="button"
            className={`${arc.btnGhost} ${styles.footerComplete} ${styles.footerCompleteDone}`}
            onClick={onAdvance}
          >
            <Icon name="check" size={15} /> Completed · continue <Icon name="arrow-right" size={15} />
          </button>
        ) : signedIn && !proofsMet ? (
          // PROOF GATE (blocker #4): proofs still outstanding. The footer does NOT
          // offer "Mark complete" — only a QUIET "Next section" that advances
          // WITHOUT recording completion, so the in-lesson proofs stay the gate.
          <button
            type="button"
            className={`${arc.btnGhost} ${styles.footerNext}`}
            onClick={onAdvance}
            title="Advances without marking complete — clear the sprint proofs to unlock completion"
          >
            Next section <Icon name="arrow-right" size={15} />
          </button>
        ) : signedIn ? (
          // Proofs satisfied → PROMOTE to the filled primary "Mark complete".
          <button
            type="button"
            className={`${arc.btnPrimary} ${arc.btnVerify} ${styles.footerComplete}`}
            onClick={onComplete}
            disabled={pending}
            aria-busy={pending}
            aria-keyshortcuts="c"
          >
            {pending ? 'Saving…' : (<>Mark complete &amp; continue <Icon name="arrow-right" size={15} /></>)}
          </button>
        ) : (
          <a className={`${arc.btnPrimary} ${styles.footerCta}`} href="/login?next=/academy/preview">
            Sign in to save progress <Icon name="arrow-right" size={16} />
          </a>
        )}
      </footer>
    </div>
  )
}
