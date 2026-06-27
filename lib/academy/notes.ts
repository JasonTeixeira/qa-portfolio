import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type LessonNote = {
  id: string
  body: string
  createdAt: string
}

/**
 * The current user's notes for one lesson, newest first. RLS scopes rows to the
 * signed-in learner (academy_notes policy = auth.uid()), so we use the user-bound
 * client — never the service role. Returns [] when signed out or on error.
 */
export async function listNotes(courseSlug: string, lessonSlug: string): Promise<LessonNote[]> {
  try {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return []
    const { data } = await sb
      .from('academy_notes')
      .select('id, body, created_at')
      .eq('course_slug', courseSlug)
      .eq('lesson_slug', lessonSlug)
      .order('created_at', { ascending: false })
    return (data ?? []).map((r: { id: string; body: string; created_at: string }) => ({
      id: r.id,
      body: r.body,
      createdAt: r.created_at,
    }))
  } catch (err) {
    console.error('[academy/notes] listNotes failed', err)
    return []
  }
}
