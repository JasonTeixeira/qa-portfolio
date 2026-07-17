import Link from 'next/link'
import type { LearnerDashboard, DashCourse } from '@/lib/academy/learner'
import { TOPICS } from '@/lib/academy/topics'
import type { GamificationState } from '@/lib/academy/gamification-logic'
import type { GoalProgress } from '@/lib/academy/goal-logic'
import type { QuestProgress, BonusState } from '@/lib/academy/quest-logic'
import type { Trigger } from '@/lib/academy/trigger-logic'
import type { NextRewards } from '@/lib/academy/reward-logic'
import type { EvidenceItem } from '@/lib/academy/evidence'
import { PushOptIn } from '@/components/academy/notifications/PushOptIn'
import { NextUp } from './NextUp'
import { TriggerBanner } from '@/components/academy/triggers/TriggerBanner'
import { QuestPanel } from '@/components/academy/quests/QuestPanel'
import { JourneyHero } from './JourneyHero'
import { SoundToggle } from '@/components/academy/ui/SoundToggle'
import { Icon } from '@/components/academy/ui/Icon'
import styles from './dashboard.module.css'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const titleCase = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

interface DashboardProps {
  dash: LearnerDashboard
  game?: GamificationState | null
  /** Progress toward the learner's chosen goal (null = no goal set). */
  journey?: GoalProgress | null
  /** Where the journey's next-milestone CTA points (resume point or catalog). */
  journeyNextHref?: string
  /** Profile display name, when set — shown instead of the email-derived name. */
  displayName?: string | null
  /** Today's quests with honest, server-derived progress. */
  dailyQuests?: QuestProgress[]
  /** This week's quests with honest, server-derived progress. */
  weeklyQuests?: QuestProgress[]
  /** Today's deterministic variable-reward bonus (server-derived). */
  dailyBonus?: BonusState | null
  /** Prioritised in-app nudges (top 1-2). Empty -> the banner renders nothing. */
  triggers?: Trigger[]
  /** Near-miss / next-reward bundle (closest badge, XP-to-level, league gap). */
  rewards?: NextRewards | null
  /** Resume point (or catalog) — where the near-miss CTAs send the learner. */
  nextHref?: string
  /** Real FSRS recall count due right now (0 when nothing is due / unavailable). */
  recallDue?: number
  /** Real shipped-proof timeline (evidence ledger), newest first. */
  evidence?: EvidenceItem[]
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const

export function Dashboard({
  dash,
  game,
  journey = null,
  journeyNextHref = '/academy/catalog',
  displayName = null,
  dailyQuests = [],
  weeklyQuests = [],
  dailyBonus = null,
  triggers = [],
  rewards = null,
  nextHref = '/academy/catalog',
  recallDue = 0,
  evidence = [],
}: DashboardProps) {
  if (!dash.signedIn) {
    return (
      <div className={styles.page}>
        <div className={styles.gate}>
          <p className={styles.kicker}>My Learning</p>
          <h1 className={styles.gateTitle}>Sign in to track your learning.</h1>
          <p className={styles.gateBody}>
            Your progress, courses, and certificates live here once you’re in.
          </p>
          <Link href="/login?audience=academy&next=/academy/dashboard" className={styles.gateBtn}>
            Sign in
            <Icon name="arrow-right" size={16} aria-hidden />
          </Link>
          <Link href="/academy" className={styles.gateAlt}>
            Back to the Academy
          </Link>
        </div>
      </div>
    )
  }

  const name = displayName ?? cap(dash.name)

  // The dominant course to continue — the resume target's course, else the most-progressed.
  const continueCourse = dash.continueTo
    ? dash.courses.find((c) => c.slug === dash.continueTo!.courseSlug)
    : dash.courses.find((c) => c.total > 0 && c.done > 0 && c.done < c.total)
  const resumeHref = dash.continueTo
    ? `/academy/learn/${dash.continueTo.courseSlug}/${dash.continueTo.lessonSlug}`
    : nextHref

  // Real "one arrow" framing without a fabricated mastery score: the honest next
  // action is resuming the in-flight lesson (else the goal's next milestone, else
  // the catalog). We name the real course + lesson, never an invented "78 → 91".
  const heroTitle = dash.continueTo && continueCourse
    ? `Continue ${continueCourse.title} — pick up ${titleCase(dash.continueTo.lessonSlug)}.`
    : journey?.nextMilestone
      ? journey.nextMilestone.label
      : 'Start your first build — pick a track from the catalog.'
  const heroBody = dash.continueTo && continueCourse
    ? `You’re ${continueCourse.pct}% through this course. Your place is saved to the exact block — resume in one click.`
    : journey
      ? `Your goal: ${journey.label}. This is the next milestone on the path — one action moves the needle.`
      : 'Every lesson you start keeps its place, so you can always resume in one click.'
  const heroCtaLabel = dash.continueTo ? 'Resume the lesson' : journey?.nextMilestone ? 'Continue the path' : 'Browse the catalog'
  const heroMeta = continueCourse ? `${continueCourse.done} of ${continueCourse.total} lessons done` : 'your first proof awaits'

  // Ledger summary line — all real: shipped proofs + certs + courses.
  const shippedCount = dash.lessonsCompleted
  const ledgerLine = `ledger: ${shippedCount} proof${shippedCount === 1 ? '' : 's'} · ${dash.coursesInProgress} in progress · ${dash.certificates.length} certificate${dash.certificates.length === 1 ? '' : 's'}`

  // Real per-course progress rows (the honest analog of the design's "mastery" panel).
  const courseRows = dash.courses.filter((c) => c.total > 0).slice(0, 4)

  // Real streak trailing-7 (same honest fill the old strip used).
  const streak = game?.streak
  const streakDays = streak
    ? (() => {
        const today = new Date()
        const filledFromOffset = streak.activeToday ? 0 : 1
        return Array.from({ length: 7 }, (_, i) => {
          const offset = 6 - i
          const d = new Date(today)
          d.setDate(today.getDate() - offset)
          const within = offset >= filledFromOffset && offset < filledFromOffset + streak.current
          return { key: offset, label: DAY_LABELS[d.getDay()], active: within, isToday: offset === 0 }
        })
      })()
    : []

  const dateLine = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className={styles.page}>
      {/* header row */}
      <div className={styles.topline}>
        <div>
          <div className={styles.dateLine}>{dateLine} · your cockpit</div>
          <h1 className={styles.headline}>Welcome back, {name}.</h1>
        </div>
        <div className={styles.ledgerLine}>{ledgerLine}</div>
      </div>

      <div className={styles.bento}>
        {/* HERO — the one real next action */}
        <Link href={resumeHref} className={styles.hero}>
          <div className={styles.heroTop}>
            <span className={styles.heroTag}>One arrow · next best action</span>
            <span className={styles.heroLeverage}>{dash.continueTo ? 'resume' : 'start here'}</span>
          </div>
          <div className={styles.heroTitle}>{heroTitle}</div>
          <p className={styles.heroBody}>{heroBody}</p>
          <div className={styles.heroActions}>
            <span className={styles.heroCta}>
              {heroCtaLabel}
              <Icon name="arrow-right" size={16} aria-hidden />
            </span>
            <span className={styles.heroMeta}>{heroMeta}</span>
          </div>
        </Link>

        {/* CONTINUE / course map */}
        {continueCourse ? (
          <Link href={`/academy/course/${continueCourse.slug}`} className={styles.continue}>
            <div className={styles.panelHead}>
              <span className={styles.panelKicker}>Continue</span>
              <span className={styles.panelLink}>{TOPICS[continueCourse.topic].label} · map →</span>
            </div>
            <div className={styles.continueTitle}>{continueCourse.title}</div>
            <SegmentBar course={continueCourse} />
            <div className={styles.continueStat}>
              <span>{continueCourse.done} of {continueCourse.total} lessons</span>
              <span className={styles.continueStatPct}>{continueCourse.pct}%</span>
            </div>
            {dash.continueTo ? (
              <div className={styles.continueFoot}>
                <span className={styles.continueGlyph} aria-hidden>
                  <Icon name="play" size={14} />
                </span>
                <div className={styles.continueFootBody}>
                  <div className={styles.continueFootTitle}>{titleCase(dash.continueTo.lessonSlug)}</div>
                  <div className={styles.continueFootMeta}>your next lesson — saved in place</div>
                </div>
                <span className={styles.continueFootLink}>open →</span>
              </div>
            ) : null}
          </Link>
        ) : (
          rewards ? (
            <div className={`${styles.continue} ${styles.continueHug}`}>
              <div className={styles.panelHead}>
                <span className={styles.panelKicker}>Next up</span>
              </div>
              <NextUp rewards={rewards} nextHref={nextHref} compact />
            </div>
          ) : null
        )}

        {/* PER-COURSE PROGRESS (real) */}
        {courseRows.length > 0 ? (
          <section className={`${styles.panel} ${styles.mastery}`} aria-label="Course progress">
            <div className={styles.panelHead}>
              <span className={styles.panelKicker}>Progress · honestly measured</span>
              <Link href="/academy/catalog" className={styles.panelLink}>find more →</Link>
            </div>
            {courseRows.map((c) => {
              const finished = c.done >= c.total
              return (
                <div key={c.slug} className={styles.masteryRow}>
                  <div className={styles.masteryRowHead}>
                    <span className={styles.masteryName}>{c.title}</span>
                    <span className={styles.masteryScore} data-done={finished || undefined}>
                      {c.done}/{c.total}
                    </span>
                  </div>
                  <div className={styles.masteryTrack}>
                    <div
                      className={styles.masteryFill}
                      data-done={finished || undefined}
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                  <div className={styles.masteryFoot}>
                    <span className={styles.masteryReason}>{TOPICS[c.topic].label}</span>
                    <span className={styles.masteryLift} data-done={finished || undefined}>
                      {finished ? 'complete' : `${c.pct}%`}
                    </span>
                  </div>
                </div>
              )
            })}
          </section>
        ) : null}

        {/* EVIDENCE LEDGER (real shipped proofs) */}
        <section className={`${styles.panel} ${styles.ledger}`} aria-label="Evidence ledger">
          <div className={styles.panelHead}>
            <span className={styles.panelKicker}>
              Evidence ledger · {shippedCount} proof{shippedCount === 1 ? '' : 's'}
            </span>
            <Link href="/academy/evidence" className={styles.panelLink}>view portfolio →</Link>
          </div>
          {evidence.length > 0 ? (
            <div className={styles.ledgerRows}>
              {evidence.slice(0, 5).map((e) => (
                <div key={`${e.courseSlug}:${e.lessonSlug}:${e.at}`} className={styles.ledgerRow}>
                  <span className={styles.ledgerClaim}>{e.lessonTitle}</span>
                  <span className={styles.ledgerArtifact}>{e.courseTitle}</span>
                  <span className={styles.ledgerBadge}>PROVEN</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.ledgerEmpty}>
              <span className={styles.ledgerEmptyLede}>
                No rows yet — your first proof creates the first one.
              </span>
              <span className={styles.ledgerEmptySub}>
                Finish a lesson and its proof lands here — a timeline you can show an employer.
              </span>
            </p>
          )}
        </section>

        {/* MOMENTUM · weekly XP + streak (real) */}
        {game ? (
          <section className={`${styles.panel} ${styles.momentum}`} aria-label="Momentum">
            <div className={styles.panelHead}>
              <span className={styles.panelKicker}>Momentum · level {game.xp.level}</span>
              <span
                className={styles.momentumSafe}
                data-state={game.streak.activeToday ? 'on' : 'warn'}
              >
                {game.streak.current}-day streak{game.streak.activeToday ? ' · active' : ' · on the line'}
              </span>
            </div>
            {/* XP progress toward next level — the one honest weekly bar we have. */}
            <div className={styles.xpBars} aria-hidden>
              {(() => {
                // Real: level progress split into 8 filled/empty ticks (level pct).
                const filled = Math.round((game.xp.pct / 100) * 8)
                return Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className={styles.xpCol}>
                    <div
                      className={`${styles.xpBar} ${i < filled ? styles.xpBarNow : ''}`}
                      style={{ height: i < filled ? '100%' : '22%' }}
                    />
                    <div className={styles.xpLabel}>{i + 1}</div>
                  </div>
                ))
              })()}
            </div>
            <div className={styles.momentumSafe}>
              {game.xp.intoLevel}/{150} XP into level {game.xp.level} · {game.xp.toNext} to level {game.xp.level + 1}
            </div>
            {streakDays.length > 0 ? (
              <ol className={styles.streakGrid} aria-label="Last 7 days">
                {streakDays.map((d) => (
                  <li
                    key={d.key}
                    className={`${styles.streakCell} ${d.active ? styles.streakOn : ''} ${d.isToday ? styles.streakToday : ''}`}
                    title={d.isToday ? 'Today' : undefined}
                  >
                    <span className={styles.streakDot} aria-hidden>
                      <Icon name={d.active ? 'flame' : 'dot'} size={d.active ? 13 : 8} />
                    </span>
                    <span className={styles.streakDay}>{d.label}</span>
                    <span className={styles.srOnly}>
                      {d.label}{d.isToday ? ' (today)' : ''}: {d.active ? 'active' : 'no activity'}
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}
          </section>
        ) : null}

        {/* RETENTION · recall pressure (real FSRS) */}
        {game ? (
          <section className={`${styles.panel} ${styles.retention}`} aria-label="Recall pressure">
            <div className={styles.panelHead}>
              <span className={styles.panelKicker}>Recall · holds under pressure</span>
              <span className={styles.retentionStat} data-due={recallDue > 0 || undefined}>
                {recallDue > 0 ? `${recallDue} due` : 'all clear'}
              </span>
            </div>
            <div className={styles.retentionCards}>
              <div className={`${styles.retentionCard} ${recallDue > 0 ? styles.retentionCardDue : ''}`}>
                <div className={`${styles.retentionBig} ${recallDue > 0 ? styles.retentionBigDue : ''}`}>
                  {recallDue}
                </div>
                <div className={styles.retentionSub}>due today</div>
              </div>
              <div className={styles.retentionCard}>
                <div className={styles.retentionBig}>{dash.lessonsCompleted}</div>
                <div className={styles.retentionSub}>concepts tracked</div>
              </div>
            </div>
            <Link
              href="/academy/review"
              className={`${styles.recallCta} ${recallDue === 0 ? styles.recallCtaClear : ''}`}
            >
              {recallDue > 0 ? `Recall ${recallDue} concept${recallDue === 1 ? '' : 's'}` : 'Open the recall queue'}
              <Icon name="refresh" size={14} aria-hidden />
            </Link>
          </section>
        ) : null}

        {/* CERTIFICATES strip (real earned certs) */}
        {dash.certificates.length > 0 ? (
          <section className={styles.certs} aria-label="Certificates">
            <span className={styles.certsKicker}>Certificates</span>
            {dash.certificates.slice(0, 4).map((cert) => (
              <Link key={cert.code} href={`/academy/certificate/${cert.code}`} className={styles.certChip}>
                <span className={styles.certSeal} aria-hidden>
                  <Icon name="trophy" size={16} />
                </span>
                <div>
                  <div className={styles.certChipTitle}>{cert.courseTitle}</div>
                  <div className={styles.certChipCode}>{cert.code} · verifiable</div>
                </div>
              </Link>
            ))}
            <Link href="/academy/catalog" className={styles.certsMore}>explore more tracks →</Link>
          </section>
        ) : null}

        {/* Real supporting panels — kept exactly, calm placement below the bento. */}
        <div className={styles.subPanels}>
          <TriggerBanner triggers={triggers} />
          <JourneyHero progress={journey} nextHref={journeyNextHref} />
          <QuestPanel daily={dailyQuests} weekly={weeklyQuests} bonus={dailyBonus ?? undefined} />
          <PushOptIn />
        </div>

        {/* utility footer */}
        <nav className={styles.utilityNav} aria-label="More">
          <Link href="/academy/catalog" className={styles.utilityLink}>
            <Icon name="book" size={14} aria-hidden />
            Browse catalog
          </Link>
          <Link href="/academy/refer" className={styles.utilityLink}>
            <Icon name="users" size={14} aria-hidden />
            Invite a friend
          </Link>
          <Link href="/academy/profile" className={styles.utilityLink}>
            <Icon name="trophy" size={14} aria-hidden />
            Public profile
          </Link>
          <Link href="/academy/efficacy" className={styles.utilityLink}>
            <Icon name="target" size={14} aria-hidden />
            Does it work?
          </Link>
          <SoundToggle className={styles.soundToggle} />
        </nav>
      </div>
    </div>
  )
}

/** Real module/lesson segment bar — filled proportional to lessons done. */
function SegmentBar({ course }: { course: DashCourse }) {
  // Honest: N segments = lesson count (capped at 8 for layout), filled = done.
  const segs = Math.min(Math.max(course.total, 1), 8)
  const doneRatio = course.total > 0 ? course.done / course.total : 0
  const filled = Math.round(doneRatio * segs)
  return (
    <div className={styles.continueBar} aria-hidden>
      {Array.from({ length: segs }, (_, i) => {
        const isNow = i === filled && filled < segs
        const cls = i < filled ? styles.continueSegDone : isNow ? styles.continueSegNow : ''
        return <div key={i} className={`${styles.continueSeg} ${cls}`} />
      })}
    </div>
  )
}
