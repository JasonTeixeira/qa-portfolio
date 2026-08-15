import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/server'
import { EVIDENCE_EVENT_TYPES } from '@/lib/academy/evidence-events-logic'
import {
  currRate,
  evidenceFunnel,
  aggregateGain,
  activationRate,
  retentionRate,
  type FunnelStage,
  type AggregateGain,
} from '@/lib/academy/metrics-logic'

/**
 * Server aggregation for the admin measurement dashboard. Reads the evidence
 * ledger (funnel), the assessment table (pre/post gain), and progress activity
 * (retention), then collapses each into an honest aggregate via metrics-logic.
 * Service-role reads — admin-gated at the page layer. Never fabricates a number:
 * sparse cohorts come back as honest nulls and render as "collecting".
 */

/** Baseline retention cohort = active in the [60d, 30d) window; retained = those active again in the last 30d. */
const CURR_WINDOW_DAYS = 30

export interface AcademyMetrics {
  funnel: FunnelStage[]
  /** Total events behind the funnel — lets the UI gate "collecting" on a real n. */
  funnelTotal: number
  gain: AggregateGain
  curr: {
    rate: number | null
    activeN: number
    retainedN: number
  }
}

interface EventTypeRow {
  event_type: string
}

interface AssessmentRow {
  user_id: string
  course_slug: string
  kind: 'pretest' | 'posttest'
  score: number
}

interface ActivityRow {
  user_id: string
  updated_at: string
}

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

/** Tally evidence events by type for the funnel. */
async function loadFunnel(): Promise<{ funnel: FunnelStage[]; total: number }> {
  const admin = supabaseAdmin()
  const { data, error } = await admin
    .from('academy_evidence_events')
    .select('event_type')
  if (error) throw new Error(`metrics funnel read failed: ${error.message}`)
  const counts: Record<string, number> = {}
  for (const t of EVIDENCE_EVENT_TYPES) counts[t] = 0
  let total = 0
  for (const row of (data ?? []) as EventTypeRow[]) {
    if (counts[row.event_type] === undefined) counts[row.event_type] = 0
    counts[row.event_type] += 1
    total += 1
  }
  return { funnel: evidenceFunnel(counts), total }
}

/** Pair pre/post per (user, course) and compute aggregate normalized gain. */
async function loadGain(): Promise<AggregateGain> {
  const admin = supabaseAdmin()
  const { data, error } = await admin
    .from('academy_assessments')
    .select('user_id, course_slug, kind, score')
  if (error) throw new Error(`metrics gain read failed: ${error.message}`)

  const byKey = new Map<string, { pre?: number; post?: number }>()
  for (const r of (data ?? []) as AssessmentRow[]) {
    const key = `${r.user_id}::${r.course_slug}`
    const entry = byKey.get(key) ?? {}
    if (r.kind === 'pretest') entry.pre = r.score
    else entry.post = r.score
    byKey.set(key, entry)
  }
  const pairs: { pre: number; post: number }[] = []
  for (const { pre, post } of byKey.values()) {
    if (pre !== undefined && post !== undefined) pairs.push({ pre, post })
  }
  return aggregateGain(pairs)
}

/**
 * Two-window CURR. Baseline = distinct learners active in [2·window, window) days
 * ago. Retained = baseline learners who were ALSO active in the last `window`
 * days. Activity = any academy_progress row touched (updated_at) in the window.
 */
async function loadCurr(): Promise<{ rate: number | null; activeN: number; retainedN: number }> {
  const admin = supabaseAdmin()
  const recentSince = daysAgoIso(CURR_WINDOW_DAYS)
  const baselineSince = daysAgoIso(CURR_WINDOW_DAYS * 2)

  const { data, error } = await admin
    .from('academy_progress')
    .select('user_id, updated_at')
    .gte('updated_at', baselineSince)
  if (error) throw new Error(`metrics curr read failed: ${error.message}`)

  const baseline = new Set<string>()
  const recent = new Set<string>()
  for (const row of (data ?? []) as ActivityRow[]) {
    if (row.updated_at >= recentSince) recent.add(row.user_id)
    else baseline.add(row.user_id)
  }
  const activeUserIds = [...baseline]
  const retainedUserIds = activeUserIds.filter((id) => recent.has(id))
  return {
    rate: currRate(activeUserIds, retainedUserIds),
    activeN: baseline.size,
    retainedN: retainedUserIds.length,
  }
}

export async function getAcademyMetrics(): Promise<AcademyMetrics> {
  const [funnelResult, gain, curr] = await Promise.all([loadFunnel(), loadGain(), loadCurr()])
  return {
    funnel: funnelResult.funnel,
    funnelTotal: funnelResult.total,
    gain,
    curr,
  }
}

