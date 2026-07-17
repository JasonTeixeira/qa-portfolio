import type { Metadata } from 'next'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { EmptyState } from '@/components/academy/interview/EmptyState'

export const metadata: Metadata = {
  title: 'Verdict — Interview Mastery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * The committee verdict scorecard (processing → reveal). Phase 0 ships the honest shell; the
 * real AI-graded interview_verdicts scorecard lands in Phase 1. [sessionId] is the graded session.
 */
export default async function InterviewVerdictPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  await params
  return (
    <InterviewShell active={null} backHref="/academy/interview">
      <EmptyState
        kicker="Committee verdict"
        title="A verdict appears after a graded mock."
        line="Every completed mock is scored by a committee against the bar for your level — strong hire to strong no-hire, with timestamped transcript evidence. Run one to see yours."
        ctas={[{ href: '/academy/interview', label: 'Go to the cockpit' }]}
      />
    </InterviewShell>
  )
}
