import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/server'
import { deriveUnitState, deriveSignals, type EvidenceEvent, type EvidenceEventType, type EvidencePayload } from '@/lib/academy/evidence-events-logic'
import { resolveScore, type ContractSignals } from '@/lib/academy/caps-logic'
import { buildMasteryMap, deriveMasteryUnits, type MasteryMap, type MasteryUnitInput } from '@/lib/academy/mastery-logic'
import type { TopicKey } from '@/lib/academy/topics'

/**
 * The DB layer for the mastery map. Read-only: it never writes evidence and
 * never mutates progress. It gathers the learner's per-lesson evidence from the
 * spine (academy_evidence_events) and resolves each lesson to {score,state} via
 * the SAME pure logic the unit player uses, then hands the placed units to
 * mastery-logic.
 *
 * @security `userId` MUST be the server-derived authenticated id (auth.getUser),
 * never request input — supabaseAdmin bypasses RLS, so a spoofed id would read
 * another learner's ledger.
 */

/**
 * The honest contract for a standard internal unit now that the mastery-map
 * surface exists. Every contract piece this platform ships is present; only
 * real-learner OUTCOME data (the §5 externalOutcome cap at 98) and the earned
 * evidence rungs themselves can still hold a score down. This is what makes the
 * map a faithful "you are here" rather than an optimistic one.
 */
const MASTERY_MAP_CONTRACT: ContractSignals = {
  scenarioFirst: true,
  habitTriggers: true,
  socialSurface: true,
  aiGuideGrounding: true,
  masteryMapEntry: true,
}

/** The Academy topic order — keeps the heat-map deterministic. */
const TOPIC_ORDER: readonly TopicKey[] = [
  'foundations',
  'ai-engineering',
  'engineering',
  'data',
  'ship-it',
  'growth',
]

type EvidenceRow = {
  course_slug: string
  lesson_slug: string
  event_type: string
  payload: EvidencePayload | null
  created_at: string
}

/**
 * Build the learner's mastery map across every lesson they have produced
 * evidence for. Read-only. Honest 'collecting' when there is no evidence yet.
 */
export async function getMasteryMap(userId: string): Promise<MasteryMap> {
  const admin = supabaseAdmin()

  // 1. All of the learner's evidence, oldest-first (the order state expects).
  const { data: rows, error } = await admin
    .from('academy_evidence_events')
    .select('course_slug, lesson_slug, event_type, payload, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw new Error(`mastery read failed: ${error.message}`)

  const events = (rows ?? []) as EvidenceRow[]
  if (events.length === 0) {
    // Honest empty — the learner has produced no evidence anywhere yet.
    return buildMasteryMap([], TOPIC_ORDER)
  }

  // 2. Group events by (course, lesson) — one cell per lesson.
  const byLesson = new Map<string, { courseSlug: string; lessonSlug: string; events: EvidenceEvent[] }>()
  const courseSlugs = new Set<string>()
  for (const r of events) {
    courseSlugs.add(r.course_slug)
    const key = `${r.course_slug}::${r.lesson_slug}`
    const entry = byLesson.get(key)
    const ev: EvidenceEvent = {
      type: r.event_type as EvidenceEventType,
      payload: (r.payload ?? {}) as EvidencePayload,
      at: r.created_at,
    }
    if (entry) entry.events.push(ev)
    else byLesson.set(key, { courseSlug: r.course_slug, lessonSlug: r.lesson_slug, events: [ev] })
  }

  // 3. Course metadata (topic + lesson title) for grouping and labels.
  const slugList = [...courseSlugs]
  const [{ data: courseMeta }, { data: lessonMeta }] = await Promise.all([
    admin.from('academy_courses').select('slug, topic').in('slug', slugList),
    admin.from('academy_lessons').select('course_slug, slug, title').in('course_slug', slugList),
  ])
  const topicBySlug = new Map((courseMeta ?? []).map((c) => [c.slug, c.topic as TopicKey]))
  const titleByLesson = new Map(
    (lessonMeta ?? []).map((l: { course_slug: string; slug: string; title: string }) => [
      `${l.course_slug}::${l.slug}`,
      l.title,
    ]),
  )

  // 4. Resolve each lesson to {score,state} via the SAME pure spine logic the
  //    unit player uses. unitId = lessonSlug. Prerequisites are met for any
  //    lesson the learner has already produced evidence for.
  const unitInputs: MasteryUnitInput[] = []
  for (const { courseSlug, lessonSlug, events: lessonEvents } of byLesson.values()) {
    const state = deriveUnitState({ prerequisitesMet: true, events: lessonEvents })
    const { score } = resolveScore(deriveSignals(lessonEvents), MASTERY_MAP_CONTRACT)
    unitInputs.push({
      courseSlug,
      lessonSlug,
      label: titleByLesson.get(`${courseSlug}::${lessonSlug}`) ?? lessonSlug,
      topicKey: topicBySlug.get(courseSlug) ?? 'foundations',
      score,
      state,
    })
  }

  // 5. Hand off to pure mastery-logic.
  return buildMasteryMap(deriveMasteryUnits(unitInputs), TOPIC_ORDER)
}
