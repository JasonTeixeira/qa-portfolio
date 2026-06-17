import { verticals } from '@/data/industries/verticals'
import { careTiers, tiers, type CareTier, type Tier } from '@/data/services/tiers'

type ServiceTier = Tier | CareTier

export type ServiceIndustryPage = {
  service: ServiceTier
  industry: (typeof verticals)[number]
  slug: string
  industrySlug: string
  path: string
  title: string
  description: string
  h1: string
  proof: { label: string; value: string }[]
  sections: { title: string; body: string }[]
}

const allTiers: ServiceTier[] = [...tiers, ...careTiers]

function getTier(slug: string) {
  return allTiers.find((tier) => tier.slug === slug)
}

function hasFullTierScope(tier: ServiceTier): tier is Tier {
  return 'timeline' in tier && 'mode' in tier && 'deliverables' in tier
}

export function getServiceIndustryPages(): ServiceIndustryPage[] {
  const pages: ServiceIndustryPage[] = []

  for (const industry of verticals) {
    for (const tierSlug of industry.recommendedTiers) {
      const service = getTier(tierSlug)
      if (!service) continue

      const title = `${service.shortName} for ${industry.shortName} | Sage Ideas`
      const h1 = `${service.shortName} for ${industry.shortName}`
      const description = `${service.name} shaped for ${industry.name}: ${industry.tagline} ${
        hasFullTierScope(service) ? service.schemaSummary ?? service.description : service.description
      }`.slice(0, 210)
      const fullTier = hasFullTierScope(service)

      pages.push({
        service,
        industry,
        slug: service.slug,
        industrySlug: industry.slug,
        path: `/services/${service.slug}/for/${industry.slug}`,
        title,
        h1,
        description,
        proof: [
          { label: 'service', value: service.shortName },
          { label: 'industry', value: industry.shortName },
          { label: 'timeline', value: fullTier ? service.timeline : 'Monthly' },
          { label: 'mode', value: fullTier ? service.mode : 'operate' },
        ],
        sections: [
          {
            title: `Why ${industry.shortName} teams need this`,
            body: industry.challenges[0]?.description ?? industry.intro,
          },
          {
            title: 'What ships',
            body: (fullTier ? service.deliverables : service.outcomes).slice(0, 4).join(' '),
          },
          {
            title: 'What stays honest',
            body: fullTier && service.notIncluded.length
              ? `This route does not pretend the engagement includes ${service.notIncluded.join(', ').toLowerCase()}.`
              : 'The scope stays explicit before kickoff so the build does not drift.',
          },
        ],
      })
    }
  }

  return pages
}

export function getServiceIndustryPage(serviceSlug: string, industrySlug: string) {
  return getServiceIndustryPages().find(
    (page) => page.slug === serviceSlug && page.industrySlug === industrySlug,
  )
}
