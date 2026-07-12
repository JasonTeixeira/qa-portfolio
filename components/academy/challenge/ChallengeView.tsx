import Link from 'next/link'
import type { FieldNote } from '@/lib/field-notes'
import styles from './challenge.module.css'

interface ChallengeViewProps {
  note: FieldNote
}

/**
 * Weekly Challenge — "one map, all of us." The brief is a REAL field note, not
 * an invented problem: its title, summary, category, and tags come straight
 * from content/field-notes and it links to the full note.
 *
 * HONESTY CONTRACT (hard): there is no submissions or voting backend, so this
 * view renders NO fabricated usernames, ranks, vote counts, participant totals,
 * or fake "submitted" success state. The submit area routes to real actions
 * (read the full note, train the skill). Standings render an honest empty
 * state. If the design fabricated it, we omit or replace it.
 */
export function ChallengeView({ note }: ChallengeViewProps) {
  const noteHref = `/field-notes/${note.slug}`

  return (
    <div className={styles.page}>
      {/* meta bar — honest cadence only, no invented participant counts */}
      <div className={styles.metaBar}>
        <span className={styles.metaMono}>The Weekly Challenge · one map, all of us</span>
        <span className={styles.cadence}>new challenge every Monday</span>
      </div>

      {/* hero */}
      <header className={styles.hero}>
        <div className={styles.eyebrow}>This week&apos;s challenge</div>
        <h1 className={styles.title}>{note.title}.</h1>
        <div className={styles.motif} aria-hidden="true">
          <span className={styles.motifStep}>frame</span>
          <span className={styles.motifArrow}>→</span>
          <span className={styles.motifStep}>route</span>
          <span className={styles.motifArrow}>→</span>
          <span className={styles.motifStep}>map</span>
          <span className={styles.motifArrow}>→</span>
          <span className={styles.motifStep}>decide</span>
          <span className={styles.motifArrow}>→</span>
          <span className={styles.motifStep}>prove</span>
        </div>
      </header>

      <div className={styles.grid}>
        {/* THE INCIDENT — real field note as the problem statement */}
        <section className={styles.card} aria-labelledby="brief-label">
          <div id="brief-label" className={`${styles.cardLabel} ${styles.cardLabelRed}`}>
            The incident · {note.category}
          </div>
          <p className={styles.brief}>{note.summary}</p>

          {note.tags.length > 0 && (
            <div className={styles.chipRow}>
              {note.tags.map((tag) => (
                <span key={tag} className={styles.chip}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className={styles.mustBlock}>
            <div className={styles.mustLabel}>Your map must</div>
            <div className={styles.mustRow}>
              <span className={styles.mustNum}>01</span> Name the suspect edge — and why it&apos;s cheapest to check first
            </div>
            <div className={styles.mustRow}>
              <span className={styles.mustNum}>02</span> Draw the path with directions and owners
            </div>
            <div className={styles.mustRow}>
              <span className={styles.mustNum}>03</span> Defend at least one omission in writing
            </div>
          </div>

          <Link href={noteHref} className={styles.briefLink}>
            Read the full field note →
          </Link>
        </section>

        {/* ACTION — honest. No submission backend; route to real places. */}
        <section className={styles.actionCard} aria-labelledby="action-label">
          <div id="action-label" className={`${styles.cardLabel} ${styles.cardLabelAccent}`}>
            Take the challenge
          </div>
          <p className={styles.actionBody}>
            There&apos;s no scoreboard to game here — the point is the reasoning. Draw the map for
            yourself: name the suspect edge, then read how it actually broke and got fixed.
          </p>
          <div className={styles.actionButtons}>
            <Link href={noteHref} className={styles.btnPrimary}>
              Read the full field note →
            </Link>
            <Link href="/academy/catalog" className={styles.btnGhost}>
              Train the skill →
            </Link>
          </div>
          <p className={styles.actionNote}>
            Submissions open with cohorts — no public submit form yet.
          </p>
        </section>
      </div>

      {/* STANDINGS — honest empty state. NEVER fabricated names/votes/ranks. */}
      <section className={styles.standings} aria-labelledby="standings-label">
        <div id="standings-label" className={styles.standingsHeader}>
          Standings
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyTitle}>No standings yet</div>
          <p className={styles.emptyBody}>
            Be the first to name the suspect edge. When cohort submissions and voting open, the
            best-defended maps land here — until then there&apos;s nothing to fake.
          </p>
        </div>
        <div className={styles.rubricNote}>
          the rubric will weigh defended omissions over pretty boxes — and it&apos;ll be public
        </div>
      </section>
    </div>
  )
}
