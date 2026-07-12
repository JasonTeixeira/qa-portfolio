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
import { buildBreadcrumbList } from '@/lib/seo/jsonld'
import { getPublicAuditReport } from '@/lib/seo-audit/reports'

type Props = {
  params: Promise<{ id: string }>
}

const SITE = 'https://www.sageideas.dev'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const report = await getPublicAuditReport(id)
  if (!report) return {}

  const title = `${report.host} SEO audit score: ${report.score}/100`
  const description = `Public Sage Ideas SEO audit report for ${report.host}. Score: ${report.score}/100 with prioritized technical SEO checks.`

  return {
    title,
    description,
    alternates: { canonical: `${SITE}/tools/seo-audit/r/${report.share_id}` },
    openGraph: {
      title,
      description,
      url: `${SITE}/tools/seo-audit/r/${report.share_id}`,
      images: [
        `/og?title=${encodeURIComponent(`${report.host}: ${report.score}/100`)}&subtitle=${encodeURIComponent('Public SEO audit report')}`,
      ],
    },
  }
}

export default async function PublicAuditReportPage({ params }: Props) {
  const { id } = await params
  const report = await getPublicAuditReport(id)
  if (!report) notFound()

  const failed = Object.values(report.report.checks).filter((check) => !check.pass)
  const passed = Object.values(report.report.checks).filter((check) => check.pass)
  const pageUrl = `${SITE}/tools/seo-audit/r/${report.share_id}`

  return (
    <LivingPageShell>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: `${report.host} SEO audit score: ${report.score}/100`,
            description: `Public technical SEO audit report for ${report.host}.`,
            datePublished: report.created_at,
            dateModified: report.created_at,
            author: { '@type': 'Person', name: 'Jason Teixeira', url: `${SITE}/founder` },
            publisher: { '@type': 'Organization', name: 'Sage Ideas', url: SITE },
            mainEntityOfPage: pageUrl,
          },
          buildBreadcrumbList([
            { name: 'Home', url: SITE },
            { name: 'SEO audit', url: `${SITE}/tools/seo-audit` },
            { name: report.host, url: pageUrl },
          ]),
        ]}
      />
      <LivingHero
        eyebrow="Public SEO audit"
        title={<>{report.host} scored {report.score}/100.</>}
        lede={`A public, shareable technical SEO report for ${report.url}. Email addresses are never published on report pages.`}
        primaryCta={{ label: 'Run your own audit', href: '/tools/seo-audit' }}
        secondaryCta={{ label: 'Book a fix sprint', href: '/book?context=seo-audit-report' }}
        proof={[
          { label: 'score', value: `${report.score}/100` },
          { label: 'passed', value: String(passed.length) },
          { label: 'fixes', value: String(failed.length) },
          { label: 'email public', value: 'never' },
        ]}
        panel={
          <SystemHeroPanel
            eyebrow="Report graph"
            title="Technical SEO report architecture"
            nodes={['Crawl', 'Meta', 'Schema', 'Speed']}
            stats={[
              { label: 'host', value: report.host },
              { label: 'badge', value: 'SVG' },
              { label: 'index', value: 'public' },
            ]}
          />
        }
      />

      <LivingSection
        eyebrow="priority fixes"
        title={failed.length ? 'Fix these first.' : 'No critical on-page failures found.'}
        lede="The report sorts checks by practical impact. A higher score is useful only when it maps to fewer crawl, preview, and conversion leaks."
      >
        <div className="grid gap-px bg-[var(--sage-border)] md:grid-cols-2">
          {(failed.length ? failed : passed).map((check) => (
            <article className="bg-[rgba(20,20,24,0.74)] p-5" key={check.label}>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                weight {check.weight}
              </p>
              <h2 className="mt-5 text-xl font-semibold text-[var(--sage-ink)]">{check.label}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--sage-ink-muted)]">{check.detail}</p>
            </article>
          ))}
        </div>
      </LivingSection>

      <LivingSection eyebrow="backlink badge" title="Embed the audit badge.">
        <div className="grid gap-6 border border-[var(--sage-border-strong)] bg-[rgba(20,20,24,0.74)] p-6 lg:grid-cols-[1fr_1fr]">
          <div>
            <img
              alt={`SEO audit badge for ${report.host}`}
              className="h-auto max-w-full"
              src={`/api/badge/${report.share_id}`}
            />
          </div>
          <pre className="overflow-x-auto bg-[var(--sage-bg)] p-4 font-mono text-xs leading-6 text-[var(--sage-ink-muted)]">
{`<a href="${pageUrl}">
  <img src="${SITE}/api/badge/${report.share_id}" alt="SEO audit by Sage Ideas" />
</a>`}
          </pre>
        </div>
      </LivingSection>

      <LivingSection eyebrow="how to use this" title="Turn the score into a fix sequence.">
        <ConversionMap
          steps={[
            { label: 'Fix indexability', detail: 'Canonical, metadata, schema, and crawl blockers come before content expansion.' },
            { label: 'Tighten previews', detail: 'Open Graph and social cards improve click confidence when the page is shared.' },
            { label: 'Improve performance', detail: 'Use PageSpeed and Core Web Vitals to prioritize LCP, CLS, and blocking scripts.' },
            { label: 'Ship proof', detail: 'Rerun the audit and keep the public report as a visible before/after artifact.' },
          ]}
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <LivingCTA href="/tools/seo-audit">Run another audit</LivingCTA>
          <LivingCTA href="/book?context=seo-audit-report" variant="secondary">Book a fix sprint</LivingCTA>
        </div>
      </LivingSection>
    </LivingPageShell>
  )
}
