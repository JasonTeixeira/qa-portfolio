import type { Metadata } from 'next'
import { getLearnerDashboard } from '@/lib/academy/learner'
import { Dashboard } from '@/components/academy/dashboard/Dashboard'

export const metadata: Metadata = {
  title: 'My Learning — Sage Academy',
  robots: { index: false, follow: false },
}

export default async function DashboardPage() {
  const dash = await getLearnerDashboard()
  return <Dashboard dash={dash} />
}
