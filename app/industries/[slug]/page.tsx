import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { verticals, verticalsBySlug } from '@/data/industries/verticals'
import { IndustryPageContent } from './industry-page-content'

type Params = { slug: string }

const SITE = 'https://www.sageideas.dev'

export function generateStaticParams(): Params[] {
  return verticals.map((v) => ({ slug: v.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const v = verticalsBySlug[slug]
  if (!v) return { title: 'Not Found' }

  const title = `${v.name} — Sage Ideas`
  const description = v.intro.length > 160 ? v.intro.slice(0, 157) + '…' : v.intro
  const ogTitle = encodeURIComponent(v.name)
  const ogSubtitle = encodeURIComponent(v.tagline)

  return {
    title,
    description,
    keywords: v.keywords,
    alternates: { canonical: `${SITE}/industries/${v.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE}/industries/${v.slug}`,
      images: [{ url: `/og?title=${ogTitle}&subtitle=${ogSubtitle}` }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`/og?title=${ogTitle}&subtitle=${ogSubtitle}`],
    },
  }
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const v = verticalsBySlug[slug]
  if (!v) notFound()

  // FAQPage JSON-LD
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: v.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <IndustryPageContent vertical={v} />
    </>
  )
}
