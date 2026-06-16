const SITE = 'https://www.sageideas.dev'

export type LdObject = Record<string, unknown>
export type BreadcrumbItem = { name: string; url: string }

const publisher = {
  '@type': 'Organization',
  name: 'Sage Ideas LLC',
  url: SITE,
  logo: `${SITE}/brand/sage-mark.svg`,
}

const author = {
  '@type': 'Person',
  name: 'Jason Teixeira',
  url: `${SITE}/founder`,
}

export function buildWebSite(): LdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sage Ideas',
    url: SITE,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/blog?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildOrganization(): LdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sage Ideas',
    legalName: 'Sage Ideas LLC',
    url: SITE,
    logo: `${SITE}/brand/sage-mark.svg`,
    description:
      'Solo AI-native studio for AI systems, applications, SaaS, brand, web, growth, and SEO.',
    founder: author,
    foundingDate: '2020',
    email: 'sage@sageideas.dev',
    sameAs: ['https://github.com/JasonTeixeira', 'https://linkedin.com/in/jason-teixeira'],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Orlando',
      addressRegion: 'FL',
      addressCountry: 'US',
    },
    knowsAbout: [
      'AI Automation',
      'Full-Stack Development',
      'Cloud Infrastructure',
      'Programmatic SEO',
      'Next.js Engineering',
    ],
  }
}

export function buildPerson(): LdObject {
  return {
    '@context': 'https://schema.org',
    ...author,
    jobTitle: 'Founder, AI engineer, and application builder',
    worksFor: publisher,
    sameAs: ['https://github.com/JasonTeixeira', 'https://linkedin.com/in/jason-teixeira'],
    knowsAbout: ['AI Automation', 'Software Engineering', 'Programmatic SEO', 'Fintech Systems'],
  }
}

export function buildBreadcrumbList(items: BreadcrumbItem[]): LdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function buildArticle(args: {
  headline: string
  description: string
  datePublished: string
  dateModified?: string
  url: string
  imageUrl?: string
  keywords?: string[]
  articleSection?: string
}): LdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: args.headline,
    description: args.description,
    datePublished: args.datePublished,
    dateModified: args.dateModified ?? args.datePublished,
    url: args.url,
    mainEntityOfPage: args.url,
    author,
    publisher,
    ...(args.imageUrl ? { image: args.imageUrl } : {}),
    ...(args.keywords?.length ? { keywords: args.keywords.join(', ') } : {}),
    ...(args.articleSection ? { articleSection: args.articleSection } : {}),
  }
}

export function buildCollectionPage(args: {
  name: string
  description: string
  url: string
  itemUrls: string[]
}): LdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: args.name,
    description: args.description,
    url: args.url,
    publisher,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: args.itemUrls.map((url, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url,
      })),
    },
  }
}

export function buildService(args: {
  name: string
  description: string
  url: string
  serviceType: string
  priceCents?: number
  cadence?: 'one-time' | 'monthly' | 'custom'
}): LdObject {
  const hasPrice = typeof args.priceCents === 'number' && args.priceCents > 0
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: args.name,
    description: args.description,
    url: args.url,
    serviceType: args.serviceType,
    provider: publisher,
    areaServed: { '@type': 'Place', name: 'Worldwide' },
    offers: {
      '@type': 'Offer',
      url: args.url,
      priceCurrency: 'USD',
      ...(hasPrice ? { price: (args.priceCents! / 100).toFixed(0) } : {}),
      availability: 'https://schema.org/InStock',
      category: args.cadence ?? 'custom',
    },
  }
}
