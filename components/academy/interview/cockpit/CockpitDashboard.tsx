import Link from 'next/link'
import {
  DIMENSION_SLUGS,
  barForLevel,
  overallReadiness,
  weakestDimension,
  RUBRIC_DIMENSIONS,
  type DimensionScore,
  type DimensionSlug,
} from '@/lib/academy/interview/rubric'
import { ReadinessGauge } from '../ReadinessGauge'
import { RubricBars, type ReadinessRow } from '../RubricBars'
import { StartMockButton } from './StartMockButton'
import { RecommendedStrip, type RecoScenario } from './RecommendedStrip'
import styles from './cockpit.module.css'

export type CockpitProfile = {
  targetRole: string | null
  targetLevel: string | null
  targetDate: string | null
  programWeek: number | null
  programTotalWeeks: number | null
}

export type CockpitSession = {
  id: string
  track: string
  questionTitle: string | null
  status: string
  startedAt: string
  isPlacement: boolean
}

export type CockpitVerdict = {
  sessionId: string
  score: number
  prevScore: number | null
  verdict: string
}

type Props = {
  profile: CockpitProfile
  readiness: readonly ReadinessRow[]
  sessions: readonly CockpitSession[]
  verdictBySession: ReadonlyMap<string, CockpitVerdict>
  recommended: readonly RecoScenario[]
}

const LEVEL_NAME: Record<string, string> = {
  intern: 'Intern',
  new_grad: 'New Grad',
  mid: 'Mid-Level',
  senior: 'Senior',
}

const TRACK_LABEL: Record<string, string> = {
  coding: 'Coding',
  system_design: 'System design',
  behavioral: 'Behavioral',
  negotiation: 'Negotiation',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
}

function daysOut(targetDate: string | null): number | null {
  if (!targetDate) return null
  const target = new Date(targetDate)
  if (Number.isNaN(target.getTime())) return null
  const ms = target.getTime() - Date.now()
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24))
  return days >= 0 ? days : null
}

function verdictBadgeClass(verdict: string): string {
  if (verdict === 'strong_hire' || verdict === 'hire') return styles.histBadgeHire
  if (verdict === 'lean_hire') return styles.histBadgeLean
  return styles.histBadgeNo
}

function verdictShort(verdict: string): string {
  switch (verdict) {
    case 'strong_hire':
      return 'STRONG HIRE'
    case 'hire':
      return 'HIRE'
    case 'lean_hire':
      return 'LEAN HIRE'
    case 'no_hire':
      return 'NO HIRE'
    case 'strong_no_hire':
      return 'STRONG NO-HIRE'
    default:
      return verdict.toUpperCase()
  }
}

/**
 * The real cockpit. Every number here is a real server read: the dial is the min-capped
 * overall readiness (rubric.overallReadiness over interview_readiness), the rubric bars are the
 * six real interview_readiness rows, and the history rows are real interview_sessions with their
 * real interview_verdicts. Panels with no data yet (e.g. no verdict) show an honest placeholder —
 * never a fabricated score.
 */
