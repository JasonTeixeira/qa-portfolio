import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getCatalogCourses, getLessonsByCourse } from '@/lib/academy/content'
import { getAllCompletedLessonSlugs } from '@/lib/academy/progress'
import { getGamification } from '@/lib/academy/gamification'
import { buildContentMap, type ContentMapCourse } from '@/lib/academy/content-map-logic'
import type { TopicKey } from '@/lib/academy/topics'

/**
 * Server reader for the "My Path" destination (/academy/progress). It assembles
 * the learner's whole journey from real data only:
 *   - the published catalog (courses + ordered lessons)
 *   - the learner's completed lesson slugs (RLS-scoped)
 *   - issued certificates + current streak
 * then folds it into the canonical six-domain curriculum order and derives an
 * honest "where you are" summary plus a single dominant next action.
 *
 * Nothing here invents progress: a signed-out or fresh learner gets zeros and a
 * "start at the gate" call to action, never a fake bar.
 */

/** The curriculum spine — the order a learner is meant to climb the domains. */
export const DOMAIN_ORDER: readonly TopicKey[] = [
  'foundations',
  'engineering',
  'data',
  'ai-engineering',
  'ship-it',
  'growth',
] as const

/** The gate course — course 00. Completing it unlocks the rest of the path. */
const GATE_COURSE_SLUG = 'career-engineering_judgment_foundation'

export type PathDomain = {
  topic: TopicKey
  courses: ContentMapCourse[]
  /** Lessons done / total across the domain. */
  done: number
  total: number
  pct: number
  /** Courses finished / total in this domain. */
  coursesComplete: number
  coursesTotal: number
}

export type PathNextAction = {
  /** Short verb-led label, e.g. "Resume" / "Start" / "Begin the gate". */
  label: string
  /** One-line context: which lesson, in which course. */
  detail: string
  href: string
  /** The course the action lives in (for the eyebrow). */
  courseTitle: string
  topic: TopicKey
}

export type PathSummary = {
  /** Total published lessons across the catalog. */
  lessonsTotal: number
  lessonsDone: number
  /** Whole-path completion, 0–100. */
  pct: number
  coursesTotal: number
  coursesStarted: number
  coursesComplete: number
  certificates: number
  streak: number
  streakActiveToday: boolean
}

export type LearnerPath = {
  signedIn: boolean
  name: string
  summary: PathSummary
  domains: PathDomain[]
  /** The single dominant action — null only when everything is complete. */
  nextAction: PathNextAction | null
  /** The gate course, surfaced separately (course 00 unlocks the path). */
  gate: ContentMapCourse | null
  /** True when no courses are published at all (honest empty state). */
  isEmpty: boolean
}

const emptyPath: LearnerPath = {
  signedIn: false,
  name: '',
  summary: {
    lessonsTotal: 0,
    lessonsDone: 0,
    pct: 0,
    coursesTotal: 0,
    coursesStarted: 0,
    coursesComplete: 0,
    certificates: 0,
    streak: 0,
    streakActiveToday: false,
  },
  domains: [],
  nextAction: null,
  gate: null,
  isEmpty: true,
}

/** Order a flat course list into the canonical domain spine. Returns one entry
 * per domain that actually has published courses, in DOMAIN_ORDER. */
function groupByDomain(courses: readonly ContentMapCourse[]): PathDomain[] {
  const byTopic = new Map<TopicKey, ContentMapCourse[]>()
  for (const c of courses) {
    if (!byTopic.has(c.topic)) byTopic.set(c.topic, [])
    byTopic.get(c.topic)!.push(c)
  }

  const domains: PathDomain[] = []
  for (const topic of DOMAIN_ORDER) {
    const list = byTopic.get(topic)
    if (!list || list.length === 0) continue
    const done = list.reduce((sum, c) => sum + c.done, 0)
    const total = list.reduce((sum, c) => sum + c.total, 0)
    const coursesComplete = list.filter((c) => c.state === 'complete').length
    domains.push({
      topic,
      courses: list,
      done,
      total,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
      coursesComplete,
      coursesTotal: list.length,
    })
  }
  return domains
}

/** Pick the single dominant next action: resume the in-progress course nearest
 * the start of the spine, else start the first not-started course, else the
 * gate. Returns null only when every course is complete. */
function pickNextAction(domains: readonly PathDomain[]): PathNextAction | null {
  // Walk the spine in order; the first course that is in-progress or not-started
  // is what the learner should do next.
  for (const domain of domains) {
    for (const course of domain.courses) {
      if (course.state === 'complete') continue
      const lessonSlug = course.currentLessonSlug
      const href = lessonSlug
        ? `/academy/learn/${course.slug}/${lessonSlug}`
        : course.href
      const isGate = course.slug === GATE_COURSE_SLUG
      const label = isGate
        ? course.state === 'in-progress'
          ? 'Continue the gate'
          : 'Begin the gate'
        : course.state === 'in-progress'
          ? 'Resume'
          : 'Start'
      const nextLesson = course.lessons.find((l) => l.slug === lessonSlug)
      return {
        label,
        detail: nextLesson ? nextLesson.title : course.title,
        href,
        courseTitle: course.title,
        topic: course.topic,
      }
    }
  }
  return null
}

export async function getLearnerPath(): Promise<LearnerPath> {
  try {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return emptyPath

    const name = (user.email ?? 'learner').split('@')[0]

    const courses = await getCatalogCourses()
    if (courses.length === 0) {
      return { ...emptyPath, signedIn: true, name }
    }

    // Independent reads — fetch in parallel to avoid a request waterfall.
    const [lessonsByCourse, completed, certsRes, game] = await Promise.all([
      getLessonsByCourse(courses.map((c) => c.slug)),
      getAllCompletedLessonSlugs(),
      sb
        .from('academy_certificates')
        .select('cert_code')
        .eq('user_id', user.id),
      getGamification(user.id),
    ])

    const map = buildContentMap(courses, lessonsByCourse, completed)
    const allCourses = map.tracks.flatMap((t) => t.courses)
    const domains = groupByDomain(allCourses)
    const gate = allCourses.find((c) => c.slug === GATE_COURSE_SLUG) ?? null

    const coursesStarted = allCourses.filter((c) => c.state !== 'not-started').length
    const coursesComplete = allCourses.filter((c) => c.state === 'complete').length

    const summary: PathSummary = {
      lessonsTotal: map.total,
      lessonsDone: map.done,
      pct: map.total > 0 ? Math.round((map.done / map.total) * 100) : 0,
      coursesTotal: allCourses.length,
      coursesStarted,
      coursesComplete,
      certificates: certsRes.data?.length ?? 0,
      streak: game.streak.current,
      streakActiveToday: game.streak.activeToday,
    }

    return {
      signedIn: true,
      name,
      summary,
      domains,
      nextAction: pickNextAction(domains),
      gate,
      isEmpty: false,
    }
  } catch (err) {
    console.error('[academy/path] getLearnerPath failed', err)
    return emptyPath
  }
}
