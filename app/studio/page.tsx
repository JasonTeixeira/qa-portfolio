import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Code2, Cpu, Users } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'
import { GlowCard } from '@/components/glow-card'
import { MetricCounter } from '@/components/metric-counter'
import { Button } from '@/components/ui/button'
import { StudioAnimations } from './studio-animations'

export const metadata: Metadata = {
  title: 'Studio — Sage Ideas',
  description: 'Sage Ideas is an AI-native software studio founded by Jason Teixeira in Orlando, FL. Two degrees, nine certifications, five years in fintech, and six live products.',
  openGraph: {
    images: ['/og?title=The+Studio&subtitle=Built+on+purpose.'],
  },
}

const pillars = [
  {
    icon: Code2,
    title: 'We build what we operate',
    description:
      'Every service offering at Sage Ideas is something we use ourselves. The infrastructure patterns we sell are the same ones running our own products. The AI workflows we build for clients are the same ones powering our lab. We don\'t pitch theory — we ship proof.',
    accent: 'cyan' as const,
  },
  {
    icon: Cpu,
    title: 'AI-native by default',
    description:
      'We don\'t bolt AI onto existing workflows. We design systems where AI acceleration is assumed from day one — in code generation, in testing, in content pipelines, in customer-facing features. This isn\'t a trend we adopted; it\'s how we\'ve built since 2024.',
    accent: 'cyan' as const,
  },
  {
    icon: Users,
    title: 'Senior solo, agency rigor',
    description:
      'One person with senior judgment, running a production-grade process: CI/CD gates, contract testing, Lighthouse budgets, accessibility audits, security scans, idempotent webhooks, RLS policies, SOC2-aware architecture. The output is indistinguishable from a five-person agency, shipped on a solo timeline.',
    accent: 'cyan' as const,
  },
]

const nonServices = [
  'Enterprise sales engagements (six-month procurement cycles, vendor panels)',
  'Agencies-of-agencies (no subcontracting the work to another team)',
  'Design-only engagements (brand decks, mockups without implementation)',
  'Native mobile-first builds (iOS/Android apps as the primary deliverable)',
  'Support-only retainers (helpdesk, ticketing, on-call without a build component)',
]

const metrics = [
  { value: '6', label: 'Live Products' },
  { value: '106', label: 'GitHub Repos' },
  { value: '1,438', label: 'Commits / Year' },
  { value: '9', label: 'Active Certs' },
]

export default function StudioPage() {
  return (
    <div className="min-h-screen bg-[#09090B]">
      <StudioAnimations pillars={pillars} nonServices={nonServices} metrics={metrics} />
    </div>
  )
}
