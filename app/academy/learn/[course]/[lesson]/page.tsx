import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LessonPlayer } from '@/components/academy/lesson/LessonPlayer'
import { getCourse, getLesson } from '@/lib/academy/content'
import { getCourseProgress } from '@/lib/academy/progress'
import { getAcademyAccess, isLessonUnlocked } from '@/lib/academy/access'
import type { LessonStatus } from '@/data/academy/sample-course'

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

  const [{ signedIn, completed }, access] = await Promise.all([
    getCourseProgress(baseCourse.slug),
    getAcademyAccess(),
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

  return (
    <LessonPlayer
      course={course}
      lesson={lesson}
      signedIn={signedIn}
      initialCompleted={signedIn && completed.has(lesson.slug)}
      locked={locked}
    />
  )
}
