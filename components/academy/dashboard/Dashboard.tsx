import Link from 'next/link'
import type { CSSProperties } from 'react'
import { topic, TOPICS } from '@/lib/academy/topics'
import type { LearnerDashboard } from '@/lib/academy/learner'
import type { GamificationState } from '@/lib/academy/gamification-logic'
import type { GoalProgress } from '@/lib/academy/goal-logic'
import type { QuestProgress } from '@/lib/academy/quest-logic'
import type { Trigger } from '@/lib/academy/trigger-logic'
import type { NextRewards } from '@/lib/academy/reward-logic'
import { PushOptIn } from '@/components/academy/notifications/PushOptIn'
import { NextUp } from './NextUp'
import { TriggerBanner } from '@/components/academy/triggers/TriggerBanner'
import { QuestPanel } from '@/components/academy/quests/QuestPanel'
import { ProgressBar } from '@/components/academy/shell/ProgressBar'
import { CountUp } from '@/components/academy/ui/CountUp'
import { GrowBar } from '@/components/academy/ui/GrowBar'
import { SoundToggle } from '@/components/academy/ui/SoundToggle'
import { JourneyHero } from './JourneyHero'
import styles from './dashboard.module.css'

const ACCENT = '#3D6BFF'

function tvars(t: ReturnType<typeof topic>): CSSProperties {
  return { ['--topic']: t.color, ['--topic-soft']: t.soft } as CSSProperties
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const titleCase = (s: string) =>
  s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

/** Honest progress ring (real %). Part of the design system, not decoration. */
function Ring({
  pct,
  size = 60,
  stroke = 5,
  color = ACCENT,
}: {
  pct: number
  size?: number
  stroke?: number
  color?: string
}) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, pct))
  const offset = circ * (1 - clamped / 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={styles.ring} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className={styles.ringText}>
        {clamped}%
      </text>
    </svg>
  )
}

/**
 * Stakes + identity copy for the streak card. Loss aversion without lying: we only
 * claim "your longest yet" when the live streak genuinely equals the recorded peak
 * (and is non-trivial). Freeze info is demoted to a small secondary reassurance —
 * never the headline — so banked freezes can't read as "you're safe, skip today".
 */
function streakStakesCopy(streak: GamificationState['streak']): {
  headline: string
  stakes: string
  reassurance: string | null
} {
  const { current, longest, freezes, activeToday } = streak

  if (current <= 0) {
    return {
      headline: 'Start a streak',
      stakes: 'Finish one lesson to put the first day on the board',
      reassurance: null,
    }
  }

  const isPersonalBest = current > 1 && current >= longest
  const headline = isPersonalBest
    ? 'Personal best — on the line'
    : activeToday
      ? 'Streak alive — keep it going'
      : 'On the line today'

  // The stakes line leads with identity/loss — never reassurance, even when today is
  // already banked. At peak it's the thing to PROTECT; otherwise it's the thing not to
  // let RESET. (Freezes only soften this afterward, never replace it.)
  const stakes = isPersonalBest
    ? 'Your longest streak yet — protect it'
    : 'Don’t let it reset'

  const reassurance =
    !activeToday && freezes > 0
      ? `${freezes} freeze${freezes === 1 ? '' : 's'} can cover one missed day — but don’t spend it`
      : null

  return { headline, stakes, reassurance }
}

