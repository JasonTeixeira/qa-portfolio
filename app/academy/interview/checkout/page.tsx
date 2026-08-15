import type { Metadata } from 'next'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { EmptyState } from '@/components/academy/interview/EmptyState'

export const metadata: Metadata = {
  title: 'Add Interview Mastery — checkout',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Checkout — adds the Interview Mastery line item onto the Academy plan (a new recurring Stripe
 * price). Signed-in only (gated by the middleware). Phase 0 ships the honest shell; the real
 * kind:'interview' Stripe checkout + webhook land in Phase 4. Enrollment is closed until then.
 */
export default function InterviewCheckoutPage() {
  return (
    <InterviewShell active={null} backHref="/academy/interview/mastery">
      <EmptyState
        kicker="Checkout"
        title="Enrollment isn't open yet."
        line="Interview Mastery is a separate add-on onto your Academy plan. Billing goes live once the add-on launches — nothing is charged today, and there's no card form to fill in yet."
        ctas={[{ href: '/academy/interview/mastery', label: '← Back to the overview', kind: 'ghost' }]}
      />
    </InterviewShell>
  )
}
