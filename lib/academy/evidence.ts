import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { TopicKey } from '@/lib/academy/topics'

/**
 * Proof of Work — the learner's accumulated, verifiable evidence. The Sage
 * Learning Engine's whole premise is "proof, not completion"; this is where that
 * proof lives: every sprint proven, every course finished, every certificate
 * earned, on a timeline the learner can show an employer.
 */

export type EvidenceItem = {
  courseSlug: string
  courseTitle: string
  lessonSlug: string
  lessonTitle: string
  topic: TopicKey
  at: string
}

export type EvidenceCert = { code: string; courseTitle: string; topic: TopicKey; issuedAt: string }

export type EvidenceLedger = {
  signedIn: boolean
  name: string
  sprintsProven: number
  coursesCompleted: number
  certificatesEarned: number
  hoursInvested: number
  timeline: EvidenceItem[]
  certificates: EvidenceCert[]
}

const EMPTY: EvidenceLedger = {
  signedIn: false, name: '', sprintsProven: 0, coursesCompleted: 0,
  certificatesEarned: 0, hoursInvested: 0, timeline: [], certificates: [],
}

export async function getEvidence(): Promise<EvidenceLedger> {
  try {
    const sb = await createSupabaseServerClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return EMPTY
    const name = (user.email ?? 'learner').split('@')[0]

    const [{ data: progress }, { data: certsRaw }] = await Promise.all([
      sb.from('academy_progress').select('course_slug, lesson_slug, status, updated_at')
        .eq('user_id', user.id).eq('status', 'completed').order('updated_at', { ascending: false }),
      sb.from('academy_certificates').select('cert_code, course_slug, issued_at')
        .eq('user_id', user.id).order('issued_at', { ascending: false }),
    ])

    const completed = progress ?? []
    const courseSlugs = [...new Set(completed.map((r) => r.course_slug))]
    const lessonSlugs = [...new Set(completed.map((r) => r.lesson_slug))]

    const [courseMetaRes, lessonMetaRes] = await Promise.all([
      courseSlugs.length
        ? sb.from('academy_courses').select('slug, title, topic, lessons').in('slug', courseSlugs)
        : Promise.resolve({ data: [] as { slug: string; title: string; topic: string; lessons: number }[] }),
      lessonSlugs.length
        ? sb.from('academy_lessons').select('slug, title, est_minutes, course_slug').in('slug', lessonSlugs)
        : Promise.resolve({ data: [] as { slug: string; title: string; est_minutes: number; course_slug: string }[] }),
    ])
    const courseMeta = new Map((courseMetaRes.data ?? []).map((c) => [c.slug, c]))
    // lessons are keyed by (course_slug, slug) — build a composite map for safety.
    const lessonMeta = new Map((lessonMetaRes.data ?? []).map((l) => [`${l.course_slug}:${l.slug}`, l]))

    const timeline: EvidenceItem[] = completed.map((r) => {
      const cm = courseMeta.get(r.course_slug)
      const lm = lessonMeta.get(`${r.course_slug}:${r.lesson_slug}`)
      return {
        courseSlug: r.course_slug,
        courseTitle: cm?.title ?? r.course_slug,
        lessonSlug: r.lesson_slug,
        lessonTitle: lm?.title ?? r.lesson_slug.replace(/-/g, ' '),
        topic: (cm?.topic ?? 'foundations') as TopicKey,
        at: r.updated_at,
      }
    })

    const hoursInvested = Math.round(
      completed.reduce((sum, r) => sum + (lessonMeta.get(`${r.course_slug}:${r.lesson_slug}`)?.est_minutes ?? 10), 0) / 60,
    )

    // a course counts complete when its completed-lesson count >= its lesson total
    const doneByCourse = new Map<string, number>()
    for (const r of completed) doneByCourse.set(r.course_slug, (doneByCourse.get(r.course_slug) ?? 0) + 1)
    let coursesCompleted = 0
    for (const slug of courseSlugs) {
      const total = courseMeta.get(slug)?.lessons ?? 0
      if (total > 0 && (doneByCourse.get(slug) ?? 0) >= total) coursesCompleted++
    }

    const certCourseSlugs = (certsRaw ?? []).map((c) => c.course_slug)
    const certMetaRes = certCourseSlugs.length
      ? await sb.from('academy_courses').select('slug, title, topic').in('slug', certCourseSlugs)
      : { data: [] as { slug: string; title: string; topic: string }[] }
    const certMeta = new Map((certMetaRes.data ?? []).map((c) => [c.slug, c]))
    const certificates: EvidenceCert[] = (certsRaw ?? []).map((c) => ({
      code: c.cert_code,
      courseTitle: certMeta.get(c.course_slug)?.title ?? c.course_slug,
      topic: (certMeta.get(c.course_slug)?.topic ?? 'foundations') as TopicKey,
      issuedAt: c.issued_at,
    }))

    return {
      signedIn: true,
      name,
      sprintsProven: completed.length,
      coursesCompleted,
      certificatesEarned: certificates.length,
      hoursInvested,
      timeline,
      certificates,
    }
  } catch {
    return EMPTY
  }
}
