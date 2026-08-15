import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/server'
import { hakeG, gainBand, aggregateEfficacy, type AggregateEfficacy, type GainBand } from '@/lib/academy/efficacy-logic'

export interface LearnerGain {
  courseSlug: string
  pre: number
  post: number
  g: number | null
  band: GainBand | null
}

interface AssessmentRow {
  user_id: string
  course_slug: string
  kind: 'pretest' | 'posttest'
  score: number
}

function pairAssessments(rows: AssessmentRow[]): Map<string, { pre?: number; post?: number }> {
  const byKey = new Map<string, { pre?: number; post?: number }>()
  for (const r of rows) {
    const key = `${r.user_id}::${r.course_slug}`
    const entry = byKey.get(key) ?? {}
    if (r.kind === 'pretest') entry.pre = r.score
    else entry.post = r.score
    byKey.set(key, entry)
  }
  return byKey
}

/** Every course where this learner has both a pre and a post score, with the gain. */
export async function getLearnerGains(userId: string): Promise<LearnerGain[]> {
  const admin = supabaseAdmin()
  const { data } = await admin
    .from('academy_assessments')
    .select('user_id, course_slug, kind, score')
    .eq('user_id', userId)
  const paired = pairAssessments((data ?? []) as AssessmentRow[])

  const out: LearnerGain[] = []
  for (const [key, { pre, post }] of paired) {
    if (pre === undefined || post === undefined) continue
    const courseSlug = key.split('::')[1]
    const g = hakeG(pre, post)
    out.push({ courseSlug, pre, post, g, band: g === null ? null : gainBand(g) })
  }
  return out
}

/** Public aggregate efficacy (optionally scoped to one course). Honest n-threshold gating. */
export async function getAggregateEfficacy(courseSlug?: string): Promise<AggregateEfficacy> {
  const admin = supabaseAdmin()
  let query = admin.from('academy_assessments').select('user_id, course_slug, kind, score')
  if (courseSlug) query = query.eq('course_slug', courseSlug)
  const { data } = await query

  const paired = pairAssessments((data ?? []) as AssessmentRow[])
  const pairs: { pre: number; post: number }[] = []
  for (const { pre, post } of paired.values()) {
    if (pre !== undefined && post !== undefined) pairs.push({ pre, post })
  }
  return aggregateEfficacy(pairs)
}
