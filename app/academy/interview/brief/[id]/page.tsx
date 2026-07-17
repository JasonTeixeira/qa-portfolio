import type { Metadata } from 'next'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { EmptyState } from '@/components/academy/interview/EmptyState'

export const metadata: Metadata = {
  title: 'Company brief — Interview Mastery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * The AI company brief — a JD decoded into interview implications, predicted rounds, your edge
 * and risk, and a tuned scenario queue. Phase 0 ships the honest shell; the real generator
 * (grounded only in the attached JD + the member's own history) lands in Phase 3. [id] is the
 * interview_company_briefs row.
 */
export default async function InterviewBriefPage({ params }: { params: Promise<{ id: string }> }) {
  await params
  return (
    <InterviewShell active={null} backHref="/academy/interview">
      <EmptyState
        kicker="Company brief"
        title="A brief is built from the job description you attach."
        line="Attach a JD and Marlowe decodes it into the loop you'll likely face, your edge and risk from your own history, and a tuned scenario queue. Attach one during onboarding to generate a brief."
        ctas={[{ href: '/academy/interview/onboarding', label: 'Attach a job description' }]}
      />
    </InterviewShell>
  )
}
