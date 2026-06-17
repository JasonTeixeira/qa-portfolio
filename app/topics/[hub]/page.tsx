import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { clusterList, getClusterBySlug } from '@/data/content/clusters'
import { getBlogPostsByCluster } from '@/lib/blog-server'
import { JsonLd } from '@/components/json-ld'
import {
  ConversionMap,
  LivingCTA,
  LivingHero,
  LivingPageShell,
  LivingProofStrip,
  LivingSection,
  SystemHeroPanel,
} from '@/components/living/LivingPageSystem'
import { buildBreadcrumbList, buildCollectionPage } from '@/lib/seo/jsonld'

interface PageProps {
  params: Promise<{ hub: string }>
}

const SITE = 'https://www.sageideas.dev'

export function generateStaticParams() {
  return clusterList.map((cluster) => ({ hub: cluster.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hub } = await params
  const cluster = getClusterBySlug(hub)
  if (!cluster) return { title: 'Topic not found' }

  return {
    title: cluster.title,
    description: cluster.description,
    alternates: { canonical: `${SITE}/topics/${cluster.slug}` },
    openGraph: {
      title: cluster.title,
      description: cluster.description,
      url: `${SITE}/topics/${cluster.slug}`,
      type: 'website',
    },
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function TopicHubPage({ params }: PageProps) {
  const { hub } = await params
  const cluster = getClusterBySlug(hub)
  if (!cluster) notFound()

  const posts = getBlogPostsByCluster(cluster.key)
  const hubUrl = `${SITE}/topics/${cluster.slug}`

  return (
    <LivingPageShell>
      <JsonLd
        data={[
          buildCollectionPage({
            name: cluster.title,
            description: cluster.description,
            url: hubUrl,
            itemUrls: posts.map((post) => `${SITE}/blog/${post.slug}`),
          }),
          buildBreadcrumbList([
            { name: 'Home', url: SITE },
            { name: 'Topics', url: `${SITE}/topics` },
            { name: cluster.title, url: hubUrl },
          ]),
        ]}
      />

      <LivingHero
        eyebrow={`Sage Ideas · ${cluster.title}`}
        title={cluster.headline}
        lede={cluster.description}
        primaryCta={{ href: cluster.moneyPageLink.href, label: cluster.moneyPageLink.label }}
        secondaryCta={{ href: '/blog', label: 'All dispatches' }}
        proof={[
          { label: 'dispatches', value: String(posts.length).padStart(2, '0') },
          { label: 'keywords', value: String(cluster.keywords.length).padStart(2, '0') },
          { label: 'open gaps', value: String(cluster.gaps.length).padStart(2, '0') },
          { label: 'route', value: 'money page' },
        ]}
        panel={
          <SystemHeroPanel
            eyebrow="Cluster graph"
            title={cluster.title}
            nodes={['Intent', 'Post', 'Proof', 'Offer']}
            stats={[
              { label: 'cluster', value: cluster.slug },
              { label: 'articles', value: String(posts.length) },
              { label: 'next step', value: 'clear' },
            ]}
          />
        }
      />

      <LivingSection>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
          <Link href="/" className="hover:text-[var(--sage-ink-muted)]">Home</Link>
          <span>/</span>
          <Link href="/topics" className="hover:text-[var(--sage-ink-muted)]">Topics</Link>
          <span>/</span>
          <span className="text-[var(--sage-accent-readable)]">{cluster.title}</span>
        </nav>
      </LivingSection>

      <LivingSection
        eyebrow="Dispatch index"
        title="Read the cluster."
        lede="Start with the newest field notes, then move into the relevant service, academy path, or diagnostic once the problem is clear."
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <ol className="divide-y divide-[var(--sage-border)] border-y border-[var(--sage-border)]">
            {posts.map((post, index) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group grid gap-4 py-6 transition-colors hover:bg-[rgba(61,90,254,0.06)] sm:grid-cols-[4rem_1fr_auto] sm:px-4"
                >
                  <span className="font-mono text-[11px] tracking-[0.14em] text-[var(--sage-accent-readable)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <span className="block text-xl font-semibold text-[var(--sage-ink)] group-hover:text-[var(--sage-accent-readable)]">
                      {post.title}
                    </span>
                    <span className="mt-2 block max-w-[70ch] text-sm leading-6 text-[var(--sage-ink-muted)]">
                      {post.excerpt}
                    </span>
                    <span className="mt-4 flex flex-wrap gap-2">
                      {post.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[var(--sage-border)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--sage-ink-faint)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
                    {formatDate(post.date)}
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          <aside className="space-y-4">
            <div className="rounded-[8px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-5">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                Money route
              </p>
              <p className="mt-4 text-sm leading-6 text-[var(--sage-ink-muted)]">
                When this topic maps to real implementation work, the next commercial path is already wired.
              </p>
              <LivingCTA href={cluster.moneyPageLink.href} className="mt-5">
                {cluster.moneyPageLink.label}
              </LivingCTA>
            </div>

            <div className="rounded-[8px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-5">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                Open gaps
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--sage-ink-muted)]">
                {cluster.gaps.map((gap) => (
                  <li className="flex gap-3" key={gap}>
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--sage-accent)]" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[8px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-5">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                Search terms
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {cluster.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-[var(--sage-border)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--sage-ink-faint)]"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </LivingSection>

      <LivingSection
        eyebrow="Cluster funnel"
        title="What this page is designed to do."
        lede="A high-quality content engine needs navigation, internal linking, and a clear buyer path baked into the page structure."
      >
        <ConversionMap
          steps={[
            {
              label: 'Answer the search',
              detail: 'The hub gives Google and readers a stable topic container with consistent language.',
            },
            {
              label: 'Expose the depth',
              detail: 'The article list proves the cluster is not a one-off post or thin SEO page.',
            },
            {
              label: 'Name the gaps',
              detail: 'Open gaps become the editorial roadmap for future articles and academy modules.',
            },
            {
              label: 'Route the buyer',
              detail: 'The money page CTA turns attention into a scoped next action without pressure.',
            },
          ]}
        />
      </LivingSection>

      <LivingSection>
        <LivingProofStrip
          items={[
            { label: 'cluster', value: cluster.title },
            { label: 'content type', value: 'field notes' },
            { label: 'conversion', value: 'service route' },
            { label: 'academy', value: 'future modules' },
          ]}
        />
      </LivingSection>
    </LivingPageShell>
  )
}
