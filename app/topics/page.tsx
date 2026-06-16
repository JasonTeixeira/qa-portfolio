import type { Metadata } from 'next'
import Link from 'next/link'
import { clusterList } from '@/data/content/clusters'
import { getAllBlogPosts } from '@/lib/blog-server'
import { Hairline, MonoLabel } from '@/components/el'

export const metadata: Metadata = {
  title: 'Topics',
  description:
    'Browse Sage Ideas field notes by cluster: AI engineering, fintech systems, cloud infrastructure, testing, and solo studio operations.',
  alternates: { canonical: 'https://www.sageideas.dev/topics' },
}

const DISPLAY_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
  letterSpacing: '-0.026em',
  lineHeight: 1.05,
}

export default function TopicsPage() {
  const posts = getAllBlogPosts()

  return (
    <main className="min-h-screen bg-[var(--sage-bg)] pt-28">
      <section className="border-b border-[var(--sage-border)]">
        <div className="mx-auto max-w-7xl px-5 pb-14 sm:px-8">
          <div className="mb-8 flex items-center gap-4">
            <MonoLabel tone="accent">{'// topic hubs'}</MonoLabel>
            <Hairline className="flex-1" />
            <MonoLabel tone="faint">{clusterList.length} clusters</MonoLabel>
          </div>
          <h1 className="max-w-4xl text-[clamp(2.5rem,1.4rem+5vw,6rem)] font-normal text-[var(--sage-ink)]" style={DISPLAY_STYLE}>
            The content map.
          </h1>
          <p className="mt-6 max-w-[62ch] text-[16px] leading-[1.75] text-[var(--sage-ink-muted)]">
            Every article is assigned to a strategic cluster, linked to a money page, and shaped to compound into the academy and studio funnel.
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-12 sm:px-8 md:grid-cols-2 xl:grid-cols-3">
        {clusterList.map((cluster) => {
          const count = posts.filter((post) => post.cluster === cluster.key).length
          return (
            <Link
              key={cluster.key}
              href={`/topics/${cluster.slug}`}
              className="group rounded-[6px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-6 transition-colors hover:border-[#3D5AFE]/60"
            >
              <MonoLabel tone="accent">{String(count).padStart(2, '0')} posts</MonoLabel>
              <h2 className="mt-5 text-2xl font-semibold text-[var(--sage-ink)] group-hover:text-[#3D5AFE]">
                {cluster.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--sage-ink-muted)]">
                {cluster.description}
              </p>
              <span className="mt-6 inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)] group-hover:text-[var(--sage-ink)]">
                Open hub -&gt;
              </span>
            </Link>
          )
        })}
      </section>
    </main>
  )
}
