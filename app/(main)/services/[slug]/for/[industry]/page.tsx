import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/json-ld'
import {
  ConversionMap,
  LivingCTA,
  LivingHero,
  LivingPageShell,
  LivingSection,
  SystemHeroPanel,
} from '@/components/living/LivingPageSystem'
import { buildBreadcrumbList, buildService } from '@/lib/seo/jsonld'
import { getServiceIndustryPage, getServiceIndustryPages } from '@/lib/seo/service-industry-pages'

type Props = {
  params: Promise<{ slug: string; industry: string }>
}

const SITE = 'https://www.sageideas.dev'

export function generateStaticParams() {
  return getServiceIndustryPages().map((page) => ({
    slug: page.slug,
    industry: page.industrySlug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, industry } = await params
  const page = getServiceIndustryPage(slug, industry)
  if (!page) return {}

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `${SITE}${page.path}` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${SITE}${page.path}`,
      images: [
        `/og?title=${encodeURIComponent(page.h1)}&subtitle=${encodeURIComponent(page.industry.tagline)}`,
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      images: [`/og?title=${encodeURIComponent(page.h1)}&subtitle=${encodeURIComponent(page.industry.tagline)}`],
    },
  }
}

export default async function ServiceIndustryPage({ params }: Props) {
  const { slug, industry } = await params
  const page = getServiceIndustryPage(slug, industry)
  if (!page) notFound()

  const serviceUrl = `${SITE}${page.path}`
  const serviceMode = 'mode' in page.service ? page.service.mode : 'operate'
  const serviceCta = 'cta' in page.service ? page.service.cta : `Start ${page.service.shortName}`
  const serviceTimeline = 'timeline' in page.service ? page.service.timeline : 'Monthly'

  return (
    <LivingPageShell>
      <JsonLd
        data={[
          buildService({
            name: page.h1,
            description: page.description,
            url: serviceUrl,
            serviceType: `${page.service.name} for ${page.industry.name}`,
            priceCents: page.service.priceCents,
            cadence: page.service.cadence,
          }),
          buildBreadcrumbList([
            { name: 'Home', url: SITE },
            { name: 'Services', url: `${SITE}/services` },
            { name: page.service.shortName, url: `${SITE}/services/${page.service.slug}` },
            { name: page.industry.shortName, url: serviceUrl },
          ]),
        ]}
      />

      <LivingHero
        eyebrow={`${page.industry.shortName} · ${serviceMode}`}
        title={page.h1}
        lede={page.description}
        primaryCta={{ label: serviceCta, href: page.service.ctaHref }}
        secondaryCta={{ label: `See ${page.industry.shortName}`, href: `/industries/${page.industry.slug}` }}
        proof={page.proof}
        panel={
          <SystemHeroPanel
            eyebrow="Search intent map"
            title={`${page.service.shortName} and ${page.industry.shortName} service system`}
            nodes={['Intent', 'Proof', 'Offer', 'Call']}
            stats={[
              { label: 'price', value: page.service.price },
              { label: 'scope', value: serviceMode },
              { label: 'route', value: 'SEO' },
            ]}
          />
        }
      />

      <LivingSection
        eyebrow="specific fit"
        title={`Built around ${page.industry.shortName} constraints.`}
        lede={page.industry.intro}
      >
        <div className="grid gap-px bg-[var(--sage-border)] lg:grid-cols-3">
          {page.sections.map((section) => (
            <article className="min-h-[260px] bg-[rgba(20,20,24,0.74)] p-6" key={section.title}>
              <h2 className="text-2xl font-semibold text-[var(--sage-ink)]">{section.title}</h2>
              <p className="mt-5 text-sm leading-7 text-[var(--sage-ink-muted)]">{section.body}</p>
            </article>
          ))}
        </div>
      </LivingSection>

      <LivingSection
        eyebrow="route to revenue"
        title="A programmatic page still needs a real next step."
        lede="Each page is unique to the service and industry pair, but the conversion path stays simple: qualify the problem, inspect proof, then book the right first move."
      >
        <ConversionMap
          steps={[
            { label: 'Search need', detail: `The buyer is looking for ${page.service.shortName.toLowerCase()} in a ${page.industry.shortName} context.` },
            { label: 'Specific proof', detail: page.industry.whyUs[0] ?? page.industry.tagline },
            { label: 'Scoped offer', detail: `${page.service.name}: ${serviceTimeline}, ${page.service.price}.` },
            { label: 'Conversion', detail: 'Move into checkout or booking depending on whether the offer is self-serve.' },
          ]}
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <LivingCTA href={page.service.ctaHref}>{serviceCta}</LivingCTA>
          <LivingCTA href="/book" variant="secondary">Book a fit call</LivingCTA>
        </div>
      </LivingSection>
    </LivingPageShell>
  )
}
