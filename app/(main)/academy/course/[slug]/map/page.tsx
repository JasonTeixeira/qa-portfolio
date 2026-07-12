import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCourseOverview } from '@/lib/academy/content'
import { getCourseProgress } from '@/lib/academy/progress'
import { CourseMap } from '@/components/academy/course/CourseMap'
import { AcademyShell } from '@/components/academy/academy-shell'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const overview = await getCourseOverview(slug)
  return {
    title: overview ? `${overview.title} — Course Map — Sage Academy` : 'Course Map — Sage Academy',
    robots: { index: false, follow: false },
  }
}

export default async function CourseMapPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const overview = await getCourseOverview(slug)
  if (!overview) notFound()

  // Real completion + resume point — same loaders the course overview uses.
  const { completed } = await getCourseProgress(slug)
  const all = overview.modules.flatMap((m) => m.lessons)
  const doneCount = all.filter((l) => completed.has(l.slug)).length
  const resumeSlug = (all.find((l) => !completed.has(l.slug)) ?? all[0])?.slug ?? null

  return (
    <AcademyShell active="courses">
      <CourseMap overview={overview} completed={completed} doneCount={doneCount} resumeSlug={resumeSlug} />
    </AcademyShell>
  )
}
