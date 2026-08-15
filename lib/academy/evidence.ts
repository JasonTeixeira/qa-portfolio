import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { TopicKey } from '@/lib/academy/topics'

/**
 * Proof of Work — the learner's accumulated, verifiable evidence. The Sage
 * Learning Engine's whole premise is "proof, not completion"; this is where that
 * proof lives: every sprint proven, every course finished, every certificate
 * earned, on a timeline the learner can show an employer.
 */

/**
 * Verdict for a single proof row. The Learning Engine records evidence only
 * AFTER a real checkpoint passes, so a recorded proof is always a genuine pass
 * ("proven"). The only honest exception is an OPEN repair — a teachback that
 * failed grading and hasn't been redone — which reads as "needs repair". There
 * is no real per-artifact "in review" state, so we never synthesize one.
 */
export type EvidenceVerdict = 'proven' | 'needs-repair'

export type EvidenceItem = {
  courseSlug: string
  courseTitle: string
  lessonSlug: string
  lessonTitle: string
  topic: TopicKey
  at: string
  verdict: EvidenceVerdict
  /** A real learner-attached artifact for this course/lesson, if one exists. */
  artifactTitle: string | null
  artifactUrl: string | null
}

export type EvidenceCert = { code: string; courseTitle: string; topic: TopicKey; issuedAt: string }

/** A course the learner has started but not finished — the honest "in progress" certificate. */
export type EvidenceInProgress = {
  courseSlug: string
  courseTitle: string
  topic: TopicKey
  lessonsDone: number
  lessonsTotal: number
  openRepairs: number
}

export type EvidenceLedger = {
  signedIn: boolean
  name: string
  sprintsProven: number
  coursesCompleted: number
  certificatesEarned: number
  hoursInvested: number
  timeline: EvidenceItem[]
  certificates: EvidenceCert[]
  inProgress: EvidenceInProgress | null
  /** Real verdict tallies over the timeline (no "in review" — see EvidenceVerdict). */
  provenCount: number
  needsRepairCount: number
  /** Public share link if the learner's profile is public; null otherwise. */
  shareUrl: string | null
}

const EMPTY: EvidenceLedger = {
  signedIn: false, name: '', sprintsProven: 0, coursesCompleted: 0,
  certificatesEarned: 0, hoursInvested: 0, timeline: [], certificates: [],
  inProgress: null, provenCount: 0, needsRepairCount: 0, shareUrl: null,
}

