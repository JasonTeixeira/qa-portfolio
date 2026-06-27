import { createSupabaseServerClient } from '@/lib/supabase/server'

export type CourseProgress = {
  signedIn: boolean
  /** Lesson slugs the current user has completed in this course. */
  completed: Set<string>
}

/** Per-user completion for a course (RLS-scoped). Empty + signedIn:false when logged out. */
export async function getCourseProgress(courseSlug: string): Promise<CourseProgress> {
  try {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return { signedIn: false, completed: new Set() }
    const { data } = await sb
      .from('academy_progress')
      .select('lesson_slug')
      .eq('user_id', user.id)
      .eq('course_slug', courseSlug)
      .eq('status', 'completed')
    return {
      signedIn: true,
      completed: new Set((data ?? []).map((r: { lesson_slug: string }) => r.lesson_slug)),
    }
  } catch (err) {
    console.error('[academy/progress] getCourseProgress failed', err)
    return { signedIn: false, completed: new Set() }
  }
}

/**
 * Every lesson slug the current user has completed, across all courses (for the
 * Content Map). Empty set when logged out. Keyed by lesson slug only — matching
 * how the map resolves completion.
 */
export async function getAllCompletedLessonSlugs(): Promise<Set<string>> {
  try {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return new Set()
    const { data } = await sb
      .from('academy_progress')
      .select('lesson_slug')
      .eq('user_id', user.id)
      .eq('status', 'completed')
    return new Set((data ?? []).map((r: { lesson_slug: string }) => r.lesson_slug))
  } catch (err) {
    console.error('[academy/progress] getAllCompletedLessonSlugs failed', err)
    return new Set()
  }
}

/** The most-recently-touched lesson for "continue where you left off" (catalog resume card). */
export async function getContinue(): Promise<{ courseSlug: string; lessonSlug: string } | null> {
  try {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return null
    const { data } = await sb
      .from('academy_progress')
      .select('course_slug, lesson_slug')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    return data ? { courseSlug: data.course_slug, lessonSlug: data.lesson_slug } : null
  } catch (err) {
    console.error('[academy/progress] getContinue failed', err)
    return null
  }
}
