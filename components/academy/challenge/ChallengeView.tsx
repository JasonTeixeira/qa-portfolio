import Link from 'next/link'
import type { FieldNote } from '@/lib/field-notes'
import { getT } from '@/lib/i18n/t'
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
export async function ChallengeView({ note }: ChallengeViewProps) {
  const t = await getT()
  const noteHref = `/field-notes/${note.slug}`

  return (
    <div className={styles.page}>
      {/* meta bar — honest cadence only, no invented participant counts */}
      <div className={styles.metaBar}>
        <span className={styles.metaMono}>{t("This week's map-along · one map, all of us")}</span>
        <span className={styles.cadence}>{t('read the note, map the system, compare')}</span>
      </div>

      {/* hero */}
      <header className={styles.hero}>
        <div className={styles.eyebrow}>{t("This week's challenge")}</div>
        <h1 className={styles.title}>
          {note.title}
          {t('.')}
        </h1>
        <div className={styles.motif} aria-hidden="true">
          <span className={styles.motifStep}>{t('frame')}</span>
          <span className={styles.motifArrow}>→</span>
          <span className={styles.motifStep}>{t('route')}</span>
          <span className={styles.motifArrow}>→</span>
          <span className={styles.motifStep}>{t('map')}</span>
          <span className={styles.motifArrow}>→</span>
          <span className={styles.motifStep}>{t('decide')}</span>
          <span className={styles.motifArrow}>→</span>
          <span className={styles.motifStep}>{t('prove')}</span>
        </div>
      </header>

      <div className={styles.grid}>
        {/* THE INCIDENT — real field note as the problem statement */}
        <section className={styles.card} aria-labelledby="brief-label">
          <div id="brief-label" className={`${styles.cardLabel} ${styles.cardLabelRed}`}>
            {t('The incident ·')} {note.category}
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
            <div className={styles.mustLabel}>{t('Your map must')}</div>
            <div className={styles.mustRow}>
              <span className={styles.mustNum}>01</span>{' '}
              {t("Name the suspect edge — and why it's cheapest to check first")}
            </div>
            <div className={styles.mustRow}>
              <span className={styles.mustNum}>02</span> {t('Draw the path with directions and owners')}
            </div>
            <div className={styles.mustRow}>
              <span className={styles.mustNum}>03</span> {t('Defend at least one omission in writing')}
            </div>
          </div>

          <Link href={noteHref} className={styles.briefLink}>
            {t('Read the full field note →')}
          </Link>
        </section>

        {/* ACTION — honest. No submission backend; route to real places. */}
        <section className={styles.actionCard} aria-labelledby="action-label">
          <div id="action-label" className={`${styles.cardLabel} ${styles.cardLabelAccent}`}>
            {t('Take the challenge')}
          </div>
          <p className={styles.actionBody}>
            {t(
              "There's no scoreboard to game here — the point is the reasoning. Draw the map for yourself: name the suspect edge, then read how it actually broke and got fixed.",
            )}
          </p>
          <div className={styles.actionButtons}>
            <Link href={noteHref} className={styles.btnPrimary}>
              {t('Read the full field note →')}
            </Link>
            <Link href="/academy/catalog" className={styles.btnGhost}>
              {t('Train the skill →')}
            </Link>
          </div>
          <p className={styles.actionNote}>
            {t('Submissions open with cohorts — no public submit form yet.')}
          </p>
        </section>
      </div>

      {/* STANDINGS — honest empty state. NEVER fabricated names/votes/ranks. */}
      <section className={styles.standings} aria-labelledby="standings-label">
        <div id="standings-label" className={styles.standingsHeader}>
          {t('Standings')}
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyTitle}>{t('No standings yet')}</div>
          <p className={styles.emptyBody}>
            {t(
              "Be the first to name the suspect edge. When cohort submissions and voting open, the best-defended maps land here — until then there's nothing to fake.",
            )}
          </p>
        </div>
        <div className={styles.rubricNote}>
          {t("the rubric will weigh defended omissions over pretty boxes — and it'll be public")}
        </div>
      </section>
    </div>
  )
}