// ===========================================================================
// STAGE 2 instrumentation-spine readouts. Typed reads over the academy_events
// metric tree (0112). Service-role only (the views read auth.users); the admin
// gate lives at the page layer. Derivations come from metrics-logic (pure).
// ===========================================================================

export interface ActivationSummary {
  signups: number
  activated: number
  /** activated / signups, null when no signups (honest empty). */
  rate: number | null
  /** Median minutes-to-first-win across ACTIVATED users (null when none). */
  medianMinutesToFirstWin: number | null
}

export interface RetentionCohort {
  cohortDate: string
  cohortSize: number
  returnedD1: number
  returnedD7: number
  returnedD30: number
  rateD1: number | null
  rateD7: number | null
  rateD30: number | null
}

export interface EventFunnelRow {
  name: string
  count: number
  distinctUsers: number
}

export interface UserJourney {
  userId: string
  firstSeen: string | null
  lastSeen: string | null
  activeDays: number
  totalEvents: number
}

interface ActivationViewRow {
  signed_up_at: string
  first_win_at: string | null
  minutes_to_first_win: number | null
}

interface RetentionViewRow {
  cohort_date: string
  cohort_size: number
  returned_d1: number
  returned_d7: number
  returned_d30: number
}

interface FunnelViewRow {
  name: string
  count: number
  distinct_users: number
}

interface JourneyViewRow {
  user_id: string
  first_seen: string | null
  last_seen: string | null
  active_days: number
  total_events: number
}

/** Median of a numeric list (sorted copy — never mutates input). Null when empty. */
function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

/** Signup → first_win activation, with median time-to-activate. */
export async function getActivation(): Promise<ActivationSummary> {
  const admin = supabaseAdmin()
  const { data, error } = await admin
    .from('academy_metric_activation')
    .select('signed_up_at, first_win_at, minutes_to_first_win')
  if (error) throw new Error(`metrics activation read failed: ${error.message}`)
  const rows = (data ?? []) as ActivationViewRow[]
  const signups = rows.length
  const activatedRows = rows.filter((r) => r.first_win_at !== null)
  const activated = activatedRows.length
  const minutes = activatedRows
    .map((r) => r.minutes_to_first_win)
    .filter((m): m is number => typeof m === 'number')
  const med = median(minutes)
  return {
    signups,
    activated,
    rate: activationRate(activated, signups),
    medianMinutesToFirstWin: med === null ? null : Math.round(med),
  }
}

/** Dn retention by signup cohort, with rates derived per cohort. */
export async function getRetention(): Promise<RetentionCohort[]> {
  const admin = supabaseAdmin()
  const { data, error } = await admin
    .from('academy_metric_retention')
    .select('cohort_date, cohort_size, returned_d1, returned_d7, returned_d30')
    .order('cohort_date', { ascending: true })
  if (error) throw new Error(`metrics retention read failed: ${error.message}`)
  return ((data ?? []) as RetentionViewRow[]).map((r) => ({
    cohortDate: r.cohort_date,
    cohortSize: r.cohort_size,
    returnedD1: r.returned_d1,
    returnedD7: r.returned_d7,
    returnedD30: r.returned_d30,
    rateD1: retentionRate(r.returned_d1, r.cohort_size),
    rateD7: retentionRate(r.returned_d7, r.cohort_size),
    rateD30: retentionRate(r.returned_d30, r.cohort_size),
  }))
}

/** Per-event-name count + distinct users across the instrumented loop. */
export async function getEventFunnel(): Promise<EventFunnelRow[]> {
  const admin = supabaseAdmin()
  const { data, error } = await admin
    .from('academy_metric_event_funnel')
    .select('name, count, distinct_users')
    .order('count', { ascending: false })
  if (error) throw new Error(`metrics event funnel read failed: ${error.message}`)
  return ((data ?? []) as FunnelViewRow[]).map((r) => ({
    name: r.name,
    count: r.count,
    distinctUsers: r.distinct_users,
  }))
}

/** One learner's engagement journey (first/last seen, active days, total events). Null when no events. */
export async function getUserJourney(userId: string): Promise<UserJourney | null> {
  const admin = supabaseAdmin()
  const { data, error } = await admin
    .from('academy_metric_user_journey')
    .select('user_id, first_seen, last_seen, active_days, total_events')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(`metrics user journey read failed: ${error.message}`)
  if (!data) return null
  const row = data as JourneyViewRow
  return {
    userId: row.user_id,
    firstSeen: row.first_seen,
    lastSeen: row.last_seen,
    activeDays: row.active_days,
    totalEvents: row.total_events,
  }
}
