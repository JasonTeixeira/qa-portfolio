import type { Metadata } from 'next'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { EmptyState } from '@/components/academy/interview/EmptyState'
import { isInterviewGateEnabled } from '@/lib/academy/interview-access'
import { getT } from '@/lib/i18n/t'
import { getLocale } from '@/lib/i18n/server'
import { localizedAlternates } from '@/lib/i18n/alternates'
import styles from '@/components/academy/interview/interview.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  const locale = await getLocale()
  return {
    title: `Interview Mastery — ${t('measured mock interviews with Marlowe')}`,
    description: t(
      'A paid Sage Academy add-on: run mock interviews with an AI committee, get an honest readiness score against the bar for your target level, and drill your weakest dimension first.'
    ),
    alternates: localizedAlternates('/academy/interview/mastery', locale),
  }
}

export const dynamic = 'force-dynamic'

/**
 * The PUBLIC add-on landing (marketing / rubric / pricing). Renders without login — it is added
 * to the middleware's isAcademyPublic allowlist. Phase 0 ships the honest shell; the full hero,
 * rubric explainer, and pricing toggle land in Phase 4 alongside real Stripe prices. Until the
 * gate is enabled, enrollment is not open and we say so — no fake "Buy now".
 */
export default async function InterviewMasteryPage() {
  const t = await getT()
  const open = isInterviewGateEnabled()
  return (
    <InterviewShell active="mastery" backHref="/academy">
      <EmptyState
        kicker={`Interview Mastery · ${t('add-on')}`}
        title={t('Turn interview prep into a measured, converging loop.')}
        line={t(
          'Run mock interviews with Marlowe, get a committee verdict scored against the bar for your target level, and attack your weakest dimension first — no flattery, just reps that move the number.'
        )}
        ctas={
          open
            ? [
                { href: '/academy/interview/checkout', label: `${t('Add')} Interview Mastery` },
                { href: '/academy/interview', label: t('Open the cockpit'), kind: 'ghost' },
              ]
            : [{ href: '/academy', label: `← ${t('Back to')} Sage Academy`, kind: 'ghost' }]
        }
      />
      {!open ? (
        <div style={{ textAlign: 'center' }}>
          <span className={styles.notice}>{t('Enrollment opens soon — the add-on isn’t purchasable yet.')}</span>
        </div>
      ) : null}
    </InterviewShell>
  )
}
