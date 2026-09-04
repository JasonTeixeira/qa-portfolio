import type { Metadata } from 'next'
import { ResourcesHub } from '@/components/academy/resources/ResourcesHub'
import { AcademyShell } from '@/components/academy/academy-shell'
import { getT } from '@/lib/i18n/t'
import { getLocale } from '@/lib/i18n/server'
import { localizedAlternates } from '@/lib/i18n/alternates'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  const locale = await getLocale()
  return {
    title: t('Tools & Resources — Sage Academy'),
    alternates: localizedAlternates('/academy/resources', locale),
    robots: { index: false, follow: false },
  }
}

export default function ResourcesPage() {
  return (
    <AcademyShell active="courses">
      <ResourcesHub />
    </AcademyShell>
  )
}
