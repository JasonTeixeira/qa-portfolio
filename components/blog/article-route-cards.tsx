import Link from 'next/link'
import type { BlogPost } from '@/lib/blog-server'
import type { HubMeta } from '@/data/content/clusters'
import { getAcademyTrackForCluster } from '@/data/academy/tracks'

const displayStyle = {
  fontFamily: 'var(--font-display)',
  letterSpacing: '-0.03em',
  lineHeight: 0.98,
} as const

const mono = 'font-mono text-[11px] uppercase tracking-[0.16em]'

type ArticleRouteCardsProps = {
  cluster: HubMeta
  currentPost: BlogPost
  clusterPosts: BlogPost[]
}

export function ArticleRouteCards({
  cluster,
  currentPost,
  clusterPosts,
}: ArticleRouteCardsProps) {
  const sameCluster = clusterPosts
    .filter((post) => post.slug !== currentPost.slug)
    .slice(0, 4)
  const academyTrack = getAcademyTrackForCluster(currentPost.cluster)

  return (
    <aside
      aria-label="Article learning path"
      className="not-prose my-14 grid gap-px bg-[var(--sage-border)] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
    >
      <div className="relative overflow-hidden bg-[var(--sage-surface-1)] p-5 sm:p-6">
        <div
          className="absolute inset-0 opacity-60"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(rgba(242,239,233,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,233,0.04) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(95% 85% at 42% 20%, #000 12%, transparent 76%)',
          }}
        />
        <div className="relative z-10">
          <p className={`${mono} text-[var(--sage-accent-readable)]`}>series route</p>
          <h2 className="mt-5 text-4xl font-extrabold text-[var(--sage-ink)]" style={displayStyle}>
            Keep following the thread.
          </h2>
          <p className="mt-5 text-sm leading-6 text-[var(--sage-ink-muted)]">
            This article belongs to the {cluster.title} lane. Read the neighboring notes,
            then use the academy or studio route when the idea needs implementation.
          </p>

          <svg
            className="mt-8 h-[150px] w-full overflow-visible"
            viewBox="0 0 540 210"
            role="img"
            aria-label="Article series route diagram"
          >
            <defs>
              <linearGradient id={`series-flow-${currentPost.slug}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#3D5AFE" />
                <stop offset="52%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#FF2D9B" />
              </linearGradient>
            </defs>
            <path
              d="M 38 128 C 118 48, 208 50, 278 108 S 404 182, 502 66"
              fill="none"
              stroke={`url(#series-flow-${currentPost.slug})`}
              strokeLinecap="round"
              strokeWidth="2"
            />
            <path
              d="M 48 72 C 138 114, 238 178, 336 134 S 448 108, 512 148"
              fill="none"
              stroke="rgba(242,239,233,0.16)"
              strokeLinecap="round"
              strokeWidth="1"
            />
            {['Read', 'Cluster', 'Academy', 'Build'].map((label, index) => {
              const points = [
                [38, 128],
                [194, 58],
                [346, 152],
                [502, 66],
              ]
              const [x, y] = points[index]
              return (
                <g key={label}>
                  <circle cx={x} cy={y} r="21" fill="rgba(61,90,254,0.055)" />
                  <circle
                    cx={x}
                    cy={y}
                    r="7"
                    fill="#0B0B0E"
                    stroke={`url(#series-flow-${currentPost.slug})`}
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={y + 38}
                    fill="#8A8A94"
                    fontFamily="var(--font-mono)"
                    fontSize="10"
                    textAnchor="middle"
                    letterSpacing="1.4"
                  >
                    {label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      <div className="grid gap-px bg-[var(--sage-border)]">
        <Link
          href={`/topics/${cluster.slug}`}
          className="group bg-[var(--sage-surface-1)] p-5 transition-colors hover:bg-[var(--sage-surface-2)] sm:p-6"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <span className={`${mono} text-[var(--sage-accent-readable)]`}>topic hub</span>
            <span className={`${mono} text-[var(--sage-ink-faint)]`}>open -&gt;</span>
          </div>
          <h3 className="text-2xl font-extrabold text-[var(--sage-ink)]" style={displayStyle}>
            {cluster.headline}
          </h3>
          <p className="mt-3 text-sm leading-6 text-[var(--sage-ink-muted)]">{cluster.description}</p>
        </Link>

        <Link
          href="/academy/catalog"
          className="group bg-[var(--sage-surface-1)] p-5 transition-colors hover:bg-[var(--sage-surface-2)] sm:p-6"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <span className={`${mono} text-[var(--sage-accent-readable)]`}>academy path</span>
            <span className={`${mono} text-[var(--sage-ink-faint)]`}>learn -&gt;</span>
          </div>
          <h3 className="text-2xl font-extrabold text-[var(--sage-ink)]" style={displayStyle}>
            {academyTrack.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-[var(--sage-ink-muted)]">
            {academyTrack.outcome}
          </p>
        </Link>

        {sameCluster.length > 0 ? (
          <div className="bg-[var(--sage-surface-1)] p-5 sm:p-6">
            <p className={`${mono} mb-4 text-[var(--sage-accent-readable)]`}>same lane</p>
            <ol className="space-y-2">
              {sameCluster.map((post, index) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group grid grid-cols-[auto_1fr_auto] gap-3 border-t border-[var(--sage-border)] py-3"
                  >
                    <span className={`${mono} text-[var(--sage-accent-readable)]`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="line-clamp-1 text-sm text-[var(--sage-ink-muted)] group-hover:text-[var(--sage-ink)]">
                      {post.title}
                    </span>
                    <span className={`${mono} text-[var(--sage-ink-faint)] group-hover:text-[var(--sage-accent-readable)]`}>
                      -&gt;
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </aside>
  )
}

export function ArticleLeadMagnet({
  cluster,
  currentPost,
}: {
  cluster: HubMeta
  currentPost: BlogPost
}) {
  return (
    <aside
      className="not-prose my-12 overflow-hidden border border-[var(--sage-border)] bg-[rgba(20,20,24,0.68)]"
      aria-label="Article lead magnet"
    >
      <div className="grid gap-px bg-[var(--sage-border)] sm:grid-cols-[minmax(0,1fr)_220px]">
        <div className="bg-[var(--sage-surface-1)] p-5 sm:p-6">
          <p className={`${mono} text-[var(--sage-accent-readable)]`}>field kit</p>
          <h2 className="mt-4 text-3xl font-extrabold text-[var(--sage-ink)]" style={displayStyle}>
            Want the checklist behind this?
          </h2>
          <p className="mt-4 text-sm leading-6 text-[var(--sage-ink-muted)]">
            Use this note as a starting point, then run the route through the Sage Ideas audit
            system for your product, content engine, or AI workflow.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/tools/route-finder?source=blog&topic=${encodeURIComponent(currentPost.cluster)}`}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--sage-accent)] px-5 text-sm font-semibold text-white transition hover:bg-[#5670ff]"
            >
              Find your route <span aria-hidden className="ml-1">-&gt;</span>
            </Link>
            <Link
              href={cluster.moneyPageLink.href}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--sage-border-strong)] bg-[rgba(20,20,24,0.58)] px-5 text-sm font-semibold text-[var(--sage-ink)] transition hover:border-[var(--sage-accent)]"
            >
              {cluster.moneyPageLink.label}<span aria-hidden className="ml-1">-&gt;</span>
            </Link>
          </div>
        </div>
        <div className="bg-[rgba(11,11,14,0.84)] p-5 sm:p-6">
          <p className={`${mono} text-[var(--sage-ink-faint)]`}>route data</p>
          <dl className="mt-6 space-y-4">
            {[
              { label: 'cluster', value: cluster.title },
              { label: 'article', value: currentPost.category },
              { label: 'next step', value: 'diagnose' },
            ].map((item) => (
              <div className="border-t border-[var(--sage-border)] pt-3" key={item.label}>
                <dt className={`${mono} text-[var(--sage-ink-faint)]`}>{item.label}</dt>
                <dd className="mt-1 text-sm font-semibold text-[var(--sage-ink)]">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </aside>
  )
}