export async function getEvidence(): Promise<EvidenceLedger> {
  try {
    const sb = await createSupabaseServerClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return EMPTY
    const name = (user.email ?? 'learner').split('@')[0]

    const [
      { data: progress },
      { data: certsRaw },
      { data: artifactsRaw },
      { data: repairEvents },
      { data: profileRow },
    ] = await Promise.all([
      sb.from('academy_progress').select('course_slug, lesson_slug, status, updated_at')
        .eq('user_id', user.id).eq('status', 'completed').order('updated_at', { ascending: false }),
      sb.from('academy_certificates').select('cert_code, course_slug, issued_at')
        .eq('user_id', user.id).order('issued_at', { ascending: false }),
      // Real learner-attached artifacts — matched to a proof row by course/lesson.
      sb.from('academy_artifacts').select('course_slug, lesson_slug, title, repo_url, demo_url, created_at')
        .eq('user_id', user.id).order('created_at', { ascending: false }),
      // Repair events — an open repair (created > completed) is the only honest "needs repair".
      sb.from('academy_evidence_events').select('course_slug, lesson_slug, unit_id, event_type')
        .eq('user_id', user.id).in('event_type', ['repair_created', 'repair_completed']),
      sb.from('academy_profiles').select('handle, is_public').eq('user_id', user.id).maybeSingle(),
    ])

    const completed = progress ?? []
    const courseSlugs = [...new Set(completed.map((r) => r.course_slug))]
    const lessonSlugs = [...new Set(completed.map((r) => r.lesson_slug))]

    // Fold repair events into per-lesson open counts (created > completed = open).
    const repairByLesson = new Map<string, number>()
    {
      const balance = new Map<string, number>() // by unit
      for (const e of repairEvents ?? []) {
        const unitKey = `${e.course_slug}:${e.lesson_slug}:${e.unit_id}`
        balance.set(unitKey, (balance.get(unitKey) ?? 0) + (e.event_type === 'repair_created' ? 1 : -1))
      }
      for (const [unitKey, bal] of balance) {
        if (bal <= 0) continue
        const [cs, ls] = unitKey.split(':')
        const lessonKey = `${cs}:${ls}`
        repairByLesson.set(lessonKey, (repairByLesson.get(lessonKey) ?? 0) + bal)
      }
    }

    // Real artifacts, indexed by course:lesson (with a course-only fallback).
    const artifactByLesson = new Map<string, { title: string; url: string | null }>()
    const artifactByCourse = new Map<string, { title: string; url: string | null }>()
    for (const a of artifactsRaw ?? []) {
      const url = (a.repo_url as string | null) || (a.demo_url as string | null) || null
      const entry = { title: a.title as string, url }
      if (a.course_slug && a.lesson_slug) {
        const k = `${a.course_slug}:${a.lesson_slug}`
        if (!artifactByLesson.has(k)) artifactByLesson.set(k, entry)
      }
      if (a.course_slug && !artifactByCourse.has(a.course_slug as string)) {
        artifactByCourse.set(a.course_slug as string, entry)
      }
    }

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
      const lessonKey = `${r.course_slug}:${r.lesson_slug}`
      const artifact = artifactByLesson.get(lessonKey) ?? artifactByCourse.get(r.course_slug) ?? null
      return {
        courseSlug: r.course_slug,
        courseTitle: cm?.title ?? r.course_slug,
        lessonSlug: r.lesson_slug,
        lessonTitle: lm?.title ?? r.lesson_slug.replace(/-/g, ' '),
        topic: (cm?.topic ?? 'foundations') as TopicKey,
        at: r.updated_at,
        // A proof row is "proven" unless it has an OPEN repair on the same lesson.
        verdict: (repairByLesson.get(lessonKey) ?? 0) > 0 ? 'needs-repair' : 'proven',
        artifactTitle: artifact?.title ?? null,
        artifactUrl: artifact?.url ?? null,
      }
    })

    const needsRepairCount = timeline.filter((t) => t.verdict === 'needs-repair').length
    const provenCount = timeline.length - needsRepairCount

    const hoursInvested = Math.round(
      completed.reduce((sum, r) => sum + (lessonMeta.get(`${r.course_slug}:${r.lesson_slug}`)?.est_minutes ?? 10), 0) / 60,
    )

    // a course counts complete when its completed-lesson count >= its lesson total
    const doneByCourse = new Map<string, number>()
    for (const r of completed) doneByCourse.set(r.course_slug, (doneByCourse.get(r.course_slug) ?? 0) + 1)
    let coursesCompleted = 0
    // The "in progress" certificate: the started-but-unfinished course furthest
    // along (most lessons done). Real progress only — omitted when none applies.
    let inProgress: EvidenceInProgress | null = null
    for (const slug of courseSlugs) {
      const cm = courseMeta.get(slug)
      const total = cm?.lessons ?? 0
      const done = doneByCourse.get(slug) ?? 0
      if (total > 0 && done >= total) {
        coursesCompleted++
        continue
      }
      if (total > 0 && done < total) {
        const candidate: EvidenceInProgress = {
          courseSlug: slug,
          courseTitle: cm?.title ?? slug,
          topic: (cm?.topic ?? 'foundations') as TopicKey,
          lessonsDone: done,
          lessonsTotal: total,
          openRepairs: [...repairByLesson.entries()]
            .filter(([k]) => k.startsWith(`${slug}:`))
            .reduce((n, [, v]) => n + v, 0),
        }
        if (!inProgress || candidate.lessonsDone > inProgress.lessonsDone) inProgress = candidate
      }
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

    // Public share link — only when the learner has made their profile public.
    const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sageideas.dev'
    const shareUrl =
      profileRow?.is_public && profileRow.handle
        ? `${site}/academy/u/${profileRow.handle}`
        : null

    return {
      signedIn: true,
      name,
      sprintsProven: completed.length,
      coursesCompleted,
      certificatesEarned: certificates.length,
      hoursInvested,
      timeline,
      certificates,
      inProgress,
      provenCount,
      needsRepairCount,
      shareUrl,
    }
  } catch {
    return EMPTY
  }
}