/** Today panel — the habit core surfaced: daily-goal ring, streak + freezes, level/XP. */
function HabitPanel({ game }: { game: GamificationState }) {
  const { streak, xp, dailyGoal } = game
  const goalPct = dailyGoal.goalXp > 0 ? Math.round((dailyGoal.todayXp / dailyGoal.goalXp) * 100) : 0
  const freezePips = Array.from({ length: Math.max(streak.freezes, 0) })
  const streakStakes = streakStakesCopy(streak)

  return (
    <section className={styles.habit} aria-label="Today">
      {/* Daily goal */}
      <div className={`${styles.habitCard} ${dailyGoal.met ? styles.habitMet : ''}`}>
        <Ring pct={goalPct} size={64} stroke={6} color={dailyGoal.met ? '#2dd4bf' : ACCENT} />
        <div className={styles.habitMeta}>
          <span className={styles.habitLabel}>Daily goal</span>
          <span className={styles.habitValue}>
            <CountUp value={dailyGoal.todayXp} /> <span className={styles.habitDim}>/ {dailyGoal.goalXp} XP</span>
          </span>
          <span className={styles.habitSub}>{dailyGoal.met ? '✓ Goal hit today' : 'Earn XP to close the ring'}</span>
        </div>
      </div>

      {/* Streak — stakes + identity, not reassurance. The headline names what's on
          the line (a personal best, or "don't let it reset"); freeze info is only a
          small secondary line AFTER the stakes, never the lead. */}
      <div className={`${styles.habitCard} ${streak.activeToday ? styles.habitActive : ''}`}>
        <span className={styles.flame} aria-hidden="true">
          {streak.current > 0 ? '🔥' : '○'}
        </span>
        <div className={styles.habitMeta}>
          <span className={styles.habitLabel}>{streakStakes.headline}</span>
          <span className={styles.habitValue}>
            {streak.current} <span className={styles.habitDim}>{streak.current === 1 ? 'day' : 'days'}</span>
          </span>
          <span className={styles.habitSub}>{streakStakes.stakes}</span>
          {streakStakes.reassurance ? (
            <span className={styles.freezeNote}>
              <span className={styles.freezePips} aria-hidden="true">
                {freezePips.map((_, i) => (
                  <span key={i}>❄</span>
                ))}
              </span>
              {streakStakes.reassurance}
            </span>
          ) : null}
        </div>
      </div>

      {/* Level / XP */}
      <div className={styles.habitCard}>
        <span className={styles.levelBadge} aria-hidden="true">
          <CountUp value={xp.level} />
        </span>
        <div className={styles.habitMeta}>
          <span className={styles.habitLabel}>Level {xp.level}</span>
          <GrowBar
            value={xp.pct}
            color="var(--ac-accent, #3D6BFF)"
            className={styles.xpGrowBar}
            ariaLabel={`Level ${xp.level} progress: ${xp.pct}% to level ${xp.level + 1}`}
          />
          <span className={styles.habitSub}>{xp.toNext} XP to level {xp.level + 1}</span>
        </div>
      </div>
    </section>
  )
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const

/**
 * Honest trailing 7-day streak strip. We only have streak length + activeToday
 * (no per-day event log is surfaced), so we fill the last N days the current
 * streak provably covers — ending today when active, else ending yesterday.
 * No fabricated history beyond the known streak length.
 */
function StreakStrip({ streak }: { streak: GamificationState['streak'] }) {
  const today = new Date()
  const filledFromOffset = streak.activeToday ? 0 : 1
  const days = Array.from({ length: 7 }, (_, i) => {
    const offset = 6 - i // 0 = today, 6 = six days ago
    const d = new Date(today)
    d.setDate(today.getDate() - offset)
    const within = offset >= filledFromOffset && offset < filledFromOffset + streak.current
    const isToday = offset === 0
    return { key: offset, label: DAY_LABELS[d.getDay()], active: within, isToday }
  })
  const summary =
    streak.current > 0
      ? `${streak.current}-day streak${streak.activeToday ? ' · active today' : ' · keep it alive today'}`
      : 'No streak yet — complete a lesson to start one'

  return (
    <section className={styles.streak} aria-label="Activity streak">
      <div className={styles.streakHead}>
        <span className={styles.streakKicker}>Last 7 days</span>
        <span className={styles.streakSummary}>{summary}</span>
      </div>
      <ol className={styles.streakRow}>
        {days.map((d) => (
          <li
            key={d.key}
            className={`${styles.streakCell} ${d.active ? styles.streakOn : ''} ${d.isToday ? styles.streakToday : ''}`}
            title={d.isToday ? 'Today' : undefined}
          >
            <span className={styles.streakDot} aria-hidden="true">{d.active ? '🔥' : '·'}</span>
            <span className={styles.streakDay}>{d.label}</span>
            <span className={styles.srOnly}>
              {d.label}
              {d.isToday ? ' (today)' : ''}: {d.active ? 'active' : 'no activity'}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

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
  /** Prioritised in-app nudges (top 1-2). Empty → the banner renders nothing. */
  triggers?: Trigger[]
  /** Near-miss / next-reward bundle (closest badge, XP-to-level, league gap). */
  rewards?: NextRewards | null
  /** Resume point (or catalog) — where the near-miss CTAs send the learner. */
  nextHref?: string
}

export function Dashboard({
  dash,
  game,
  journey = null,
  journeyNextHref = '/academy/catalog',
  displayName = null,
  dailyQuests = [],
  weeklyQuests = [],
  triggers = [],
  rewards = null,
  nextHref = '/academy/catalog',
}: DashboardProps) {
  if (!dash.signedIn) {
    return (
      <div className={styles.page}>
        <div className={styles.atmosphere} aria-hidden="true" />
        <div className={styles.gate}>
          <p className={styles.kicker}>My Learning</p>
          <h1 className={styles.gateTitle}>Sign in to track your learning.</h1>
          <p className={styles.gateBody}>Your progress, courses, and certificates live here once you’re in.</p>
          <Link href="/login?audience=academy&next=/academy/dashboard" className={styles.gateBtn}>
            Sign in →
          </Link>
          <Link href="/academy" className={styles.gateAlt}>
            Back to the Academy
          </Link>
        </div>
      </div>
    )
  }

  const inProgress = dash.courses.find((c) => c.total > 0 && c.done > 0 && c.done < c.total)
  const continueCourse = dash.continueTo
    ? dash.courses.find((c) => c.slug === dash.continueTo!.courseSlug)
    : undefined
  const subtitle = inProgress
    ? `You’re ${inProgress.pct}% through ${inProgress.title}. Keep the momentum.`
    : dash.courses.length
      ? 'Pick a course back up and keep building.'
      : 'Your first build is one click away — browse the catalog below.'

  // The ONE dominant next action — promoted directly under the header so it
  // outweighs every secondary chip/stat. Its strongest styling lives in `.resume`.
  const resumeBlock = dash.continueTo ? (
    <Link
      href={`/academy/learn/${dash.continueTo.courseSlug}/${dash.continueTo.lessonSlug}`}
      className={styles.resume}
    >
      <span className={styles.resumeGlow} aria-hidden="true" />
      <div className={styles.resumeBody}>
        <span className={styles.resumeKicker}>▸ Pick up where you left off</span>
        <span className={styles.resumeTitle}>{titleCase(dash.continueTo.lessonSlug)}</span>
        {continueCourse ? (
          <span className={styles.resumeCourse}>
            {continueCourse.title} · {continueCourse.done}/{continueCourse.total} lessons
          </span>
        ) : null}
      </div>
      {continueCourse ? <Ring pct={continueCourse.pct} /> : null}
      <span className={styles.resumeBtn}>Finish lesson →</span>
    </Link>
  ) : null

  return (
    <div className={styles.page}>
      <div className={styles.atmosphere} aria-hidden="true" />

      {/* A tiny eyebrow kicker is the only thing allowed above the hero — it labels the
          surface without competing as a CTA. The greeting headline and the timely
          nudge both sit BELOW the hero so the eye lands on the reward action first. */}
      <p className={`${styles.kicker} ${styles.eyebrow}`}>My Learning</p>

      {/* THE single dominant next action — the FIRST focal point on the page: resume the
          lesson when there is one (the literal "do this next"), otherwise the
          closest-reward hero from NextUp. Only one hero-scale block renders here so the
          eye lands on exactly one thing. */}
      {resumeBlock ?? (rewards ? <NextUp rewards={rewards} nextHref={nextHref} /> : null)}

      {/* When resume IS the hero, NextUp's closest-reward block renders below it as a
          clearly secondary motivator (still hero-internally, but demoted in the page
          flow). When there's no resume, NextUp already played the hero role above. */}
      {resumeBlock && rewards ? <NextUp rewards={rewards} nextHref={nextHref} compact /> : null}

      {/* Timely urgent nudge (e.g. review-due / streak-resets-in-9h) — demoted to sit
          BELOW the hero so its blue pill reads as a secondary nudge, not the top CTA. */}
      <TriggerBanner triggers={triggers} />

      {/* Identity/greeting — context, not an action; demoted below the hero so it never
          out-ranks the reward action for the eye. */}
      <header className={styles.head}>
        <h1 className={styles.title}>Welcome back, {displayName ?? cap(dash.name)}.</h1>
        <p className={styles.sub}>{subtitle}</p>
        <nav className={styles.quickNav} aria-label="Learner areas">
          <Link href="/academy/refer">◆ Invite a friend</Link>
          <Link href="/academy/profile">◆ Public profile</Link>
          <Link href="/academy/efficacy">↗ Does it work?</Link>
          <Link href="/academy/catalog">Browse catalog →</Link>
          <SoundToggle className={styles.soundToggle} />
        </nav>
      </header>

      {/* Goal context — demoted beneath the action so it never competes with it. */}
      <JourneyHero progress={journey} nextHref={journeyNextHref} />

      {game ? <HabitPanel game={game} /> : null}
      {game ? <StreakStrip streak={game.streak} /> : null}

      <PushOptIn />

      <dl className={styles.stats}>
        <div className={styles.stat} data-zero={dash.lessonsCompleted === 0}>
          <dt><CountUp value={dash.lessonsCompleted} /></dt>
          <dd>Lessons completed</dd>
        </div>
        <div
          className={`${styles.stat} ${dash.coursesInProgress ? styles.statLive : ''}`}
          data-zero={dash.coursesInProgress === 0}
        >
          <dt><CountUp value={dash.coursesInProgress} /></dt>
          <dd>In progress</dd>
        </div>
        <div className={styles.stat} data-zero={dash.coursesCompleted === 0}>
          <dt><CountUp value={dash.coursesCompleted} /></dt>
          <dd>Courses finished</dd>
        </div>
        <div className={styles.stat} data-zero={dash.certificates.length === 0}>
          <dt><CountUp value={dash.certificates.length} /></dt>
          <dd>Certificates</dd>
        </div>
      </dl>

      <QuestPanel daily={dailyQuests} weekly={weeklyQuests} />

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.h2}>Your courses</h2>
          {dash.courses.length > 0 ? (
            <Link href="/academy/catalog" className={styles.sectionLink}>
              Find more →
            </Link>
          ) : null}
        </div>
        {dash.courses.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyGlyph} aria-hidden="true">◆</span>
            <div className={styles.emptyBody}>
              <p className={styles.emptyTitle}>Nothing in progress yet.</p>
              <p className={styles.emptyHelp}>
                Pick a track from the catalog and your first build lands here — every lesson you
                start keeps its place so you can resume in one click.
              </p>
            </div>
            <Link href="/academy/catalog" className={styles.emptyCta}>
              Browse the catalog →
            </Link>
          </div>
        ) : (
          <div className={styles.courseGrid}>
            {dash.courses.map((c) => {
              const t = topic(c.topic)
              const finished = c.total > 0 && c.done >= c.total
              return (
                <Link
                  key={c.slug}
                  href={`/academy/course/${c.slug}`}
                  className={styles.courseCard}
                  style={tvars(t)}
                >
                  <div className={styles.courseTop}>
                    <span className={styles.courseTag}>{TOPICS[c.topic].label}</span>
                    <Ring pct={c.pct} size={44} stroke={4} color={t.color} />
                  </div>
                  <h3 className={styles.courseTitle}>{c.title}</h3>
                  <span className={styles.courseMeta}>
                    {c.done} / {c.total} lessons · {c.pct}%
                  </span>
                  <ProgressBar
                    value={c.pct}
                    size="sm"
                    className={styles.courseProgress}
                    ariaLabel={`${c.title}: ${c.done} of ${c.total} lessons complete`}
                  />
                  <span className={styles.courseCta}>{finished ? '✓ Finished · review →' : 'Continue →'}</span>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {dash.certificates.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.h2}>Certificates</h2>
          <div className={styles.certGrid}>
            {dash.certificates.map((cert) => {
              const t = topic(cert.topic)
              return (
                <Link
                  key={cert.code}
                  href={`/academy/certificate/${cert.code}`}
                  className={styles.certCard}
                  style={tvars(t)}
                >
                  <span className={styles.certSeal} aria-hidden="true">
                    ✦
                  </span>
                  <span className={styles.certKicker}>Certificate of completion</span>
                  <h3 className={styles.certTitle}>{cert.courseTitle}</h3>
                  <span className={styles.certCta}>View certificate →</span>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      {dash.paths.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.h2}>Saved paths</h2>
          <ul className={styles.pathList}>
            {dash.paths.map((p) => (
              <li key={p.id} className={styles.pathRow}>
                <span className={styles.pathName}>{p.name}</span>
                <span className={styles.pathMeta}>{p.courseSlugs.length} courses</span>
                <Link href="/academy/build" className={styles.pathEdit}>
                  Edit →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
