import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAdminUser } from '@/lib/academy/admin'
import { listExperimentReadouts } from '@/lib/academy/experiments'
import { ExperimentsPanel } from '@/components/academy-admin/ExperimentsPanel'

export const metadata: Metadata = {
  title: 'Experiments — Sage Academy',
  robots: { index: false, follow: false },
}

export default async function ExperimentsPage() {
  const admin = await getAdminUser()
  if (!admin) notFound()
  const readouts = await listExperimentReadouts()
  return <ExperimentsPanel readouts={readouts} />
}
