import type { Metadata } from 'next'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { EmptyState } from '@/components/academy/interview/EmptyState'

export const metadata: Metadata = {
  title: 'Schedule — Interview Mastery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * The taper/countdown schedule — a week grid working backward from the target date, onsite
 * running order, and reminders. Phase 0 ships the honest shell; the real ScheduleTaper lands in
 * Phase 2 (needs a target date from onboarding).
 */
export default function InterviewSchedulePage() {
  return (
    <InterviewShell active="schedule">
      <EmptyState
        kicker="Schedule · taper"
        title="Your plan is built backward from your interview date."
        line="Set a target date and Marlowe lays out the taper — hard reps, dress rehearsals, then go-time — week by week. Set your target to unlock the grid."
        ctas={[{ href: '/academy/interview/onboarding', label: 'Set your target' }]}
      />
    </InterviewShell>
  )
}
