import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/server'
import {
  assignVariant,
  experimentVerdict,
  DEFAULT_HOLDOUT_PCT,
  DEFAULT_MIN_N,
  type ExperimentVerdict,
  type Variant,
} from '@/lib/academy/experiments-logic'

/**
 * STAGE 3 — the behavioral-proof apparatus (server side). This is the machinery
 * that will PROVE a behavior-gated category once a live cohort exists: it buckets
 * every learner deterministically into treatment/holdout, measures each
 * category's target metric per bucket FROM THE EVENT SPINE (academy_events, 0111),
 * and runs the honest two-proportion verdict (experiments-logic).
 *
 * HONEST BY CONSTRUCTION: with today's near-zero traffic every readout returns
 * 'insufficient_data' — the per-arm minN guard in experimentVerdict makes a
 * fabricated "treatment wins" impossible on a thin sample. No category can
 * fake-green here. Service-role reads (the views/spine touch auth.users);
 * admin-gated at the page layer. Derivations are pure (experiments-logic).
 *
 * EXPOSURE LOGGING: none. Exposure is the deterministic bucket itself —
 * assignVariant(userId, key) is reproducible from the user list at read time, so
 * there is nothing to write at the decision point. Results are read from the
 * metric each experiment targets, measured per bucket. (If a future experiment
 * needs to gate at a real UI fork, log an 'experiment_exposed' event there via
 * emitAcademyEvent and intersect exposure with the cohort — not needed today.)
 */

// ---------------------------------------------------------------------------
// Experiment registry — code-defined (no table). Each row declares a real
// hypothesis, the behavior-gated SCORECARD category it proves, the target
// metric, and the academy_events event whose occurrence defines "converted".
// ---------------------------------------------------------------------------

/** Which target metric a converted-event is measured against. */
export type ExperimentMetric = 'd1_return' | 'd7_return' | 'd30_return' | 'activation'

export interface ExperimentDef {
  /** Stable key — also the assignment salt (bucketing is `${userId}:${key}`). */
  key: string
  /** Human label for the admin readout. */
  label: string
  /** SCORECARD.md category number this experiment is the behavioral gate for. */
  category: number
  /** The metric the treatment is hypothesized to move. */
  metric: ExperimentMetric
  /** academy_events.name whose presence in the metric window defines conversion. */
  convertedEvent: string
  /** Share of the cohort held back as control (percent). */
  holdoutPct: number
  /** The falsifiable claim the live cohort must confirm vs holdout. */
  hypothesis: string
}

/**
 * The behavior-gated categories from SCORECARD.md (#5, #8, #11, #12 — the rows
 * whose behavioral half is reality-gated). Each maps a category → a hypothesis →
 * a target return metric → the event that counts as conversion.
 */
export const EXPERIMENTS: readonly ExperimentDef[] = [
  {
    key: 'streak-jeopardy',
    label: 'Streak jeopardy → D7 return',
    category: 8,
    metric: 'd7_return',
    convertedEvent: 'review_completed',
    holdoutPct: DEFAULT_HOLDOUT_PCT,
    hypothesis:
      'Surfacing an at-risk streak (jeopardy) drives more learners to come back and complete a review by D7 than no nudge.',
  },
  {
    key: 'trigger-engine-d1',
    label: 'In-app trigger engine → D1 return',
    category: 5,
    metric: 'd1_return',
    convertedEvent: 'lesson_completed',
    holdoutPct: DEFAULT_HOLDOUT_PCT,
    hypothesis:
      'Contextual in-app triggers bring more new learners back to complete a lesson on D1 than the holdout that sees no triggers.',
  },
  {
    key: 'review-ritual-d7',
    label: 'Spaced-review ritual → D7 return',
    category: 11,
    metric: 'd7_return',
    convertedEvent: 'review_completed',
    holdoutPct: DEFAULT_HOLDOUT_PCT,
    hypothesis:
      'The spaced-review ritual (decay-aware cue + choreography) lifts D7 review adherence over a holdout with no ritual.',
  },
  {
    key: 'emotional-hook-d7',
    label: 'Emotional hook / return → D7 return',
    category: 12,
    metric: 'd7_return',
    convertedEvent: 'lesson_completed',
    holdoutPct: DEFAULT_HOLDOUT_PCT,
    hypothesis:
      'The emotional return hook increases the share of learners who return and re-engage by D7 versus a holdout with no hook — this category IS the D7 metric.',
  },
] as const

/** Map a metric to the day-offset whose return defines conversion. */
const METRIC_RETURN_DAY: Record<ExperimentMetric, number | null> = {
  d1_return: 1,
  d7_return: 7,
  d30_return: 30,
  activation: null, // activation = first_win regardless of day (see below)
}

export interface ExperimentReadout extends ExperimentVerdict {
  key: string
  label: string
  category: number
  metric: ExperimentMetric
  hypothesis: string
  /** Per-arm minimum sample required before a verdict is published. */
  minN: number
  /** Bucket sizes (cohort denominators) — lets the UI show "n too small". */
  treatmentN: number
  holdoutN: number
  /** Converted counts per bucket (numerators). */
  treatmentConv: number
  holdoutConv: number
}

