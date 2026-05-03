import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { tiers, tiersBySlug } from '@/data/services/tiers'
import { TierPageContent } from './tier-page-content'

type Params = { slug: string }

export function generateStaticParams(): Params[] {
  return tiers.map((tier) => ({ slug: tier.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const tier = tiersBySlug[slug]
  if (!tier) return { title: 'Not Found' }

  const title = `${tier.name} — ${tier.price} | Sage Ideas`
  const description = tier.description
  const ogTitle = encodeURIComponent(tier.name)
  const ogSubtitle = encodeURIComponent(tier.tagline)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: `/og?title=${ogTitle}&subtitle=${ogSubtitle}` }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`/og?title=${ogTitle}&subtitle=${ogSubtitle}`],
    },
  }
}

export default async function TierPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const tier = tiersBySlug[slug]
  if (!tier) notFound()
  return <TierPageContent tier={tier} />
}
