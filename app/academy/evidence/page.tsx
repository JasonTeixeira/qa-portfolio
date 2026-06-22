import type { Metadata } from 'next'
import { getEvidence } from '@/lib/academy/evidence'
import { EvidenceLedger } from '@/components/academy/evidence/EvidenceLedger'

export const metadata: Metadata = {
  title: 'Proof of Work — Sage Academy',
  robots: { index: false, follow: false },
}

export default async function EvidencePage() {
  const data = await getEvidence()
  return <EvidenceLedger data={data} />
}
