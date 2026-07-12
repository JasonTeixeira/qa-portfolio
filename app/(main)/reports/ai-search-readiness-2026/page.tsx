import type { Metadata } from 'next'
import { JsonLd } from '@/components/json-ld'
import {
  ConversionMap,
  LivingHero,
  LivingPageShell,
  LivingSection,
  SystemHeroPanel,
} from '@/components/living/LivingPageSystem'
import { buildBreadcrumbList } from '@/lib/seo/jsonld'
import { clusterList } from '@/data/content/clusters'
import { keywordMap } from '@/data/seo/keyword-map'

const SITE = 'https://www.sageideas.dev'

export const metadata: Metadata = {
  title: 'AI Search Readiness Report 2026',
  description:
    'A public Sage Ideas report on AI search readiness: content clusters, technical SEO, proof assets, and conversion paths for B2B operators.',
  alternates: { canonical: `${SITE}/reports/ai-search-readiness-2026` },
  openGraph: {
    title: 'AI Search Readiness Report 2026 — Sage Ideas',
    description:
      'A practical report on how B2B operators should structure content, proof, and technical SEO for AI search.',
    url: `${SITE}/reports/ai-search-readiness-2026`,
    images: ['/og?title=AI+Search+Readiness+Report&subtitle=2026+B2B+operators'],
  },
}

const findings = [
  {
    title: 'Search pages need proof, not just prose.',
    body: 'AI answer engines and human buyers both reward pages that expose real examples, structured data, source links, and clear authorship.',
  },
  {
    title: 'Service pages should be routed by industry context.',
    body: 'The same service has different objections in fintech, SaaS, healthcare, ecommerce, and education. Thin generic pages leave demand uncaptured.',
  },
  {
    title: 'Lead magnets should create public artifacts.',
    body: 'A private report captures a lead once. A shareable report plus badge can create crawlable proof and backlink opportunities.',
  },
  {
    title: 'Content hubs need money-page routing.',
    body: 'Every article cluster should route toward a relevant service, academy track, template, or tool. Traffic without a next step is just pageviews.',
  },
]

export default function AiSearchReadinessReportPage() {
  const assignedUrls = new Set(keywordMap.map((entry) => entry.assignedUrl))
  const reportUrl = `${SITE}/reports/ai-search-readiness-2026`

  return (
    <LivingPageShell>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Dataset',
            name: 'Sage Ideas AI Search Readiness Report 2026',
            description: metadata.description,
            url: reportUrl,
            creator: { '@type': 'Organization', name: 'Sage Ideas', url: SITE },
            datePublished: '2026-06-17',
            keywords: ['AI search readiness', 'technical SEO', 'B2B content strategy'],
          },
          buildBreadcrumbList([
            { name: 'Home', url: SITE },
            { name: 'Reports', url: `${SITE}/reports/ai-search-readiness-2026` },
            { name: 'AI Search Readiness 2026', url: reportUrl },
          ]),
        ]}
      />
      <LivingHero
        eyebrow="Original report · 2026"
        title={<>AI search readiness is a systems problem.</>}
        lede="This report turns the current Sage Ideas acquisition system into a public model: keyword routing, content hubs, proof pages, shareable audits, and conversion paths."
        primaryCta={{ label: 'Run the SEO audit', href: '/tools/seo-audit' }}
        secondaryCta={{ label: 'Read topic hubs', href: '/topics' }}
        proof={[
          { label: 'clusters', value: String(clusterList.length) },
          { label: 'mapped URLs', value: String(assignedUrls.size) },
          { label: 'keyword entries', value: String(keywordMap.length) },
          { label: 'source', value: 'repo' },
        ]}
        panel={
          <SystemHeroPanel
            eyebrow="Report model"
            title="AI search readiness architecture"
            nodes={['Intent', 'Proof', 'Schema', 'Conversion']}
            stats={[
              { label: 'crawl', value: 'public' },
              { label: 'schema', value: 'dataset' },
              { label: 'claims', value: 'repo' },
            ]}
          />
        }
      />

      <LivingSection
        eyebrow="findings"
        title="Four patterns to build around."
        lede="These are operating principles for Sage Ideas and for clients who want content to become revenue infrastructure."
      >
        <div className="grid gap-px bg-[var(--sage-border)] md:grid-cols-2">
          {findings.map((finding, index) => (
            <article className="min-h-[230px] bg-[rgba(20,20,24,0.74)] p-6" key={finding.title}>
              <p className="font-mono text-xs text-[var(--sage-accent-readable)]">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h2 className="mt-8 text-2xl font-semibold text-[var(--sage-ink)]">{finding.title}</h2>
              <p className="mt-4 text-sm leading-7 text-[var(--sage-ink-muted)]">{finding.body}</p>
            </article>
          ))}
        </div>
      </LivingSection>

      <LivingSection
        eyebrow="operating sequence"
        title="How this becomes a growth loop."
        lede="The goal is not a report for its own sake. The report exists to create a repeatable path from search demand to proof to booked calls."
      >
        <ConversionMap
          steps={[
            { label: 'Map intent', detail: 'Every target query gets a cluster, URL, and conversion route.' },
            { label: 'Publish proof', detail: 'Case studies, audit reports, and public receipts support the claim.' },
            { label: 'Distribute', detail: 'Each asset turns into short posts, outreach hooks, and internal links.' },
            { label: 'Measure', detail: 'GA4, GSC, PostHog, and lead metadata show what moved revenue.' },
          ]}
        />
      </LivingSection>
    </LivingPageShell>
  )
}
