import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'
import { GlowCard } from '@/components/glow-card'
import { caseStudies } from '@/data/work/case-studies'
import { CaseStudyContent } from './case-study-content'
import { JsonLd } from '@/components/json-ld'
import { StickyCta } from '@/components/sticky-cta'

const SITE = 'https://www.sageideas.dev'

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
    title: study.title,
    description: study.tagline,
    alternates: {
      canonical: `${SITE}/work/${study.slug}`,
    },
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

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Work', item: `${SITE}/work` },
      {
        '@type': 'ListItem',
        position: 3,
        name: study.title,
        item: `${SITE}/work/${study.slug}`,
      },
    ],
  }

  const creativeWorkSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: study.title,
    headline: study.title,
    description: study.tagline,
    url: `${SITE}/work/${study.slug}`,
    creator: {
      '@type': 'Organization',
      name: 'Sage Ideas LLC',
      url: SITE,
    },
  }

  return (
    <>
      <JsonLd data={[breadcrumbSchema, creativeWorkSchema]} />
      <CaseStudyContent study={study} />
      <StickyCta
        pitch="Want to build something like this?"
        ctaLabel="Book a 30-min call"
        ctaHref="/contact"
      />
    </>
  )
}
