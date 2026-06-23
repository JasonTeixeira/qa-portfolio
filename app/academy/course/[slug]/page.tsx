import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCourseOverview } from '@/lib/academy/content'
import { getCourseProgress } from '@/lib/academy/progress'
import { CourseOverview } from '@/components/academy/course/CourseOverview'
import { AcademyShell } from '@/components/academy/academy-shell'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const overview = await getCourseOverview(slug)
  return {
    title: overview ? `${overview.title} — Sage Academy` : 'Course — Sage Academy',
    robots: { index: false, follow: false },
  }
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const overview = await getCourseOverview(slug)
  if (!overview) notFound()

  const { completed } = await getCourseProgress(slug)
  const all = overview.modules.flatMap((m) => m.lessons)
  const doneCount = all.filter((l) => completed.has(l.slug)).length
  const continueSlug = (all.find((l) => !completed.has(l.slug)) ?? all[0])?.slug ?? null

  return (
    <AcademyShell active="catalog">
      <CourseOverview overview={overview} completed={completed} doneCount={doneCount} continueSlug={continueSlug} />
    </AcademyShell>
  )
}
