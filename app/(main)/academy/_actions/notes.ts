'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const slugSchema = z.string().min(1).max(128)
const bodySchema = z.string().trim().min(1).max(4000)
const idSchema = z.string().uuid()

async function requireUser() {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  return { sb, user }
}

/**
 * Save a learner-owned note for a lesson. The note is inserted through the
 * user-bound client so RLS sets/enforces user_id = auth.uid() — we never accept a
 * client-supplied userId. Body is validated to 1..4000 chars.
 */
export async function saveNote(
  courseSlug: string,
  lessonSlug: string,
  body: string,
): Promise<{ ok: boolean }> {
  const course = slugSchema.safeParse(courseSlug)
  const lesson = slugSchema.safeParse(lessonSlug)
  const parsedBody = bodySchema.safeParse(body)
  if (!course.success || !lesson.success || !parsedBody.success) return { ok: false }

  const { sb, user } = await requireUser()
  if (!user) return { ok: false }

  const { error } = await sb.from('academy_notes').insert({
    user_id: user.id,
    course_slug: course.data,
    lesson_slug: lesson.data,
    body: parsedBody.data,
  })
  if (error) {
    console.error('[academy/notes] saveNote failed', error)
    return { ok: false }
  }
  revalidatePath(`/academy/learn/${course.data}/${lesson.data}`)
  return { ok: true }
}

/**
 * Delete one of the learner's own notes. RLS guarantees own-row only — a request
 * for another user's note simply matches zero rows. courseSlug/lessonSlug are
 * passed only to revalidate the lesson path.
 */
export async function deleteNote(
  id: string,
  courseSlug: string,
  lessonSlug: string,
): Promise<{ ok: boolean }> {
  const parsedId = idSchema.safeParse(id)
  const course = slugSchema.safeParse(courseSlug)
  const lesson = slugSchema.safeParse(lessonSlug)
  if (!parsedId.success || !course.success || !lesson.success) return { ok: false }

  const { sb, user } = await requireUser()
  if (!user) return { ok: false }

  // RLS already scopes to own rows; the explicit user_id filter is belt-and-suspenders
  // so a future service-role client swap can't silently open an IDOR.
  const { error } = await sb.from('academy_notes').delete().eq('id', parsedId.data).eq('user_id', user.id)
  if (error) {
    console.error('[academy/notes] deleteNote failed', error)
    return { ok: false }
  }
  revalidatePath(`/academy/learn/${course.data}/${lesson.data}`)
  return { ok: true }
}
