import type { Metadata } from 'next'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { EmptyState } from '@/components/academy/interview/EmptyState'

export const metadata: Metadata = {
  title: 'Scenario library — Interview Mastery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * The scenario library — the full bank with track filters, company presets, and weakest-first
 * sort. Phase 0 ships the honest shell; the real LibraryFilters + ScenarioCard grid over
 * interview_scenarios (sorted by the learner's real weakest dimension) lands in Phase 2.
 */
export default function InterviewLibraryPage() {
  return (
    <InterviewShell active="library">
      <EmptyState
        kicker="Scenario library"
        title="The bank sorts itself around your weakest skill."
        line="Every scenario is tagged with the dimensions it attacks — including the signature lying-test-suite. Once you have a readiness profile, the library leads with what fixes your cap first."
        ctas={[{ href: '/academy/interview', label: 'Go to the cockpit' }]}
      />
    </InterviewShell>
  )
}
