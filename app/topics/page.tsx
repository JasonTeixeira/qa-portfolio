import type { Metadata } from 'next'
import Link from 'next/link'
import { clusterList } from '@/data/content/clusters'
import { getAllBlogPosts } from '@/lib/blog-server'
import {
  ConversionMap,
  LivingCTA,
  LivingHero,
  LivingPageShell,
  LivingProofStrip,
  LivingSection,
  SystemHeroPanel,
} from '@/components/living/LivingPageSystem'

export const metadata: Metadata = {
  title: 'Topics',
  description:
    'Browse Sage Ideas field notes by cluster: AI engineering, fintech systems, cloud infrastructure, testing, and solo studio operations.',
  alternates: { canonical: 'https://www.sageideas.dev/topics' },
}

export default function TopicsPage() {
  const posts = getAllBlogPosts()
  const totalGaps = clusterList.reduce((sum, cluster) => sum + cluster.gaps.length, 0)
  const totalKeywords = new Set(clusterList.flatMap((cluster) => cluster.keywords)).size

  return (
    <LivingPageShell>
      <LivingHero
        eyebrow="Sage Ideas · content machine"
        title="The content map."
        lede="Every article is routed by cluster, search intent, proof, and money page. This is not a blog archive; it is the public operating system for the studio and academy."
        primaryCta={{ href: '/blog', label: 'Read the journal' }}
        secondaryCta={{ href: '/academy', label: 'Explore academy' }}
        proof={[
          { label: 'clusters', value: String(clusterList.length).padStart(2, '0') },
          { label: 'dispatches', value: `${posts.length}` },
          { label: 'keyword routes', value: `${totalKeywords}` },
          { label: 'planned gaps', value: `${totalGaps}` },
        ]}
        panel={
          <SystemHeroPanel
            eyebrow="Editorial architecture"
            title="Content graph"
            nodes={['Search', 'Article', 'Academy', 'Service']}
            stats={[
              { label: 'intent', value: 'mapped' },
              { label: 'routing', value: 'money' },
              { label: 'proof', value: 'owned' },
            ]}
          />
        }
      />

      <LivingSection
        eyebrow="Topic hubs"
        title="Six routes into the system."
        lede="Each hub has a search target, a proof lane, and a commercial next step. The goal is useful writing that compounds into product trust."
      >
        <div className="grid gap-px bg-[var(--sage-border)] md:grid-cols-2 xl:grid-cols-3">
          {clusterList.map((cluster, index) => {
            const count = posts.filter((post) => post.cluster === cluster.key).length
            return (
              <Link
                key={cluster.key}
                href={`/topics/${cluster.slug}`}
                className="group relative min-h-[360px] overflow-hidden bg-[var(--sage-surface-1)] p-6 transition-colors hover:bg-[rgba(61,90,254,0.06)]"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-45"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(242,239,233,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,233,0.028) 1px, transparent 1px)',
                    backgroundSize: '46px 46px',
                  }}
                />
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-mono text-xs text-[var(--sage-accent-readable)]">
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
                      {String(count).padStart(2, '0')} posts
                    </p>
                  </div>

                  <svg
                    className="my-8 h-[96px] w-full overflow-visible"
                    viewBox="0 0 420 110"
                    aria-hidden
                  >
                    <defs>
                      <linearGradient id={`topic-line-${cluster.key}`} x1="0" x2="1" y1="0" y2="0">
                        <stop stopColor="#3D5AFE" offset="0%" />
                        <stop stopColor="#7C3AED" offset="55%" />
                        <stop stopColor="#FF2D9B" offset="100%" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 18 72 C 82 18, 142 18, 204 58 S 314 98, 402 34"
                      fill="none"
                      stroke={`url(#topic-line-${cluster.key})`}
                      strokeLinecap="round"
                      strokeWidth="2"
                    />
                    {[18, 142, 262, 402].map((x, nodeIndex) => (
                      <circle
                        key={x}
                        cx={x}
                        cy={nodeIndex === 1 ? 28 : nodeIndex === 2 ? 78 : nodeIndex === 3 ? 34 : 72}
                        r="5"
                        fill="#0B0B0E"
                        stroke={nodeIndex === 2 ? '#FF2D9B' : '#3D5AFE'}
                        strokeWidth="2"
                      />
                    ))}
                  </svg>

                  <h2 className="text-2xl font-semibold leading-tight text-[var(--sage-ink)] group-hover:text-[var(--sage-accent-readable)]">
                    {cluster.title}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-[var(--sage-ink-muted)]">
                    {cluster.description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {cluster.keywords.slice(0, 3).map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full border border-[var(--sage-border)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--sage-ink-faint)]"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <span className="mt-auto pt-8 font-mono text-xs uppercase tracking-[0.12em] text-[var(--sage-accent-readable)]">
                    Open hub -&gt;
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </LivingSection>

      <LivingSection
        eyebrow="Reader routing"
        title="Useful content with a spine."
        lede="Every cluster should help a reader do something practical, then give them a credible next step when they want the work implemented."
      >
        <ConversionMap
          steps={[
            {
              label: 'Search intent',
              detail: 'Each hub owns a precise problem space instead of chasing generic traffic.',
            },
            {
              label: 'Field note',
              detail: 'Articles show actual engineering judgment, shipped systems, and tradeoffs.',
            },
            {
              label: 'Owned proof',
              detail: 'The Lab, Work, and Trust pages give readers receipts instead of vague claims.',
            },
            {
              label: 'Commercial route',
              detail: 'Readers can move into academy, audit, service scope, or a direct call.',
            },
          ]}
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <LivingCTA href="/tools/seo-audit">Run the SEO audit</LivingCTA>
          <LivingCTA href="/book" variant="secondary">
            Book the build
          </LivingCTA>
        </div>
      </LivingSection>

      <LivingSection>
        <LivingProofStrip
          items={[
            { label: 'honesty rule', value: 'no fake proof' },
            { label: 'content source', value: 'operator notes' },
            { label: 'growth loop', value: 'SEO -> trust' },
            { label: 'offer path', value: 'learn or hire' },
          ]}
        />
      </LivingSection>
    </LivingPageShell>
  )
}
