import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { TopicKey } from '@/lib/academy/topics'
import type { CourseItem, Level } from '@/data/academy/learn-catalog'
import type { Course, CourseLesson, CourseModule, Lesson, LessonBlock } from '@/data/academy/sample-course'

/** Catalog course cards, from the DB (published only). Empty array → caller falls back to fixtures. */
export async function getCatalogCourses(): Promise<CourseItem[]> {
  try {
    const sb = await createSupabaseServerClient()
    const { data } = await sb
      .from('academy_courses')
      .select('slug, title, topic, level, lessons, hours')
      .eq('status', 'published')
      .order('sort')
    if (!data?.length) return []
    return data.map((r) => ({
      slug: r.slug,
      title: r.title,
      topic: r.topic as TopicKey,
      level: r.level as Level,
      lessons: r.lessons,
      hours: r.hours,
    }))
  } catch (err) {
    console.error('[academy/content] getCatalogCourses failed', err)
    return []
  }
}

/** A course + its lessons grouped into modules (statuses default to 'todo'; the page overlays progress). */
export async function getCourse(slug: string): Promise<Course | null> {
  try {
    const sb = await createSupabaseServerClient()
    const { data: course } = await sb
      .from('academy_courses')
      .select('slug, title, subtitle, topic')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    if (!course) return null

    const { data: lessons } = await sb
      .from('academy_lessons')
      .select('slug, title, module_title, module_sort, sort')
      .eq('course_slug', slug)
      .eq('status', 'published')
      .order('module_sort')
      .order('sort')

    const ls = lessons ?? []
    const order: string[] = []
    const byModule = new Map<string, CourseLesson[]>()
    for (const l of ls) {
      if (!byModule.has(l.module_title)) {
        byModule.set(l.module_title, [])
        order.push(l.module_title)
      }
      byModule.get(l.module_title)!.push({ slug: l.slug, title: l.title, status: 'todo' })
    }
    const modules: CourseModule[] = order.map((t) => ({ title: t, lessons: byModule.get(t)! }))

    return {
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle ?? '',
      topic: course.topic as TopicKey,
      lessonsTotal: ls.length,
      lessonsDone: 0,
      modules,
    }
  } catch (err) {
    console.error('[academy/content] query failed', err)
    return null
  }
}

/**
 * Ordered lessons (slug + title) for every given course, keyed by course slug,
 * in lesson order. Used by the Content Map. One query covers all courses.
 */
export async function getLessonsByCourse(
  courseSlugs: string[],
): Promise<Record<string, { slug: string; title: string }[]>> {
  if (courseSlugs.length === 0) return {}
  try {
    const sb = await createSupabaseServerClient()
    const { data: lessons } = await sb
      .from('academy_lessons')
      .select('slug, title, course_slug, module_sort, sort')
      .in('course_slug', courseSlugs)
      .eq('status', 'published')
      .order('module_sort')
      .order('sort')

    const byCourse: Record<string, { slug: string; title: string }[]> = {}
    for (const l of lessons ?? []) {
      ;(byCourse[l.course_slug] ??= []).push({ slug: l.slug, title: l.title })
    }
    return byCourse
  } catch (err) {
    console.error('[academy/content] getLessonsByCourse failed', err)
    return {}
  }
}

export type OverviewLesson = { slug: string; title: string; estMinutes: number; isFreePreview: boolean }
export type OverviewModule = { title: string; lessons: OverviewLesson[] }
export type CourseOverview = {
  slug: string
  title: string
  subtitle: string
  topic: TopicKey
  level: string
  hours: number
  lessonsTotal: number
  firstLessonSlug: string | null
  modules: OverviewModule[]
}

/** Full course for the overview/syllabus page. */
export async function getCourseOverview(slug: string): Promise<CourseOverview | null> {
  try {
    const sb = await createSupabaseServerClient()
    const { data: course } = await sb
      .from('academy_courses')
      .select('slug, title, subtitle, topic, level, hours')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    if (!course) return null

    const { data: lessons } = await sb
      .from('academy_lessons')
      .select('slug, title, module_title, module_sort, sort, est_minutes, is_free_preview')
      .eq('course_slug', slug)
      .eq('status', 'published')
      .order('module_sort')
      .order('sort')

    const ls = lessons ?? []
    const order: string[] = []
    const byModule = new Map<string, OverviewLesson[]>()
    for (const l of ls) {
      if (!byModule.has(l.module_title)) {
        byModule.set(l.module_title, [])
        order.push(l.module_title)
      }
      byModule.get(l.module_title)!.push({
        slug: l.slug,
        title: l.title,
        estMinutes: l.est_minutes,
        isFreePreview: l.is_free_preview,
      })
    }

    return {
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle ?? '',
      topic: course.topic as TopicKey,
      level: course.level,
      hours: course.hours,
      lessonsTotal: ls.length,
      firstLessonSlug: ls[0]?.slug ?? null,
      modules: order.map((t) => ({ title: t, lessons: byModule.get(t)! })),
    }
  } catch (err) {
    console.error('[academy/content] query failed', err)
    return null
  }
}

/** A single lesson (blocks + computed prev/next within the course). */
export async function getLesson(courseSlug: string, lessonSlug: string): Promise<Lesson | null> {
  try {
    const sb = await createSupabaseServerClient()
    const { data: lessons } = await sb
      .from('academy_lessons')
      .select('slug, title, eyebrow, est_minutes, blocks, module_sort, sort, is_free_preview')
      .eq('course_slug', courseSlug)
      .eq('status', 'published')
      .order('module_sort')
      .order('sort')

    const ls = lessons ?? []
    const idx = ls.findIndex((l) => l.slug === lessonSlug)
    if (idx < 0) return null
    const l = ls[idx]
    const prev = ls[idx - 1]
    const next = ls[idx + 1]

    return {
      slug: l.slug,
      courseSlug,
      eyebrow: l.eyebrow ?? '',
      title: l.title,
      estMinutes: l.est_minutes,
      isFreePreview: l.is_free_preview ?? false,
      blocks: (l.blocks ?? []) as LessonBlock[],
      prevSlug: prev?.slug,
      prevLabel: prev?.title,
      nextSlug: next?.slug,
      nextLabel: next?.title,
    }
  } catch (err) {
    console.error('[academy/content] query failed', err)
    return null
  }
}
