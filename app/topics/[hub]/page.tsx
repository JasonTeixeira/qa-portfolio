import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { clusterList, getClusterBySlug } from '@/data/content/clusters'
import { getBlogPostsByCluster } from '@/lib/blog-server'
import { JsonLd } from '@/components/json-ld'
import { Hairline, MonoLabel } from '@/components/el'
import { buildBreadcrumbList, buildCollectionPage } from '@/lib/seo/jsonld'

interface PageProps {
  params: Promise<{ hub: string }>
}

const SITE = 'https://www.sageideas.dev'

const DISPLAY_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
  letterSpacing: '-0.026em',
  lineHeight: 1.05,
}

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
    <main className="min-h-screen bg-[var(--sage-bg)] pt-28">
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
      <section className="border-b border-[var(--sage-border)]">
        <div className="mx-auto max-w-7xl px-5 pb-14 sm:px-8">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2">
            <Link href="/"><MonoLabel tone="faint">Home</MonoLabel></Link>
            <MonoLabel tone="faint">/</MonoLabel>
            <Link href="/topics"><MonoLabel tone="faint">Topics</MonoLabel></Link>
            <MonoLabel tone="faint">/</MonoLabel>
            <MonoLabel tone="faint">{cluster.title}</MonoLabel>
          </nav>
          <div className="mb-8 flex items-center gap-4">
            <MonoLabel tone="accent">{'// content cluster'}</MonoLabel>
            <Hairline className="flex-1" />
            <MonoLabel tone="faint">{posts.length} dispatches</MonoLabel>
          </div>
          <h1 className="max-w-5xl text-[clamp(2.4rem,1.3rem+4.6vw,5.5rem)] font-normal text-[var(--sage-ink)]" style={DISPLAY_STYLE}>
            {cluster.headline}
          </h1>
          <p className="mt-6 max-w-[68ch] text-[16px] leading-[1.75] text-[var(--sage-ink-muted)]">
            {cluster.description}
          </p>
          <div className="mt-8">
            <Link
              href={cluster.moneyPageLink.href}
              className="inline-flex h-11 items-center rounded-[4px] bg-[#3D5AFE] px-5 font-mono text-[12px] uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#536DFE]"
            >
              {cluster.moneyPageLink.label} -&gt;
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ol className="divide-y divide-[var(--sage-border)] border-y border-[var(--sage-border)]">
          {posts.map((post, index) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group grid gap-4 py-6 transition-colors hover:bg-[var(--sage-surface-1)] sm:grid-cols-[4rem_1fr_auto] sm:px-4"
              >
                <span className="font-mono text-[11px] tracking-[0.14em] text-[var(--sage-ink-faint)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <span className="block text-xl font-semibold text-[var(--sage-ink)] group-hover:text-[#3D5AFE]">
                    {post.title}
                  </span>
                  <span className="mt-2 block max-w-[70ch] text-sm leading-6 text-[var(--sage-ink-muted)]">
                    {post.excerpt}
                  </span>
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
                  {formatDate(post.date)}
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <aside>
          <div className="rounded-[6px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-5">
            <MonoLabel tone="accent">Open gaps</MonoLabel>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--sage-ink-muted)]">
              {cluster.gaps.map((gap) => (
                <li key={gap}>- {gap}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4 rounded-[6px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-5">
            <MonoLabel tone="accent">Keywords</MonoLabel>
            <div className="mt-4 flex flex-wrap gap-2">
              {cluster.keywords.map((keyword) => (
                <span key={keyword} className="rounded-[3px] border border-[var(--sage-border)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--sage-ink-faint)]">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}
