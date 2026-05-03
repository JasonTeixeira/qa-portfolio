import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Mail, FileText, Github, CheckCircle2, Building2, GraduationCap, Award } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'
import { GlowCard } from '@/components/glow-card'
import { Button } from '@/components/ui/button'
import { FounderAnimations } from './founder-animations'

export const metadata: Metadata = {
  title: 'Founder — Jason Teixeira | Sage Ideas',
  description: 'Jason Teixeira — fintech engineer, studio founder, full-stack practitioner. Five years at HighStrike. Nine certifications. Open to select senior IC and staff-level roles.',
  openGraph: {
    images: ['/og?title=For+Hiring+Managers&subtitle=The+person+behind+the+studio.'],
  },
}

const capabilities = [
  'Full-stack TypeScript (Next.js, React, Node.js) and Python (FastAPI, data pipelines, ML)',
  'Production systems design: data modeling, API architecture, real-time systems, billing integrations',
  'Infrastructure as Code: Terraform on AWS, GitHub OIDC, CI/CD pipeline design',
  'Quality engineering: test strategy, framework selection, CI gate design — 13 frameworks deployed',
  'AI-native product development: LLM integration, ML feature engineering, automation pipelines',
  'Technical leadership: architecture review, code review, engineering culture, hiring calibration',
  'Domain depth in fintech, developer tooling, trades tech, and edtech',
]

const roleParams = [
  'Senior IC (Staff / Principal) or technical leadership — not mid-level',
  'AI-forward team where LLMs are infrastructure, not a pitch deck bullet',
  'Meaningful equity participation — real skin in the game',
  'Transparent compensation: range shared upfront, no range-reveal games',
  'Remote-first required — based in Orlando, FL',
  'Compatible with Sage Ideas continuing as a side operation (I\'ll be direct about this)',
]

export default function FounderPage() {
  return (
    <div className="min-h-screen bg-[#09090B]">
      <FounderAnimations capabilities={capabilities} roleParams={roleParams} />
    </div>
  )
}
