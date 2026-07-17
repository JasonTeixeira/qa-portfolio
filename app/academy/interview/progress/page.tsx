import type { Metadata } from 'next'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { EmptyState } from '@/components/academy/interview/EmptyState'

export const metadata: Metadata = {
  title: 'Progress — Interview Mastery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Progress — readiness-over-time, skill trajectories, and cohort percentile. Phase 0 ships the
 * honest shell; the real ReadinessChart over interview_readiness_snapshots lands in Phase 2.
 * Cohort percentile stays "not enough data yet" until the cohort is real.
 */
export default function InterviewProgressPage() {
  return (
    <InterviewShell active="progress">
      <EmptyState
        kicker="Progress · readiness over time"
        title="The curve starts at your first placement mock."
        line="Every graded mock drops a real snapshot here, so you can watch readiness climb toward the bar. There are no snapshots yet — and we won't draw a line that isn't real."
        ctas={[{ href: '/academy/interview', label: 'Go to the cockpit' }]}
      />
    </InterviewShell>
  )
}
