import Image from 'next/image'
import Link from 'next/link'
import { Icon, type IconName } from '@/components/academy/ui/Icon'
import { topic as topicMeta } from '@/lib/academy/topics'
import type { LearnerPath, PathSummary } from '@/lib/academy/path'
import { PathDomainSection } from './PathDomainSection'
import styles from './path.module.css'

/**
 * "My Path" — the map of where the learner stands across the whole curriculum.
 * Server-rendered, presentational: reads the already-computed LearnerPath and
 * lays it out as hero (position + overall meter) → next action → honest stat
 * band → the six-domain spine. Every number is real; nothing is fabricated for
 * a fresh learner — they get zeros and a clear "begin at the gate" path.
 */

type StatDef = {
  label: string
  value: number
  of?: number
  icon: IconName
  flame?: boolean
}

function buildStats(s: PathSummary): StatDef[] {
  return [
    { label: 'Lessons done', value: s.lessonsDone, of: s.lessonsTotal, icon: 'check' },
    { label: 'Courses started', value: s.coursesStarted, of: s.coursesTotal, icon: 'book' },
    { label: 'Courses complete', value: s.coursesComplete, of: s.coursesTotal, icon: 'target' },
    { label: 'Certificates', value: s.certificates, icon: 'award' },
    { label: 'Day streak', value: s.streak, icon: 'flame', flame: true },
  ]
}

function StatCell({ stat }: { stat: StatDef }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>
        {stat.value}
        {typeof stat.of === 'number' ? <span className={styles.statOf}>/ {stat.of}</span> : null}
      </span>
      <span className={styles.statLabel}>
        <span className={`${styles.statIcon} ${stat.flame ? styles.statIconFlame : ''}`} aria-hidden>
          <Icon name={stat.icon} size={12} />
        </span>
        {stat.label}
      </span>
    </div>
  )
}

export function PathView({ path }: { path: LearnerPath }) {
  const { summary, domains, nextAction, isEmpty } = path
  const stats = buildStats(summary)
  const completedAll = !isEmpty && summary.lessonsTotal > 0 && summary.lessonsDone >= summary.lessonsTotal

  return (
    <div className={styles.page}>
      {/* hero — state the learner's position over the summit scene */}
      <header className={styles.hero}>
        <Image
          src="/path/scenes/summit.png"
          alt=""
          aria-hidden
          fill
          priority
          sizes="(max-width: 1100px) 100vw, 1100px"
          className={styles.heroScene}
        />
        <span className={styles.heroVeil} aria-hidden />
        <div className={styles.heroContent}>
          <p className={styles.heroKicker}>My Path</p>
          <h1 className={styles.heroTitle}>Where you are on the climb</h1>
          <p className={styles.heroSub}>
            {isEmpty
              ? 'The curriculum maps from the gate up through six domains. Your progress fills in here as courses publish.'
              : completedAll
                ? 'Every published lesson is behind you. New domains ship into the path continuously — you are at the front of the climb.'
                : 'The whole curriculum at a glance — what you have finished, where you are now, and what you can pick up next.'}
          </p>

          {!isEmpty && summary.lessonsTotal > 0 && (
            <div className={styles.heroMeter}>
              <div className={styles.heroMeterRow}>
                <span>Overall progress</span>
                <span className={styles.heroMeterPct}>
                  {summary.lessonsDone}/{summary.lessonsTotal} · {summary.pct}%
                </span>
              </div>
              <span
                className={styles.meterTrack}
                role="img"
                aria-label={`Overall: ${summary.pct}% complete, ${summary.lessonsDone} of ${summary.lessonsTotal} lessons`}
              >
                <span className={styles.meterFill} style={{ width: `${summary.pct}%` }} />
              </span>
            </div>
          )}
        </div>
      </header>

      {/* the single dominant next action */}
      {nextAction && (
        <Link href={nextAction.href} className={styles.next}>
          <div className={styles.nextBody}>
            <span className={styles.nextKicker}>
              {nextAction.label} · {topicMeta(nextAction.topic).label}
            </span>
            <span className={styles.nextTitle}>{nextAction.detail}</span>
            <span className={styles.nextSub}>{nextAction.courseTitle}</span>
          </div>
          <span className={styles.nextBtn}>
            {nextAction.label}
            <Icon name="arrow-right" size={16} />
          </span>
        </Link>
      )}

      {/* "where you are" stat band */}
      {!isEmpty && (
        <div className={styles.stats} aria-label="Your progress summary">
          {stats.map((stat) => (
            <StatCell key={stat.label} stat={stat} />
          ))}
        </div>
      )}

      {isEmpty ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden>
            <Icon name="compass" size={26} />
          </span>
          <p className={styles.emptyTitle}>Your path fills in as courses publish.</p>
          <p className={styles.emptySub}>
            No courses are live yet — the curriculum ships into the engine continuously.
          </p>
        </div>
      ) : (
        <div className={styles.spine}>
          <div className={styles.spineHead}>
            <p className={styles.spineHeadKicker}>The curriculum</p>
            <h2 className={styles.spineHeadTitle}>Six domains, one climb</h2>
            <p className={styles.spineHeadSub}>
              Foundations gate the path; from there, engineering, data, AI engineering, shipping,
              and growth build on each other. Pick up any course that is open to you.
            </p>
            <ul className={styles.legend} aria-label="Status legend">
              <li className={styles.legendItem}>
                <span
                  className={styles.legendSwatch}
                  style={{ background: 'var(--ac-mastery)' }}
                  aria-hidden
                />
                Complete
              </li>
              <li className={styles.legendItem}>
                <span
                  className={styles.legendSwatch}
                  style={{ background: 'var(--ac-accent)' }}
                  aria-hidden
                />
                In progress
              </li>
              <li className={styles.legendItem}>
                <span
                  className={styles.legendSwatch}
                  style={{ background: 'transparent', border: '1px solid var(--ac-rule-strong)' }}
                  aria-hidden
                />
                Not started
              </li>
            </ul>
          </div>

          {domains.map((domain, i) => (
            <PathDomainSection key={domain.topic} domain={domain} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
