import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAdminUser } from '@/lib/academy/admin'
import { getAcademyMetrics } from '@/lib/academy/metrics'
import { MetricsDashboard } from '@/components/academy-admin/MetricsDashboard'

export const metadata: Metadata = {
  title: 'Measurement — Sage Academy',
  robots: { index: false, follow: false },
}

export default async function MetricsPage() {
  const admin = await getAdminUser()
  if (!admin) notFound()
  const metrics = await getAcademyMetrics()
  return <MetricsDashboard metrics={metrics} />
}
