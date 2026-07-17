import type { Metadata } from 'next'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { EmptyState } from '@/components/academy/interview/EmptyState'

export const metadata: Metadata = {
  title: 'Debrief — Interview Mastery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * The timestamped debrief — moments to replay, rubric movement, and the weakest-first drill plan.
 * Phase 0 ships the honest shell; the real DebriefTimeline lands in Phase 2. [sessionId] is the
 * graded session.
 */
export default async function InterviewDebriefPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  await params
  return (
    <InterviewShell active={null} backHref="/academy/interview">
      <EmptyState
        kicker="Debrief"
        title="Your debrief is built from a real transcript."
        line="Timestamped moments you can replay, where each dimension moved, and the three drills that attack your cap first — all generated from a completed mock. Nothing to review yet."
        ctas={[{ href: '/academy/interview', label: 'Go to the cockpit' }]}
      />
    </InterviewShell>
  )
}
