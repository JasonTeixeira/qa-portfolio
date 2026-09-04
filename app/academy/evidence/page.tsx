import type { Metadata } from 'next'
import { getEvidence } from '@/lib/academy/evidence'
import { EvidenceLedger } from '@/components/academy/evidence/EvidenceLedger'
import { AcademyShell } from '@/components/academy/academy-shell'
import { GroupSubNav } from '@/components/academy/shell/GroupSubNav'
import { getT } from '@/lib/i18n/t'
import { getLocale } from '@/lib/i18n/server'
import { localizedAlternates } from '@/lib/i18n/alternates'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  const locale = await getLocale()
  return {
    title: t('Proof of Work — Sage Academy'),
    alternates: localizedAlternates('/academy/evidence', locale),
    robots: { index: false, follow: false },
  }
}

export default async function EvidencePage() {
  const data = await getEvidence()
  return (
    <AcademyShell active="profile">
      <GroupSubNav group="progress" tab="certificates" />
      <EvidenceLedger data={data} />
    </AcademyShell>
  )
}