// ---------------------------------------------------------------------------
// Measurement from the event spine
// ---------------------------------------------------------------------------

interface SignupRow {
  user_id: string
  signed_up_at: string | null
}

interface EventRow {
  user_id: string
  name: string
  occurred_at: string
}

/** UTC calendar date (YYYY-MM-DD) for an ISO timestamp. */
function utcDay(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10)
}

/** Whole UTC days between two ISO timestamps (later − earlier), floor. */
function dayOffset(signupIso: string, eventIso: string): number {
  const signupDay = Date.parse(`${utcDay(signupIso)}T00:00:00Z`)
  const eventDay = Date.parse(`${utcDay(eventIso)}T00:00:00Z`)
  return Math.round((eventDay - signupDay) / (24 * 60 * 60 * 1000))
}

/** The signup cohort: one row per user with a known signup time. */
async function loadCohort(): Promise<SignupRow[]> {
  const admin = supabaseAdmin()
  const { data, error } = await admin
    .from('academy_metric_activation')
    .select('user_id, signed_up_at')
  if (error) throw new Error(`experiments cohort read failed: ${error.message}`)
  return ((data ?? []) as SignupRow[]).filter((r) => r.signed_up_at !== null)
}

/** All events of one name, as a (userId → ISO timestamps[]) map. */
async function loadEventsByUser(name: string): Promise<Map<string, string[]>> {
  const admin = supabaseAdmin()
  const { data, error } = await admin
    .from('academy_events')
    .select('user_id, name, occurred_at')
    .eq('name', name)
  if (error) throw new Error(`experiments events read failed: ${error.message}`)
  const byUser = new Map<string, string[]>()
  for (const row of (data ?? []) as EventRow[]) {
    const list = byUser.get(row.user_id) ?? []
    byUser.set(row.user_id, [...list, row.occurred_at])
  }
  return byUser
}

/**
 * Did a user convert under this experiment's metric?
 *  - dN_return: fired the converted event on the UTC day exactly N days after
 *    signup (classic Dn return, mirroring academy_metric_retention's logic).
 *  - activation: fired the converted event at all (signup → first action).
 */
function didConvert(
  def: ExperimentDef,
  signupIso: string,
  eventTimes: string[] | undefined,
): boolean {
  if (!eventTimes || eventTimes.length === 0) return false
  const day = METRIC_RETURN_DAY[def.metric]
  if (day === null) return true // activation: any occurrence counts
  return eventTimes.some((t) => dayOffset(signupIso, t) === day)
}

// ---------------------------------------------------------------------------
// Readouts
// ---------------------------------------------------------------------------

/** Look up a registry entry by key. */
export function getExperimentDef(key: string): ExperimentDef | undefined {
  return EXPERIMENTS.find((e) => e.key === key)
}

/** All declared experiment keys. */
export function listExperimentKeys(): string[] {
  return EXPERIMENTS.map((e) => e.key)
}

/**
 * Bucket the live cohort deterministically, measure the target metric per bucket
 * from the event spine, and return the honest verdict. With near-zero data this
 * returns 'insufficient_data' by construction (per-arm minN guard).
 *
 * Returns null only for an unknown key.
 */
export async function getExperimentReadout(key: string): Promise<ExperimentReadout | null> {
  const def = getExperimentDef(key)
  if (!def) return null

  const [cohort, eventsByUser] = await Promise.all([
    loadCohort(),
    loadEventsByUser(def.convertedEvent),
  ])

  let treatmentN = 0
  let holdoutN = 0
  let treatmentConv = 0
  let holdoutConv = 0

  for (const row of cohort) {
    if (row.signed_up_at === null) continue
    const variant: Variant = assignVariant(row.user_id, def.key, def.holdoutPct)
    const converted = didConvert(def, row.signed_up_at, eventsByUser.get(row.user_id))
    if (variant === 'treatment') {
      treatmentN += 1
      if (converted) treatmentConv += 1
    } else {
      holdoutN += 1
      if (converted) holdoutConv += 1
    }
  }

  const verdict = experimentVerdict({
    treatmentConv,
    treatmentN,
    holdoutConv,
    holdoutN,
    minN: DEFAULT_MIN_N,
  })

  return {
    ...verdict,
    key: def.key,
    label: def.label,
    category: def.category,
    metric: def.metric,
    hypothesis: def.hypothesis,
    minN: DEFAULT_MIN_N,
    treatmentN,
    holdoutN,
    treatmentConv,
    holdoutConv,
  }
}

/** Readouts for every declared experiment (admin Stage-3 panel). */
export async function listExperimentReadouts(): Promise<ExperimentReadout[]> {
  const readouts = await Promise.all(EXPERIMENTS.map((e) => getExperimentReadout(e.key)))
  return readouts.filter((r): r is ExperimentReadout => r !== null)
}
