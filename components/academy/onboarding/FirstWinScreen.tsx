'use client'

import Link from 'next/link'
import type { FirstWinSummary } from '@/lib/academy/first-win-logic'
import { FIRST_WIN_MILESTONE_KEY } from '@/lib/academy/first-win-logic'
import styles from './first-win.module.css'

type Props = {
  /** Genuine summary built server-side from the learner's real stats. */
  summary: FirstWinSummary
}

/**
 * The guaranteed first-win celebration. The win is REAL: `summary.won` is derived
 * from a recorded in_progress lesson row, and the checked `start-lesson` milestone
 * below reflects actual goal progress — not a hard-coded checkmark. The screen's job
 * is to make that real success felt, then hand off a single dominant CTA into the
 * first lesson.
 */
export function FirstWinScreen({ summary }: Props) {
  const { won, goalLabel, milestoneLabel, progress, nextHref } = summary

  return (
    <main className={styles.page}>
      <section className={styles.shell} aria-labelledby="first-win-heading">
        <p className={styles.kicker}>
          {won ? 'First win — done' : 'You’re set up'}
        </p>

        <div className={styles.seal} aria-hidden="true">
          <span className={styles.sealMark}>✓</span>
        </div>

        <h1 id="first-win-heading" className={styles.title}>
          {won ? 'You just took your first real step.' : 'Your path is ready.'}
        </h1>

        <p className={styles.lede}>
          {won ? (
            <>
              You committed to <strong>{goalLabel}</strong> and you’ve already started
              your first lesson — that progress is on your record now, not someday.
            </>
          ) : (
            <>
              You committed to <strong>{goalLabel}</strong>. Open your first lesson to
              put your first step on the board.
            </>
          )}
        </p>

        <div className={styles.progressBlock}>
          <div className={styles.progressHead}>
            <span className={styles.progressLabel}>{goalLabel}</span>
            <span className={styles.progressPct}>{progress.pct}%</span>
          </div>
          <div
            className={styles.bar}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.pct}
            aria-label={`${goalLabel} progress`}
          >
            <span className={styles.barFill} style={{ transform: `scaleX(${progress.pct / 100})` }} />
          </div>
          <ul className={styles.milestones}>
            {progress.milestones.slice(0, 4).map((m) => {
              const isFirstWin = m.key === FIRST_WIN_MILESTONE_KEY
              return (
                <li key={m.key} className={styles.milestone} data-done={m.done} data-first={isFirstWin}>
                  <span className={styles.check} aria-hidden="true">
                    {m.done ? '✓' : '○'}
                  </span>
                  <span className={styles.mLabel}>{m.label}</span>
                  {isFirstWin && m.done ? <span className={styles.justNow}>just now</span> : null}
                </li>
              )
            })}
          </ul>
        </div>

        <Link href={nextHref} className={styles.cta}>
          {won ? 'Continue your first lesson →' : 'Open your first lesson →'}
        </Link>
        <p className={styles.subNote}>
          Next milestone: <strong>{progress.nextMilestone?.label ?? 'finish the lesson'}</strong>
        </p>
      </section>
    </main>
  )
}
