import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase/server'

/** Returns the admin user if the current session is an admin/owner, else null. */
export async function getAdminUser(): Promise<{ id: string; email: string | null } | null> {
  try {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return null
    const admin = supabaseAdmin()
    const { data } = await admin.from('app_users').select('role').eq('id', user.id).maybeSingle()
    const role = data?.role
    if (role === 'admin' || role === 'owner') return { id: user.id, email: user.email ?? null }
    return null
  } catch {
    return null
  }
}

export type AdminCourseRow = {
  slug: string
  title: string
  topic: string
  level: string
  lessons: number
  hours: number
  sort: number
  status: string
}

export async function getAdminCourses(): Promise<AdminCourseRow[]> {
  const admin = supabaseAdmin()
  const { data } = await admin
    .from('academy_courses')
    .select('slug, title, topic, level, lessons, hours, sort, status')
    .order('sort')
  return (data ?? []) as AdminCourseRow[]
}

export type AdminLessonRow = {
  slug: string
  title: string
  module_title: string
  module_sort: number
  sort: number
  est_minutes: number
  is_free_preview: boolean
  status: string
}

export async function getAdminCourse(slug: string): Promise<{ course: AdminCourseRow & { subtitle: string | null }; lessons: AdminLessonRow[] } | null> {
  const admin = supabaseAdmin()
  const { data: course } = await admin
    .from('academy_courses')
    .select('slug, title, subtitle, topic, level, lessons, hours, sort, status')
    .eq('slug', slug)
    .maybeSingle()
  if (!course) return null
  const { data: lessons } = await admin
    .from('academy_lessons')
    .select('slug, title, module_title, module_sort, sort, est_minutes, is_free_preview, status')
    .eq('course_slug', slug)
    .order('module_sort')
    .order('sort')
  return { course: course as AdminCourseRow & { subtitle: string | null }, lessons: (lessons ?? []) as AdminLessonRow[] }
}

export async function getAdminLesson(courseSlug: string, lessonSlug: string) {
  const admin = supabaseAdmin()
  const { data } = await admin
    .from('academy_lessons')
    .select('slug, title, eyebrow, module_title, module_sort, sort, est_minutes, is_free_preview, status, intensity, blocks')
    .eq('course_slug', courseSlug)
    .eq('slug', lessonSlug)
    .maybeSingle()
  return data
}
