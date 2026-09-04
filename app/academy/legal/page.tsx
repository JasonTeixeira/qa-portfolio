import type { Metadata } from 'next'
import { LegalDocViewer } from './LegalDocViewer'
import { getT } from '@/lib/i18n/t'
import { getLocale } from '@/lib/i18n/server'
import { localizedAlternates } from '@/lib/i18n/alternates'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  const locale = await getLocale()
  return {
    title: t('Legal — Sage Academy'),
    description: t(
      'Sage Academy terms of service, privacy, and refund policy — with plain-language summaries above the binding text.',
    ),
    alternates: localizedAlternates('/academy/legal', locale),
    robots: { index: false, follow: false },
  }
}

export default function AcademyLegalPage() {
  return <LegalDocViewer />
}
