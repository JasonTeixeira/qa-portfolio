import type { Metadata } from 'next'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { EmptyState } from '@/components/academy/interview/EmptyState'
import { getT } from '@/lib/i18n/t'
import { getLocale } from '@/lib/i18n/server'
import { localizedAlternates } from '@/lib/i18n/alternates'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  const locale = await getLocale()
  return {
    title: `${t('Offer')} — Interview Mastery`,
    alternates: localizedAlternates('/academy/interview/offer', locale),
    robots: { index: false, follow: false },
  }
}

export const dynamic = 'force-dynamic'

/**
 * The win recap — the END-OF-JOURNEY celebration when a member LANDS a job (not the sales offer).
 * It recaps the climb, opens the negotiation rehearsal, and triggers the auto-pause of billing 30
 * days out. Phase 0 ships the honest shell; the recap + auto-pause land in Phase 4, and it only
 * appears once an offer is logged in the pipeline.
 */
export default async function InterviewOfferPage() {
  const t = await getT()
  return (
    <InterviewShell active={null} backHref="/academy/interview">
      <EmptyState
        kicker={t('Win recap')}
        title={t('This page lights up the day you land the offer.')}
        line={t(
          'When you log an offer, Interview Mastery recaps your climb, rehearses the negotiation, and quietly schedules your billing to pause 30 days out — because the point was always to stop needing it.'
        )}
        ctas={[{ href: '/academy/interview', label: t('Go to the cockpit') }]}
      />
    </InterviewShell>
  )
}
