import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getCourseOverview } from '@/lib/academy/content'
import { getCourseProgress } from '@/lib/academy/progress'
import { getAssessmentState } from '@/lib/academy/assessments'
import { CourseOverview } from '@/components/academy/course/CourseOverview'
import { AssessmentBanner } from '@/components/academy/assessment/AssessmentBanner'
import { AcademyShell } from '@/components/academy/academy-shell'
import { CourseLandingFallback, getFallbackCourse } from '@/components/academy/course/CourseLandingFallback'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const overview = await getCourseOverview(slug)
  const fallback = overview ? null : getFallbackCourse(slug)
  const title = overview?.title ?? fallback?.title
  return {
    title: title ? `${title} — Sage Academy` : 'Course — Sage Academy',
    // Public sell page: indexable when we actually have course content.
    robots: title ? { index: true, follow: true } : { index: false, follow: false },
  }
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const overview = await getCourseOverview(slug)
  if (!overview) {
    // Catalog unreachable (or course not in it): render the git-resident
    // manifest landing when we have real authored lessons, else 404.
    const fallback = getFallbackCourse(slug)
    if (fallback) return <CourseLandingFallback course={fallback} />
    notFound()
  }

  const { completed } = await getCourseProgress(slug)
  const all = overview.modules.flatMap((m) => m.lessons)
  const doneCount = all.filter((l) => completed.has(l.slug)).length
  const continueSlug = (all.find((l) => !completed.has(l.slug)) ?? all[0])?.slug ?? null

  // Assessment prompt (pretest before start, posttest at finish, gain after) — for signed-in learners.
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  const assessment = user ? await getAssessmentState(user.id, slug) : null
  const courseComplete = all.length > 0 && doneCount === all.length

  return (
    <AcademyShell active="courses">
      {assessment ? <AssessmentBanner slug={slug} state={assessment} courseComplete={courseComplete} /> : null}
      <CourseOverview overview={overview} completed={completed} doneCount={doneCount} continueSlug={continueSlug} />
    </AcademyShell>
  )
}
