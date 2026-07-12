'use server'

import { revalidatePath } from 'next/cache'
import { getAdminUser } from '@/lib/academy/admin'
import { supabaseAdmin } from '@/lib/supabase/server'

export type CourseInput = {
  slug: string
  title: string
  subtitle?: string
  topic: string
  level: string
  hours?: number
  sort?: number
  status?: string
}

export async function saveCourse(input: CourseInput): Promise<{ ok: boolean; error?: string; slug?: string }> {
  if (!(await getAdminUser())) return { ok: false, error: 'Not authorized' }
  if (!input.slug || !input.title) return { ok: false, error: 'Slug and title are required' }
  const admin = supabaseAdmin()
  const { error } = await admin.from('academy_courses').upsert(
    {
      slug: input.slug,
      title: input.title,
      subtitle: input.subtitle ?? null,
      topic: input.topic,
      level: input.level,
      hours: input.hours ?? 0,
      sort: input.sort ?? 0,
      status: input.status ?? 'published',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'slug' },
  )
  if (error) return { ok: false, error: error.message }
  revalidatePath('/academy-admin')
  revalidatePath('/academy/catalog')
  return { ok: true, slug: input.slug }
}

export type LessonInput = {
  courseSlug: string
  slug: string
  title: string
  eyebrow?: string
  moduleTitle?: string
  moduleSort?: number
  sort?: number
  estMinutes?: number
  isFreePreview?: boolean
  status?: string
  intensity?: string
  blocks: unknown[]
}

const VALID_INTENSITIES = new Set(['micro', 'standard', 'deep', 'capstone'])

export async function saveLesson(input: LessonInput): Promise<{ ok: boolean; error?: string }> {
  if (!(await getAdminUser())) return { ok: false, error: 'Not authorized' }
  if (!input.slug || !input.title) return { ok: false, error: 'Slug and title are required' }
  const admin = supabaseAdmin()
  const { error } = await admin.from('academy_lessons').upsert(
    {
      course_slug: input.courseSlug,
      slug: input.slug,
      title: input.title,
      eyebrow: input.eyebrow ?? null,
      module_title: input.moduleTitle ?? 'Module 1',
      module_sort: input.moduleSort ?? 0,
      sort: input.sort ?? 0,
      est_minutes: input.estMinutes ?? 5,
      is_free_preview: input.isFreePreview ?? false,
      status: input.status ?? 'published',
      intensity: VALID_INTENSITIES.has(input.intensity ?? '') ? input.intensity : 'standard',
      blocks: input.blocks,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'course_slug,slug' },
  )
  if (error) return { ok: false, error: error.message }

  const { count } = await admin
    .from('academy_lessons')
    .select('id', { count: 'exact', head: true })
    .eq('course_slug', input.courseSlug)
    .eq('status', 'published')
  await admin.from('academy_courses').update({ lessons: count ?? 0 }).eq('slug', input.courseSlug)

  revalidatePath(`/academy-admin/${input.courseSlug}`)
  revalidatePath(`/academy/course/${input.courseSlug}`)
  revalidatePath(`/academy/learn/${input.courseSlug}/${input.slug}`)
  return { ok: true }
}

export async function deleteLesson(courseSlug: string, lessonSlug: string): Promise<{ ok: boolean }> {
  if (!(await getAdminUser())) return { ok: false }
  const admin = supabaseAdmin()
  const { error } = await admin
    .from('academy_lessons')
    .delete()
    .eq('course_slug', courseSlug)
    .eq('slug', lessonSlug)
  if (error) {
    console.error('[academy-admin] deleteLesson failed', error)
    return { ok: false }
  }
  // Keep the denormalized course lesson-count accurate — otherwise it drifts high on
  // every deletion and the dashboard totals diverge from the certificate engine.
  const { count } = await admin
    .from('academy_lessons')
    .select('id', { count: 'exact', head: true })
    .eq('course_slug', courseSlug)
    .eq('status', 'published')
  await admin
    .from('academy_courses')
    .update({ lessons: count ?? 0, updated_at: new Date().toISOString() })
    .eq('slug', courseSlug)
  revalidatePath(`/academy-admin/${courseSlug}`)
  revalidatePath(`/academy/course/${courseSlug}`)
  return { ok: true }
}
