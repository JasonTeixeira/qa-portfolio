import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getCourseOverview } from '@/lib/academy/content'
import { getCourseAssessmentForLearner, getAssessmentState } from '@/lib/academy/assessments'
import { AcademyShell } from '@/components/academy/academy-shell'
import { AssessmentGate } from '@/components/academy/assessment/AssessmentGate'

export const metadata: Metadata = {
  title: 'Assessment — Sage Academy',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ slug: string; kind: string }>
}) {
  const { slug, kind } = await params
  if (kind !== 'pretest' && kind !== 'posttest') notFound()

  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return null

  const [overview, questions, state] = await Promise.all([
    getCourseOverview(slug),
    getCourseAssessmentForLearner(slug, kind),
    getAssessmentState(user.id, slug),
  ])
  if (!overview) notFound()
  if (questions.length === 0) redirect(`/academy/course/${slug}`) // nothing authored → skip the gate
  // Pretest is a one-time baseline — if already taken, send the learner into the course.
  if (kind === 'pretest' && state.pretestTaken) {
    redirect(overview.firstLessonSlug ? `/academy/learn/${slug}/${overview.firstLessonSlug}` : `/academy/course/${slug}`)
  }

  const startHref = overview.firstLessonSlug
    ? `/academy/learn/${slug}/${overview.firstLessonSlug}`
    : `/academy/course/${slug}`
  const nextHref = kind === 'pretest' ? startHref : `/academy/course/${slug}`
  const nextLabel = kind === 'pretest' ? 'Start the course →' : 'Back to the course →'

  return (
    <AcademyShell active="catalog">
      <AssessmentGate
        courseSlug={slug}
        kind={kind}
        questions={questions}
        nextHref={nextHref}
        nextLabel={nextLabel}
      />
    </AcademyShell>
  )
}
