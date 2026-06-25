import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/server'
import { hakeG } from '@/lib/academy/efficacy-logic'
import {
  parseQuestions,
  stripAnswers,
  scoreAssessment,
  type AssessmentKind,
  type PublicQuestion,
} from '@/lib/academy/assessment-logic'

/** The answer-stripped question bank a learner sees for a course's pre/post test. */
export async function getCourseAssessmentForLearner(
  courseSlug: string,
  kind: AssessmentKind,
): Promise<PublicQuestion[]> {
  const admin = supabaseAdmin()
  const { data } = await admin.from('academy_courses').select(`${kind}`).eq('slug', courseSlug).maybeSingle()
  return stripAnswers(parseQuestions((data as Record<string, unknown> | null)?.[kind]))
}

export interface AssessmentState {
  pretestCount: number
  posttestCount: number
  pretestTaken: boolean
  posttestTaken: boolean
  pre: number | null
  post: number | null
  g: number | null
}

/** What's authored + what the learner has taken — drives the course-page gating. */
export async function getAssessmentState(userId: string, courseSlug: string): Promise<AssessmentState> {
  const admin = supabaseAdmin()
  const [{ data: course }, { data: taken }] = await Promise.all([
    admin.from('academy_courses').select('pretest, posttest').eq('slug', courseSlug).maybeSingle(),
    admin
      .from('academy_assessments')
      .select('kind, score')
      .eq('user_id', userId)
      .eq('course_slug', courseSlug),
  ])

  const pretestCount = parseQuestions(course?.pretest).length
  const posttestCount = parseQuestions(course?.posttest).length
  const pre = taken?.find((t) => t.kind === 'pretest')?.score ?? null
  const post = taken?.find((t) => t.kind === 'posttest')?.score ?? null
  return {
    pretestCount,
    posttestCount,
    pretestTaken: pre !== null,
    posttestTaken: post !== null,
    pre,
    post,
    g: pre !== null && post !== null ? hakeG(pre, post) : null,
  }
}

/**
 * Score a learner's responses against the server-held answer key and record the
 * result. Anti-cheat: the answer key never leaves the server; pretest is locked
 * on first submit, posttest is updatable. Returns the score and live gain.
 */
export async function scoreAndRecord(
  userId: string,
  courseSlug: string,
  kind: AssessmentKind,
  responses: number[],
): Promise<{ ok: boolean; score?: number; g?: number | null }> {
  const admin = supabaseAdmin()
  const { data: course } = await admin
    .from('academy_courses')
    .select(`${kind}`)
    .eq('slug', courseSlug)
    .maybeSingle()
  const questions = parseQuestions((course as Record<string, unknown> | null)?.[kind])
  if (questions.length === 0) return { ok: false }

  const score = scoreAssessment(responses, questions)
  const { error } = await admin.from('academy_assessments').upsert(
    { user_id: userId, course_slug: courseSlug, kind, score, taken_at: new Date().toISOString() },
    { onConflict: 'user_id,course_slug,kind', ignoreDuplicates: kind === 'pretest' },
  )
  if (error) {
    console.error('[academy/assessments] scoreAndRecord failed', error)
    return { ok: false }
  }

  const { data: rows } = await admin
    .from('academy_assessments')
    .select('kind, score')
    .eq('user_id', userId)
    .eq('course_slug', courseSlug)
  const pre = rows?.find((r) => r.kind === 'pretest')?.score
  const post = rows?.find((r) => r.kind === 'posttest')?.score
  const g = pre !== undefined && post !== undefined ? hakeG(pre, post) : undefined
  return { ok: true, score, g }
}
