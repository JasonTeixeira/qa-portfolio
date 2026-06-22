import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CLUSTERS, clusterList, getClusterBySlug } from '@/data/content/clusters'
import { getAllBlogPosts, getBlogPostsByCluster } from '@/lib/blog-server'
import { getHubRelatedClusters } from '@/lib/seo/internal-links'
import { getAcademyTrackForCluster } from '@/data/academy/tracks'
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

  const ogImage = `/og?title=${encodeURIComponent(cluster.title)}&subtitle=${encodeURIComponent(cluster.description.slice(0, 80))}`
  return {
    title: cluster.title,
    description: cluster.description,
    alternates: {
      canonical: `${SITE}/topics/${cluster.slug}`,
      types: { 'application/rss+xml': `${SITE}/feed/${cluster.slug}.xml` },
    },
    openGraph: {
      title: cluster.title,
      description: cluster.description,
      url: `${SITE}/topics/${cluster.slug}`,
      type: 'website',
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: cluster.title,
      description: cluster.description,
      images: [ogImage],
    },
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export default async function TopicHubPage({ params }: PageProps) {
  const { hub } = await params
  const cluster = getClusterBySlug(hub)
  if (!cluster) notFound()

  const posts = getBlogPostsByCluster(cluster.key)
  const hubUrl = `${SITE}/topics/${cluster.slug}`
  const relatedClusters = getHubRelatedClusters(cluster.key, getAllBlogPosts(), 3).map((key) => CLUSTERS[key])
  const academyTrack = getAcademyTrackForCluster(cluster.key)

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

            <div className="rounded-[8px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-5">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                Go deeper — Academy
              </p>
              <p className="mt-4 text-sm leading-6 text-[var(--sage-ink-muted)]">
                Reading is the entry point. The matching academy track turns this topic into a hands-on build.
              </p>
              <Link
                href={`/academy/${academyTrack.slug}`}
                className="mt-4 block text-[15px] font-semibold text-[var(--sage-ink)] hover:text-[var(--sage-accent-readable)]"
              >
                {academyTrack.title} -&gt;
              </Link>
              <p className="mt-1 text-[13px] leading-5 text-[var(--sage-ink-faint)]">{academyTrack.outcome}</p>
            </div>

            <div className="rounded-[8px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-5">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                Subscribe
              </p>
              <p className="mt-4 text-sm leading-6 text-[var(--sage-ink-muted)]">
                Follow just this cluster as new field notes ship.
              </p>
              <a
                href={`/feed/${cluster.slug}.xml`}
                className="mt-4 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.12em] text-[var(--sage-ink-muted)] hover:text-[var(--sage-accent-readable)]"
              >
                {cluster.title} RSS -&gt;
              </a>
            </div>
          </aside>
        </div>
      </LivingSection>

      {relatedClusters.length > 0 ? (
        <LivingSection
          eyebrow="Related topics"
          title="Where this cluster connects."
          lede="Strong topics don't sit in isolation. These adjacent clusters share readers, problems, and buyers — follow the thread."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedClusters.map((related) => (
              <Link
                key={related.key}
                href={`/topics/${related.slug}`}
                className="group flex flex-col gap-3 rounded-[8px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-5 transition-colors hover:border-[var(--sage-accent)]"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                  Topic hub
                </span>
                <span className="text-lg font-semibold text-[var(--sage-ink)] group-hover:text-[var(--sage-accent-readable)]">
                  {related.title}
                </span>
                <span className="text-sm leading-6 text-[var(--sage-ink-muted)]">
                  {related.description}
                </span>
                <span className="mt-auto font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)] group-hover:text-[var(--sage-accent-readable)]">
                  Read the cluster -&gt;
                </span>
              </Link>
            ))}
          </div>
        </LivingSection>
      ) : null}

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
