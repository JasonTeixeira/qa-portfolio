import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getLesson } from '@/lib/academy/content'
import { getAcademyAccess, isLessonUnlocked } from '@/lib/academy/access'
import { LabRunner } from '@/components/academy/lab/LabRunner'

export const metadata: Metadata = {
  title: 'Lab — Sage Academy',
  robots: { index: false, follow: false },
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ course: string; lesson: string }>
}) {
  const { course, lesson } = await params
  const [data, access] = await Promise.all([getLesson(course, lesson), getAcademyAccess()])
  const lab = data?.blocks.find((b) => b.type === 'lab')
  if (!data || !lab || lab.type !== 'lab') notFound()

  // Labs follow the same gate as their lesson — bounce locked learners to join.
  if (!isLessonUnlocked(data.isFreePreview ?? false, access)) {
    redirect('/academy/join')
  }

  return (
    <LabRunner
      title={lab.title}
      summary={lab.summary}
      starter={lab.starter ?? '# Write your Python here\nprint("hello")\n'}
      stdin={lab.stdin}
      hasCheck={Boolean(lab.check)}
      backHref={`/academy/learn/${course}/${lesson}`}
      courseSlug={course}
      lessonSlug={lesson}
    />
  )
}
