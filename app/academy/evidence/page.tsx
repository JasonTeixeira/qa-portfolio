import type { Metadata } from 'next'
import { getEvidence } from '@/lib/academy/evidence'
import { EvidenceLedger } from '@/components/academy/evidence/EvidenceLedger'
import { AcademyShell } from '@/components/academy/academy-shell'
import { GroupSubNav } from '@/components/academy/shell/GroupSubNav'

export const metadata: Metadata = {
  title: 'Proof of Work — Sage Academy',
  robots: { index: false, follow: false },
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
