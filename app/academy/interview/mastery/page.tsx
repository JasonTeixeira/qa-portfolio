import type { Metadata } from 'next'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { EmptyState } from '@/components/academy/interview/EmptyState'
import { isInterviewGateEnabled } from '@/lib/academy/interview-access'
import styles from '@/components/academy/interview/interview.module.css'

export const metadata: Metadata = {
  title: 'Interview Mastery — measured mock interviews with Marlowe',
  description:
    'A paid Sage Academy add-on: run mock interviews with an AI committee, get an honest readiness score against the bar for your target level, and drill your weakest dimension first.',
}

export const dynamic = 'force-dynamic'

/**
 * The PUBLIC add-on landing (marketing / rubric / pricing). Renders without login — it is added
 * to the middleware's isAcademyPublic allowlist. Phase 0 ships the honest shell; the full hero,
 * rubric explainer, and pricing toggle land in Phase 4 alongside real Stripe prices. Until the
 * gate is enabled, enrollment is not open and we say so — no fake "Buy now".
 */
export default function InterviewMasteryPage() {
  const open = isInterviewGateEnabled()
  return (
    <InterviewShell active="mastery" backHref="/academy">
      <EmptyState
        kicker="Interview Mastery · add-on"
        title="Turn interview prep into a measured, converging loop."
        line="Run mock interviews with Marlowe, get a committee verdict scored against the bar for your target level, and attack your weakest dimension first — no flattery, just reps that move the number."
        ctas={
          open
            ? [
                { href: '/academy/interview/checkout', label: 'Add Interview Mastery' },
                { href: '/academy/interview', label: 'Open the cockpit', kind: 'ghost' },
              ]
            : [{ href: '/academy', label: '← Back to Sage Academy', kind: 'ghost' }]
        }
      />
      {!open ? (
        <div style={{ textAlign: 'center' }}>
          <span className={styles.notice}>Enrollment opens soon — the add-on isn&rsquo;t purchasable yet.</span>
        </div>
      ) : null}
    </InterviewShell>
  )
}
