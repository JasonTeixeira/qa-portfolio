import { topic, type TopicKey } from '@/lib/academy/topics'
import type { MasteryLevel, MasteryMap as MasteryMapData } from '@/lib/academy/mastery-logic'
import styles from './mastery-map.module.css'

/** Legend + cell color per mastery level. Maps to the --ac-* state tokens. */
const LEVEL_META: Record<MasteryLevel, { label: string; token: string; cellClass: string }> = {
  locked: { label: 'Locked', token: 'var(--ac-locked)', cellClass: styles.cellLocked },
  learning: { label: 'Learning', token: 'var(--ac-pending)', cellClass: styles.cellLearning },
  proven: { label: 'Proven', token: 'var(--ac-accent)', cellClass: styles.cellProven },
  mastered: { label: 'Mastered', token: 'var(--ac-mastery)', cellClass: styles.cellMastered },
}

const LEVEL_ORDER: MasteryLevel[] = ['mastered', 'proven', 'learning', 'locked']

function levelDescription(level: MasteryLevel): string {
  switch (level) {
    case 'mastered':
      return 'durable, spaced evidence (score ≥ 90)'
    case 'proven':
      return 'verified build, broken case handled (score ≥ 82)'
    case 'learning':
      return 'evidence accumulating, not yet proven'
    case 'locked':
      return 'prerequisites not met yet'
  }
}

export function MasteryMap({ map }: { map: MasteryMapData }) {
  const { topics, totalUnits, counts, isCollecting } = map

  return (
    <section className={styles.card} aria-labelledby="mastery-map-heading">
      <header className={styles.head}>
        <p className={styles.kicker}>Mastery map</p>
        <h2 id="mastery-map-heading" className={styles.title}>
          You are here
        </h2>
        <p className={styles.sub}>
          A heat-map of your skills, read straight from your evidence — not your click-throughs. Each
          cell is one lesson, colored by what you have actually proven.
        </p>
      </header>

      {isCollecting ? (
        <p className={styles.empty} role="status">
          No evidence yet. As you complete retrieval checks, build artifacts, and verify your labs,
          your skills will light up here. Start a lesson to place your first cell.
        </p>
      ) : (
        <>
          <ul className={styles.legend} aria-label="Mastery levels">
            {LEVEL_ORDER.map((level) => {
              const meta = LEVEL_META[level]
              return (
                <li key={level} className={styles.legendItem}>
                  <span
                    className={styles.swatch}
                    style={{ backgroundColor: meta.token }}
                    aria-hidden="true"
                  />
                  <span className={styles.legendLabel}>{meta.label}</span>
                  <span className={styles.legendCount}>{counts[level]}</span>
                </li>
              )
            })}
          </ul>

          <div className={styles.topics}>
            {topics.map((rollup) => {
              const t = topic(rollup.topicKey as TopicKey)
              return (
                <div key={rollup.topicKey} className={styles.topic}>
                  <div className={styles.topicHead}>
                    <span
                      className={styles.topicDot}
                      style={{ backgroundColor: t.color }}
                      aria-hidden="true"
                    />
                    <h3 className={styles.topicName}>{t.label}</h3>
                    <span className={styles.topicMeta}>
                      {rollup.total} {rollup.total === 1 ? 'skill' : 'skills'}
                      {rollup.avgScore > 0 ? ` · avg ${rollup.avgScore}` : ''}
                    </span>
                  </div>
                  <ul className={styles.grid} aria-label={`${t.label} skills`}>
                    {rollup.units.map((unit) => {
                      const meta = LEVEL_META[unit.level]
                      return (
                        <li key={`${unit.courseSlug}::${unit.lessonSlug}`}>
                          <span
                            className={`${styles.cell} ${meta.cellClass}`}
                            title={`${unit.label} — ${meta.label} (${levelDescription(unit.level)})`}
                          >
                            <span className={styles.srOnly}>
                              {unit.label}: {meta.label}, {levelDescription(unit.level)}
                            </span>
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>

          <p className={styles.footnote}>
            {totalUnits} {totalUnits === 1 ? 'skill' : 'skills'} tracked. Levels are derived from the
            evidence spine; a high score requires verified, spaced, transferred work — internal
            evidence alone tops out below the outcome cap.
          </p>
        </>
      )}
    </section>
  )
}
