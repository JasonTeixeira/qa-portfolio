import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LessonPlayer } from '@/components/academy/lesson/LessonPlayer'
import { getCourse, getLesson } from '@/lib/academy/content'
import { getCourseProgress } from '@/lib/academy/progress'
import { listNotes } from '@/lib/academy/notes'
import { getAcademyAccess, isLessonUnlocked } from '@/lib/academy/access'
import { getUnitState, getUnitScore } from '@/lib/academy/evidence-events'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { LessonStatus } from '@/data/academy/sample-course'
import type { UnitState } from '@/lib/academy/evidence-events-logic'
import type { ScoreResolution } from '@/lib/academy/caps-logic'

export const metadata: Metadata = {
  title: 'Lesson — Sage Academy',
  robots: { index: false, follow: false },
}

export default async function LearnPage({
  params,
}: {
  params: Promise<{ course: string; lesson: string }>
}) {
  const { course: courseSlug, lesson: lessonSlug } = await params

  const [baseCourse, lesson] = await Promise.all([
    getCourse(courseSlug),
    getLesson(courseSlug, lessonSlug),
  ])
  if (!baseCourse || !lesson) notFound()

  const [{ signedIn, completed }, access, notes] = await Promise.all([
    getCourseProgress(baseCourse.slug),
    getAcademyAccess(),
    listNotes(courseSlug, lessonSlug),
  ])
  const locked = !isLessonUnlocked(lesson.isFreePreview ?? false, access)

  const modules = baseCourse.modules.map((m) => ({
    ...m,
    lessons: m.lessons.map((l) => {
      const status: LessonStatus = completed.has(l.slug)
        ? 'done'
        : l.slug === lesson.slug
          ? 'current'
          : 'todo'
      return { ...l, status }
    }),
  }))

  const all = modules.flatMap((m) => m.lessons)
  const course = {
    ...baseCourse,
    modules,
    lessonsTotal: all.length,
    lessonsDone: all.filter((l) => l.status === 'done').length,
  }

  // Tier-0 evidence spine: derive this unit's state + capped score for the lesson
  // header. unitId = lessonSlug (one lesson = one unit); the learner reached this
  // page, so prerequisites are met (unlocked = true). The contract is honest about
  // current platform reality — AI guide + mastery map aren't built yet, so the
  // score is legitimately capped (that's intended, not a bug).
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()

  let unitState: UnitState = 'ready'
  let unitScore: ScoreResolution | null = null
  if (user) {
    const unitId = lesson.slug
    ;[unitState, unitScore] = await Promise.all([
      getUnitState(user.id, course.slug, lesson.slug, unitId, true),
      getUnitScore(user.id, course.slug, lesson.slug, unitId, {
        scenarioFirst: true,
        habitTriggers: true,
        socialSurface: true,
        aiGuideGrounding: false,
        masteryMapEntry: false,
      }),
    ])
  }

  return (
    <LessonPlayer
      course={course}
      lesson={lesson}
      signedIn={signedIn}
      initialCompleted={signedIn && completed.has(lesson.slug)}
      locked={locked}
      unitState={unitState}
      unitScore={unitScore}
      notes={notes}
    />
  )
}
