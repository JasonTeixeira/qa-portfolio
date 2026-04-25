import type { Metadata } from 'next'
import { PlatformContent } from './platform-content'

export const metadata: Metadata = {
  title: 'Platform Engineering | Jason Teixeira — CI/CD, IaC, SLOs, Security',
  description: 'How I build and operate automation platforms: CI/CD pipelines, infrastructure-as-code, quality telemetry, performance budgets, security gates, and incident response with SLO targets.',
  openGraph: {
    title: 'Platform Engineering — Jason Teixeira',
    description: 'CI/CD, IaC, SLOs, security receipts, and incident drills. How I operate systems, not just build them.',
  },
}

export default function PlatformPage() {
  return <PlatformContent />
}
