import type { Metadata } from 'next'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { EmptyState } from '@/components/academy/interview/EmptyState'

export const metadata: Metadata = {
  title: 'Mock room — Interview Mastery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * The live mock room — Marlowe's transcript + the mode workspace (code / whiteboard / STAR /
 * offer). Phase 0 ships the honest shell; the real MockSessionRunner + Marlowe stream land in
 * Phase 1. The [id] is the interview_sessions row.
 */
export default async function InterviewSessionPage({ params }: { params: Promise<{ id: string }> }) {
  await params
  return (
    <InterviewShell active={null} backHref="/academy/interview">
      <EmptyState
        kicker="Mock room"
        title="Your mock starts from the cockpit."
        line="Marlowe runs a live interview here — transcript on one side, your workspace on the other. Sessions are created when you start a placement mock, so there's nothing to resume yet."
        ctas={[{ href: '/academy/interview', label: 'Go to the cockpit' }]}
      />
    </InterviewShell>
  )
}
