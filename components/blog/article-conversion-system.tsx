import Link from 'next/link'
import type { BlogPost } from '@/lib/blog-server'
import type { HubMeta } from '@/data/content/clusters'

type ArticleConversionSystemProps = {
  cluster: HubMeta
  currentPost: BlogPost
  clusterPosts: BlogPost[]
}

export function ArticleConversionSystem({
  cluster,
  currentPost,
  clusterPosts,
}: ArticleConversionSystemProps) {
  const nextPosts = clusterPosts
    .filter((post) => post.slug !== currentPost.slug)
    .slice(0, 3)

  return (
    <section
      aria-label="Article next steps"
      className="not-prose my-14 overflow-hidden rounded-[8px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)]"
    >
      <div className="grid gap-px bg-[var(--sage-border)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative overflow-hidden bg-[var(--sage-surface-1)] p-5 sm:p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-45"
            style={{
              backgroundImage:
                'linear-gradient(rgba(242,239,233,0.032) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,233,0.032) 1px, transparent 1px)',
              backgroundSize: '42px 42px',
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                Reader route
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
                article -&gt; proof -&gt; offer
              </p>
            </div>

            <svg
              className="my-8 h-[160px] w-full overflow-visible"
              viewBox="0 0 560 230"
              role="img"
              aria-label="Article conversion route diagram"
            >
              <defs>
                <linearGradient id={`article-route-${currentPost.slug}`} x1="0" x2="1" y1="0" y2="0">
                  <stop stopColor="#3D5AFE" offset="0%" />
                  <stop stopColor="#7C3AED" offset="52%" />
                  <stop stopColor="#FF2D9B" offset="100%" />
                </linearGradient>
              </defs>
              <path
                d="M 42 140 C 132 48, 210 52, 282 112 S 410 202, 518 74"
                fill="none"
                stroke={`url(#article-route-${currentPost.slug})`}
                strokeLinecap="round"
                strokeWidth="2"
              />
              <path
                d="M 58 78 C 156 128, 236 184, 350 148 S 462 118, 520 158"
                fill="none"
                stroke="rgba(242,239,233,0.16)"
                strokeLinecap="round"
                strokeWidth="1"
              />
              {[
                { x: 42, y: 140, label: 'Read' },
                { x: 190, y: 62, label: 'Cluster' },
                { x: 338, y: 164, label: 'Proof' },
                { x: 518, y: 74, label: 'Scope' },
              ].map((node, index) => (
                <g key={node.label}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="18"
                    fill="rgba(61,90,254,0.06)"
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="7"
                    fill="#0B0B0E"
                    stroke={index === 2 ? '#FF2D9B' : '#3D5AFE'}
                    strokeWidth="2"
                  />
                  <text
                    x={node.x}
                    y={node.y + 36}
                    fill="#8A8A94"
                    fontFamily="var(--font-mono)"
                    fontSize="10"
                    textAnchor="middle"
                    letterSpacing="1.2"
                  >
                    {node.label}
                  </text>
                </g>
              ))}
            </svg>

            <div className="grid gap-px bg-[var(--sage-border)] sm:grid-cols-3">
              {[
                { label: 'cluster', value: cluster.title },
                { label: 'intent', value: currentPost.category },
                { label: 'route', value: 'next step' },
              ].map((item) => (
                <div className="bg-[rgba(11,11,14,0.72)] p-3" key={item.label}>
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
                    {item.label}
                  </p>
                  <p className="mt-2 line-clamp-1 text-sm font-semibold text-[var(--sage-ink)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[var(--sage-surface-1)] p-5 sm:p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
            What to do with this
          </p>
          <h2
            className="mt-5 text-3xl font-extrabold leading-[0.98] text-[var(--sage-ink)] sm:text-4xl"
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.03em',
            }}
          >
            Turn the note into a build path.
          </h2>
          <p className="mt-5 text-sm leading-6 text-[var(--sage-ink-muted)]">
            If this topic maps to a real business problem, keep reading the cluster,
            study the academy path, or route the work into a scoped engagement.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={cluster.moneyPageLink.href}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--sage-accent)] px-5 text-sm font-semibold text-white transition hover:bg-[#5670ff]"
            >
              {cluster.moneyPageLink.label}<span aria-hidden className="ml-1">-&gt;</span>
            </Link>
            <Link
              href="/academy"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--sage-border-strong)] bg-[rgba(20,20,24,0.58)] px-5 text-sm font-semibold text-[var(--sage-ink)] transition hover:border-[var(--sage-accent)]"
            >
              Learn the system<span aria-hidden className="ml-1">-&gt;</span>
            </Link>
          </div>

          {nextPosts.length > 0 ? (
            <div className="mt-8 border-t border-[var(--sage-border)] pt-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
                Continue this cluster
              </p>
              <ol className="mt-3 space-y-2">
                {nextPosts.map((post, index) => (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group grid grid-cols-[auto_1fr_auto] gap-3 rounded-[6px] px-2 py-2 transition-colors hover:bg-[rgba(61,90,254,0.08)]"
                    >
                      <span className="font-mono text-[10px] text-[var(--sage-accent-readable)]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="line-clamp-1 text-sm text-[var(--sage-ink-muted)] group-hover:text-[var(--sage-ink)]">
                        {post.title}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--sage-ink-faint)] group-hover:text-[var(--sage-accent-readable)]">
                        -&gt;
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
