import type { Metadata } from 'next'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { EmptyState } from '@/components/academy/interview/EmptyState'

export const metadata: Metadata = {
  title: 'Offer — Interview Mastery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * The win recap — the END-OF-JOURNEY celebration when a member LANDS a job (not the sales offer).
 * It recaps the climb, opens the negotiation rehearsal, and triggers the auto-pause of billing 30
 * days out. Phase 0 ships the honest shell; the recap + auto-pause land in Phase 4, and it only
 * appears once an offer is logged in the pipeline.
 */
export default function InterviewOfferPage() {
  return (
    <InterviewShell active={null} backHref="/academy/interview">
      <EmptyState
        kicker="Win recap"
        title="This page lights up the day you land the offer."
        line="When you log an offer, Interview Mastery recaps your climb, rehearses the negotiation, and quietly schedules your billing to pause 30 days out — because the point was always to stop needing it."
        ctas={[{ href: '/academy/interview', label: 'Go to the cockpit' }]}
      />
    </InterviewShell>
  )
}
