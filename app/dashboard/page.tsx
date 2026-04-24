import type { Metadata } from 'next';
import QualityDashboardClient from './quality-dashboard-client';

export const metadata: Metadata = {
  title: 'Quality Dashboard | Jason Teixeira',
  description:
    'Live-style quality telemetry: build health, test trends, performance budgets, and security posture across projects.',
};

export default function DashboardPage() {
  return <QualityDashboardClient />;
}