export function CockpitDashboard({ profile, readiness, sessions, verdictBySession, recommended }: Props) {
  const level = profile.targetLevel ?? 'senior'
  const bar = barForLevel(level)
  const levelName = LEVEL_NAME[level] ?? 'Senior'

  // Overall + weakest come straight from the rubric functions over the real readiness rows.
  const scored: DimensionScore[] = readiness
    .filter((r) => (DIMENSION_SLUGS as readonly string[]).includes(r.dimensionSlug))
    .map((r) => ({ slug: r.dimensionSlug as DimensionSlug, score: r.score }))
  const hasReadiness = scored.length > 0
  const overall = hasReadiness ? overallReadiness(scored) : null
  const weakest = hasReadiness ? weakestDimension(scored) : null
  const weekTrend = hasReadiness ? readiness.reduce((sum, r) => sum + r.trend, 0) : null
  const pointsFromBar = overall != null ? bar - overall : null

  const weakestLabel = weakest
    ? RUBRIC_DIMENSIONS.find((d) => d.slug === weakest.slug)?.label ?? weakest.slug
    : null

  // Target line + days-out — both real profile fields.
  const roleLabel = profile.targetRole?.trim() || 'Software Engineer'
  const targetLine = `Target: ${roleLabel} · ${levelName}`
  const days = daysOut(profile.targetDate)

  const weekLine =
    profile.programWeek && profile.programTotalWeeks
      ? `Week ${profile.programWeek} of ${profile.programTotalWeeks} · ${targetLine}`
      : targetLine

  // Honest greeting headline — driven entirely by real numbers or their honest absence.
  let greetTitle: string
  if (overall != null && pointsFromBar != null && pointsFromBar > 0) {
    greetTitle = `You're ${pointsFromBar} point${pointsFromBar === 1 ? '' : 's'} from the ${levelName} bar.`
  } else if (overall != null) {
    greetTitle = `You've cleared the ${levelName} bar. Keep it sharp.`
  } else {
    greetTitle = `${sessions.length} mock${sessions.length === 1 ? '' : 's'} on record — your first grade lands next.`
  }

  const sessionCountLine = `${sessions.length} mock${sessions.length === 1 ? '' : 's'} on record`

  // Hero scenario: prefer a recommended scenario that actually trains the weakest dimension so the
  // "attacks it" copy is truthful; else fall back to the first recommended.
  const targetsWeakest =
    weakest != null
      ? recommended.find((s) => (s.trains ?? []).includes(weakest.slug)) ?? null
      : null
  const heroScenario = targetsWeakest ?? recommended[0] ?? null
  const heroAttacksWeakest = !!targetsWeakest && !!weakestLabel

  return (
    <>
      <div className={styles.greeting}>
        <div>
          <div className={styles.greetKicker}>{weekLine}</div>
          <h1 className={styles.greetTitle}>{greetTitle}</h1>
        </div>
        <div className={styles.greetMeta}>
          {sessionCountLine}
          {days != null ? ` · ${days} day${days === 1 ? '' : 's'} out` : ''}
        </div>
      </div>

      <div className={styles.bento}>
        {/* READINESS DIAL */}
        <div className={`${styles.card} ${styles.cardGold} ${styles.colDial}`}>
          <span className={`${styles.panelKicker} ${styles.panelKickerGold} ${styles.dialKickerRow}`}>
            Readiness · vs the {levelName} bar
          </span>
          <ReadinessGauge overall={overall} bar={bar} weekTrend={weekTrend} />
          {hasReadiness && weakestLabel ? (
            <div className={styles.dialCapLine}>
              Capped by <span className={styles.dialCapName}>{weakestLabel.toLowerCase()}</span> — your
              weakest habit gates the score.
            </div>
          ) : (
            <div className={styles.dialPending}>
              No score yet. Your first graded mock sets the dial and names the habit capping you.
            </div>
          )}
        </div>

        {/* START A MOCK (hero) */}
        <div className={`${styles.card} ${styles.colHero}`}>
          <div className={styles.panelHead}>
            <span className={`${styles.panelKicker} ${styles.panelKickerGold}`}>One arrow · your next mock</span>
            {heroScenario ? (
              <span className={styles.panelNote}>
                ~{heroScenario.estMinutes} min · {TRACK_LABEL[heroScenario.track] ?? heroScenario.track}
              </span>
            ) : null}
          </div>
          {heroScenario ? (
            <>
              <div className={styles.heroTitle}>{heroScenario.title}</div>
              <p className={styles.heroBody}>
                {heroAttacksWeakest
                  ? `Your weakest dimension is ${weakestLabel!.toLowerCase()} — this mock attacks it. Rough is fine; every rep moves the dial.`
                  : weakestLabel
                    ? `Your weakest dimension is ${weakestLabel.toLowerCase()}. Keep repping — each graded mock re-scores all six.`
                    : 'Start a fresh rep. Marlowe calibrates the pressure to your target level.'}
              </p>
              <div className={styles.heroActions}>
                <StartMockButton scenarioSlug={heroScenario.slug} label="Start this mock →" />
                <Link href="/academy/interview/library" className={styles.ctaGhostLink}>
                  browse the library →
                </Link>
              </div>
              {recommended.length > 1 ? <RecommendedStrip scenarios={recommended.slice(0, 4)} /> : null}
            </>
          ) : (
            <p className={styles.heroBody}>
              No published scenarios are available right now. Check back shortly.
            </p>
          )}
        </div>

        {/* RUBRIC */}
        <div className={`${styles.card} ${styles.colRubric}`}>
          <div className={styles.panelHead}>
            <span className={styles.panelKicker}>Six dimensions · honest scoring</span>
            <span className={styles.panelNote}>│ = {levelName} bar</span>
          </div>
          <RubricBars rows={readiness} bar={bar} weakestSlug={weakest?.slug ?? null} />
        </div>

        {/* SESSION HISTORY */}
        <div className={`${styles.card} ${styles.colHistory} ${styles.histCard}`}>
          <div className={`${styles.panelHead} ${styles.histHead}`}>
            <span className={styles.panelKicker}>Session history · every rep on record</span>
          </div>
          {sessions.map((s) => {
            const verdict = verdictBySession.get(s.id)
            const delta =
              verdict && verdict.prevScore != null ? verdict.score - verdict.prevScore : null
            const what = s.questionTitle?.trim() || `${TRACK_LABEL[s.track] ?? s.track} mock`
            return (
              <Link
                key={s.id}
                href={
                  verdict
                    ? `/academy/interview/verdict/${s.id}`
                    : `/academy/interview/session/${s.id}`
                }
                className={styles.histRow}
              >
                <span className={styles.histDate}>{formatDate(s.startedAt)}</span>
                <span className={styles.histWhat}>{what}</span>
                <span
                  className={`${styles.histDelta} ${
                    delta != null && delta > 0
                      ? styles.histDeltaUp
                      : delta != null && delta < 0
                        ? styles.histDeltaDown
                        : ''
                  }`}
                >
                  {delta != null ? `${delta > 0 ? '+' : ''}${delta} readiness` : ''}
                </span>
                {verdict ? (
                  <span className={`${styles.histBadge} ${verdictBadgeClass(verdict.verdict)}`}>
                    {verdictShort(verdict.verdict)}
                  </span>
                ) : (
                  <span className={`${styles.histBadge} ${styles.histBadgePending}`}>
                    {s.status === 'live' || s.status === 'connecting' ? 'IN PROGRESS' : 'UNGRADED'}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
