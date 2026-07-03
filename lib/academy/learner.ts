import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase/server'
import type { TopicKey } from '@/lib/academy/topics'

export type DashCourse = {
  slug: string
  title: string
  topic: TopicKey
  level: string
  total: number
  done: number
  pct: number
}
export type DashCert = { code: string; courseSlug: string; courseTitle: string; topic: TopicKey; issuedAt: string }
export type DashPath = { id: string; name: string; courseSlugs: string[] }
export type LearnerDashboard = {
  signedIn: boolean
  name: string
  lessonsCompleted: number
  coursesInProgress: number
  coursesCompleted: number
  continueTo: { courseSlug: string; lessonSlug: string } | null
  courses: DashCourse[]
  certificates: DashCert[]
  paths: DashPath[]
}

export async function getLearnerDashboard(): Promise<LearnerDashboard> {
  const empty: LearnerDashboard = {
    signedIn: false, name: '', lessonsCompleted: 0, coursesInProgress: 0, coursesCompleted: 0,
    continueTo: null, courses: [], certificates: [], paths: [],
  }
  try {
    const sb = await createSupabaseServerClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return empty
    const name = (user.email ?? 'learner').split('@')[0]

    const [{ data: progress }, { data: certsRaw }, { data: pathsRaw }] = await Promise.all([
      sb.from('academy_progress').select('course_slug, lesson_slug, status, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }),
      sb.from('academy_certificates').select('cert_code, course_slug, issued_at').eq('user_id', user.id).order('issued_at', { ascending: false }),
      sb.from('academy_paths').select('id, name, course_slugs').eq('user_id', user.id).order('updated_at', { ascending: false }),
    ])

    const rows = progress ?? []
    const slugs = [...new Set(rows.map((r) => r.course_slug))]
    const courseMeta = slugs.length
      ? (await sb.from('academy_courses').select('slug, title, topic, level, lessons').in('slug', slugs)).data ?? []
      : []
    const metaBySlug = new Map(courseMeta.map((c) => [c.slug, c]))

    const doneByCourse = new Map<string, number>()
    for (const r of rows) if (r.status === 'completed') doneByCourse.set(r.course_slug, (doneByCourse.get(r.course_slug) ?? 0) + 1)

    const courses: DashCourse[] = slugs.map((slug) => {
      const m = metaBySlug.get(slug)
      const total = m?.lessons ?? 0
      const done = doneByCourse.get(slug) ?? 0
      return {
        slug,
        title: m?.title ?? slug,
        topic: (m?.topic ?? 'foundations') as TopicKey,
        level: m?.level ?? '',
        total,
        done,
        pct: total ? Math.round((done / total) * 100) : 0,
      }
    }).sort((a, b) => b.pct - a.pct)

    const certCourseSlugs = (certsRaw ?? []).map((c) => c.course_slug)
    const certMeta = certCourseSlugs.length
      ? (await sb.from('academy_courses').select('slug, title, topic').in('slug', certCourseSlugs)).data ?? []
      : []
    const certMetaBySlug = new Map(certMeta.map((c) => [c.slug, c]))
    const certificates: DashCert[] = (certsRaw ?? []).map((c) => ({
      code: c.cert_code,
      courseSlug: c.course_slug,
      courseTitle: certMetaBySlug.get(c.course_slug)?.title ?? c.course_slug,
      topic: (certMetaBySlug.get(c.course_slug)?.topic ?? 'foundations') as TopicKey,
      issuedAt: c.issued_at,
    }))

    const lessonsCompleted = rows.filter((r) => r.status === 'completed').length
    const coursesCompleted = courses.filter((c) => c.total > 0 && c.done >= c.total).length
    // Resume only an actually-unfinished lesson. No `?? rows[0]` fallback: a learner
    // who has completed everything gets a null resume (the dashboard's dominant action
    // then falls through to the next-milestone / catalog CTA) — never an incoherent
    // "Resume → 100%" card pointing at a finished lesson.
    const continueTo = rows.find((r) => r.status !== 'completed') ?? null
    return {
      signedIn: true,
      name,
      lessonsCompleted,
      coursesInProgress: courses.filter((c) => c.done > 0 && (c.total === 0 || c.done < c.total)).length,
      coursesCompleted,
      continueTo: continueTo ? { courseSlug: continueTo.course_slug, lessonSlug: continueTo.lesson_slug } : null,
      courses,
      certificates,
      paths: (pathsRaw ?? []).map((p) => ({ id: p.id, name: p.name, courseSlugs: (p.course_slugs as string[]) ?? [] })),
    }
  } catch (err) {
    console.error('[academy/learner] getLearnerDashboard failed', err)
    return empty
  }
}

/** One real artifact the learner shipped for this course — the closest thing to a "proof held". */
export type CertificateArtifact = {
  title: string
  /** repo_url ?? demo_url — a real link if one exists, else null. */
  url: string | null
}

export type CertificateView = {
  code: string
  recipientName: string
  courseTitle: string
  courseSlug: string
  topic: TopicKey
  issuedAt: string
  /** Real: the course's published lesson count (courses.lessons). 0 when unknown. */
  lessonCount: number
  /** Real: distinct module titles for this course, in order (derived from academy_lessons). */
  modules: string[]
  /** Real: artifacts the learner shipped for this course. May be empty. */
  artifacts: CertificateArtifact[]
  /**
   * There is no revocation column on academy_certificates. A row existing IS the
   * certificate being valid; revocation is not modeled yet. Always false today —
   * kept as a field so the public verify shape is honest and future-proof.
   */
  revoked: boolean
}

/** Public, shareable — fetched by code via service role (RLS stays own-only for the dashboard). */
export async function getCertificate(code: string): Promise<CertificateView | null> {
  try {
    const admin = supabaseAdmin()
    const { data: cert } = await admin
      .from('academy_certificates')
      .select('cert_code, course_slug, recipient_name, issued_at, user_id')
      .eq('cert_code', code)
      .maybeSingle()
    if (!cert) return null

    const [{ data: course }, { data: lessonRows }, { data: artifactRows }] = await Promise.all([
      admin.from('academy_courses').select('title, topic, lessons').eq('slug', cert.course_slug).maybeSingle(),
      admin
        .from('academy_lessons')
        .select('module_title, module_sort, sort')
        .eq('course_slug', cert.course_slug)
        .eq('status', 'published')
        .order('module_sort', { ascending: true })
        .order('sort', { ascending: true }),
      admin
        .from('academy_artifacts')
        .select('title, repo_url, demo_url, created_at')
        .eq('user_id', cert.user_id)
        .eq('course_slug', cert.course_slug)
        .order('created_at', { ascending: true }),
    ])

    // Distinct module titles, preserving first-seen order (real course structure).
    const modules: string[] = []
    for (const r of lessonRows ?? []) {
      const m = (r.module_title as string | null)?.trim()
      if (m && !modules.includes(m)) modules.push(m)
    }

    const artifacts: CertificateArtifact[] = (artifactRows ?? [])
      .map((a) => ({
        title: (a.title as string | null)?.trim() ?? '',
        url: (a.repo_url as string | null) ?? (a.demo_url as string | null) ?? null,
      }))
      .filter((a) => a.title.length > 0)

    return {
      code: cert.cert_code,
      recipientName: cert.recipient_name ?? 'A Sage Academy learner',
      courseTitle: course?.title ?? cert.course_slug,
      courseSlug: cert.course_slug,
      topic: (course?.topic ?? 'foundations') as TopicKey,
      issuedAt: cert.issued_at,
      lessonCount: (course?.lessons as number | null) ?? 0,
      modules,
      artifacts,
      revoked: false,
    }
  } catch (err) {
    console.error('[academy/learner] getCertificate failed', err)
    return null
  }
}
