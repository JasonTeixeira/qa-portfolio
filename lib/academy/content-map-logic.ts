/**
 * Pure logic for the Content Map — the course-universe graph for the Learn area.
 * NO 'server-only', NO DB, NO IO. Deterministic. Unit-testable in isolation.
 *
 * Given the catalog's courses, each course's ordered lessons, and the set of
 * lesson slugs the learner has completed, produce a structured graph tagging
 * every lesson with a state and every course with progress + 'you are here'.
 *
 * Linear-unlock model (one course at a time, in lesson order):
 *   - lessons before the first not-completed one are 'done'
 *   - the first not-completed lesson is 'current' ("you are here")
 *   - every lesson after it is 'upcoming'
 *   - a course whose lessons are ALL completed has courseState 'complete'
 *     and no 'current' lesson
 *
 * A lesson is treated as completed iff its slug is in `completedLessonSlugs`,
 * regardless of which course recorded it (progress is keyed by lesson slug).
 */
import type { TopicKey } from '@/lib/academy/topics'
import type { Level } from '@/data/academy/learn-catalog'

export type LessonState = 'done' | 'current' | 'upcoming'

/** Course-level rollup: 'complete' when every lesson is done, else the
 * presence/absence of a 'current' lesson distinguishes started vs not-started. */
export type CourseState = 'not-started' | 'in-progress' | 'complete'

/** Minimal course shape the map needs (a superset-compatible CourseItem). */
export type ContentMapCourseInput = {
  slug: string
  title: string
  topic: TopicKey
  level: Level
}

/** Minimal lesson shape (ordered as the learner would take them). */
export type ContentMapLessonInput = {
  slug: string
  title: string
}

export type ContentMapLesson = {
  slug: string
  title: string
  /** 1-based position within its course (display order). */
  order: number
  state: LessonState
  href: string
}

export type ContentMapCourse = {
  slug: string
  title: string
  topic: TopicKey
  level: Level
  href: string
  state: CourseState
  /** Lessons completed in this course. */
  done: number
  /** Total lessons in this course. */
  total: number
  /** 0–100, rounded. 0 when the course has no lessons. */
  pct: number
  /** The 'you are here' lesson slug, when one exists (in-progress / not-started). */
  currentLessonSlug: string | null
  lessons: ContentMapLesson[]
}

/** Courses grouped under a topic/track, preserving catalog order within. */
export type ContentMapTrack = {
  topic: TopicKey
  courses: ContentMapCourse[]
  /** Lessons done / total across the track. */
  done: number
  total: number
}

export type ContentMap = {
  tracks: ContentMapTrack[]
  /** Total lessons done / total across the whole map. */
  done: number
  total: number
  /** True when there are no courses at all (honest empty state). */
  isEmpty: boolean
}

function courseHref(slug: string): string {
  return `/academy/course/${slug}`
}

function lessonHref(courseSlug: string, lessonSlug: string): string {
  return `/academy/learn/${courseSlug}/${lessonSlug}`
}

/**
 * Build one course's lesson states from its ordered lessons + completed set.
 * The first not-completed lesson becomes 'current'; once that's been assigned,
 * every later lesson is 'upcoming' even if (somehow) individually completed —
 * this keeps the linear "you are here" marker singular and deterministic.
 */
function buildCourse(
  course: ContentMapCourseInput,
  lessons: readonly ContentMapLessonInput[],
  completed: ReadonlySet<string>,
): ContentMapCourse {
  let currentAssigned = false
  let done = 0

  const mapped: ContentMapLesson[] = lessons.map((lesson, i) => {
    const isCompleted = completed.has(lesson.slug)
    let state: LessonState
    if (isCompleted && !currentAssigned) {
      state = 'done'
      done += 1
    } else if (!currentAssigned) {
      state = 'current'
      currentAssigned = true
    } else {
      state = 'upcoming'
    }
    return {
      slug: lesson.slug,
      title: lesson.title,
      order: i + 1,
      state,
      href: lessonHref(course.slug, lesson.slug),
    }
  })

  const total = mapped.length
  const currentLessonSlug = mapped.find((l) => l.state === 'current')?.slug ?? null
  const state: CourseState =
    total > 0 && done === total ? 'complete' : done > 0 ? 'in-progress' : 'not-started'
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return {
    slug: course.slug,
    title: course.title,
    topic: course.topic,
    level: course.level,
    href: courseHref(course.slug),
    state,
    done,
    total,
    pct,
    currentLessonSlug,
    lessons: mapped,
  }
}

/**
 * The map builder. Courses keep their incoming order; tracks appear in the
 * order their first course is encountered. Fully deterministic — same inputs
 * always yield the same graph.
 */
export function buildContentMap(
  courses: readonly ContentMapCourseInput[],
  lessonsByCourseSlug: Readonly<Record<string, readonly ContentMapLessonInput[]>>,
  completedLessonSlugs: ReadonlySet<string>,
): ContentMap {
  const trackOrder: TopicKey[] = []
  const byTrack = new Map<TopicKey, ContentMapCourse[]>()

  for (const course of courses) {
    const lessons = lessonsByCourseSlug[course.slug] ?? []
    const built = buildCourse(course, lessons, completedLessonSlugs)
    if (!byTrack.has(course.topic)) {
      byTrack.set(course.topic, [])
      trackOrder.push(course.topic)
    }
    byTrack.get(course.topic)!.push(built)
  }

  const tracks: ContentMapTrack[] = trackOrder.map((topic) => {
    const trackCourses = byTrack.get(topic)!
    const done = trackCourses.reduce((sum, c) => sum + c.done, 0)
    const total = trackCourses.reduce((sum, c) => sum + c.total, 0)
    return { topic, courses: trackCourses, done, total }
  })

  const done = tracks.reduce((sum, t) => sum + t.done, 0)
  const total = tracks.reduce((sum, t) => sum + t.total, 0)

  return { tracks, done, total, isEmpty: courses.length === 0 }
}
