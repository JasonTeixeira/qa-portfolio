import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/server'
import { EVIDENCE_EVENT_TYPES } from '@/lib/academy/evidence-events-logic'
import {
  currRate,
  evidenceFunnel,
  aggregateGain,
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
