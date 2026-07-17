import type { Metadata } from 'next'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { EmptyState } from '@/components/academy/interview/EmptyState'

export const metadata: Metadata = {
  title: 'Set your target — Interview Mastery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Onboarding — the 5-step target wizard (role, level, timeline, JD, evidence) that writes
 * interview_profiles. Phase 0 ships the honest shell; the wizard itself lands in Phase 1.
 */
export default function InterviewOnboardingPage() {
  return (
    <InterviewShell active={null} backHref="/academy/interview">
      <EmptyState
        kicker="Onboarding · step 1 of 5"
        title="Tell Marlowe what you're aiming at."
        line="Role, level, timeline, and an optional job description. This sets your bar and shapes every mock — the target wizard opens here in your first session."
        ctas={[{ href: '/academy/interview', label: '← Back to the cockpit', kind: 'ghost' }]}
      />
    </InterviewShell>
  )
}
