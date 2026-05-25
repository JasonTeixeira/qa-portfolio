import type { Metadata } from 'next'
import { tiersOrdered, careTiers } from '@/data/services/tiers'
import { extendedTiers } from '@/data/services/extended'
import { pricingFaq } from '@/data/services/pricing-faq'
import V0PricingPage from '@/components/v0-pricing/pricing-page'
import { ExtendedPricingMenu } from './extended-pricing-menu'
import { QuoteCalculator } from '@/components/pricing/quote-calculator'
import { AsciiRule } from '@/components/sage'
import { JsonLd } from '@/components/json-ld'
import { PageViewTracker } from '@/components/analytics/page-view-tracker'

const SITE = 'https://www.sageideas.dev'

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: pricingFaq.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
    { '@type': 'ListItem', position: 2, name: 'Pricing', item: `${SITE}/pricing` },
  ],
}

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Full pricing menu from Sage Ideas: productized engineering and QA tiers, AI reliability audits, RAG and agent ops, automation pipelines, customer-facing AI products, productized retainers, diagnostic on-ramps from $1,200, and a 90-day Done-For-You bundle. Fixed scope, transparent pricing.',
  alternates: { canonical: `${SITE}/pricing` },
  openGraph: {
    title: 'Pricing',
    description: 'Engineering, QA, AI, automation, retainers, and bundles. Fixed price.',
    images: [{ url: '/og?title=Pricing&subtitle=Engineering%2C+AI%2C+automation%2C+retainers.' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og?title=Pricing&subtitle=Engineering%2C+AI%2C+automation%2C+retainers.'],
  },
}

export default function PricingPage() {
  return (
    <>
      <JsonLd data={[faqSchema, breadcrumbSchema]} />
      <PageViewTracker event="pricing_view" />
      <V0PricingPage heroImageSrc="/images/hero-pricing.jpg" />

      {/* Phase 9 — interactive terminal-style quote calculator */}
      <section className="relative bg-[#09090B] border-t border-[#2A2826] py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AsciiRule label="// scope_estimator" tone="cyan" className="mb-6" />
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-10">
            <div className="max-w-2xl">
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#F4F2EF]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Skip the spreadsheet. <span className="italic text-[#0ED3CF]">Build your quote here.</span>
              </h2>
              <p className="text-[#B8B0AB] mt-4 text-lg">
                Click your way to a real estimate. The number you see is the number we&apos;ll write into the contract.
                If your scope changes mid-flight, the kill switch refunds the unspent half.
              </p>
            </div>
          </div>
          <QuoteCalculator />
        </div>
      </section>

      <ExtendedPricingMenu extended={extendedTiers} care={careTiers} />
    </>
  )
}
