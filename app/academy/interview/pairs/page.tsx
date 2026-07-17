import type { Metadata } from 'next'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { EmptyState } from '@/components/academy/interview/EmptyState'

export const metadata: Metadata = {
  title: 'Peer loops — Interview Mastery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Pairs — ASYNC peer loops only (Spec §7). This is a request + scheduling stub; there is no live
 * A/V room or presence, and we never claim one. Phase 0 ships the honest shell; the request flow
 * over interview_peer_matches lands in Phase 3.
 */
export default function InterviewPairsPage() {
  return (
    <InterviewShell active="pairs">
      <EmptyState
        kicker="Async peer loops"
        title="Trade a mock with another member — on your own clock."
        line="Peer loops are asynchronous: you request a slot, get matched, and exchange feedback. No live call, no presence — just a real request that flips to matched when someone takes it."
        ctas={[{ href: '/academy/interview', label: 'Go to the cockpit' }]}
      />
    </InterviewShell>
  )
}
