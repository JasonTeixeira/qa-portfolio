import type { Metadata } from 'next'
import { getLearnerDashboard } from '@/lib/academy/learner'
import { Dashboard } from '@/components/academy/dashboard/Dashboard'
import { AcademyShell } from '@/components/academy/academy-shell'

export const metadata: Metadata = {
  title: 'My Learning — Sage Academy',
  robots: { index: false, follow: false },
}

export default async function DashboardPage() {
  const dash = await getLearnerDashboard()
  return (
    <AcademyShell active="dashboard" signedIn={dash.signedIn}>
      <Dashboard dash={dash} />
    </AcademyShell>
  )
}
