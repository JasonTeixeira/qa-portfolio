import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'
import { GlowCard } from '@/components/glow-card'
import { caseStudies } from '@/data/work/case-studies'
import { CaseStudyContent } from './case-study-content'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return caseStudies.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const study = caseStudies.find((s) => s.slug === slug)
  if (!study) return {}

  const ogTitle = encodeURIComponent(study.title)
  const ogSubtitle = encodeURIComponent(study.kicker)

  return {
    title: `${study.title} — Sage Ideas`,
    description: study.tagline,
    openGraph: {
      title: `${study.title} — Sage Ideas`,
      description: study.tagline,
      images: [`/og?title=${ogTitle}&subtitle=${ogSubtitle}`],
    },
  }
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params
  const study = caseStudies.find((s) => s.slug === slug)
  if (!study) notFound()

  return <CaseStudyContent study={study} />
}
