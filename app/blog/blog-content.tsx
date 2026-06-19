'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  LivingCTA,
  LivingPageShell,
  LivingSection,
  MotionProofStrip,
} from '@/components/living/LivingPageSystem'
import { RouteConversionCta } from '@/components/living/RouteConversionCta'
import { clusterList } from '@/data/content/clusters'
import type { BlogPost } from '@/lib/blog-server'

const displayStyle = {
  fontFamily: 'var(--font-display)',
  letterSpacing: '-0.03em',
  lineHeight: 0.98,
} as const

const mono = 'font-mono text-[11px] uppercase tracking-[0.16em]'

const editorialTracks = [
  {
    label: 'Builder notes',
    title: 'How the systems are made',
    body: 'Architecture, implementation decisions, debugging, and production lessons from the studio build record.',
    href: '/topics/product-systems',
  },
  {
    label: 'AI systems',
    title: 'Agents, apps, and automation',
    body: 'Practical AI engineering without fake demos: boundaries, evaluation, workflows, and product integration.',
    href: '/topics/ai-engineering',
  },
  {
    label: 'Academy path',
    title: 'Turn the lessons into capability',
    body: 'Read the operating notes, then move into course tracks, templates, and build frameworks as they ship.',
    href: '/academy',
  },
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function PostMeta({ post }: { post: BlogPost }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[var(--sage-ink-faint)]">
      <span className={mono}>{post.category}</span>
      <span aria-hidden>·</span>
      <span className={mono}>{post.readTime}</span>
      <span aria-hidden>·</span>
      <time className={mono} dateTime={post.date}>
        {formatDate(post.date)}
      </time>
    </div>
  )
}

function ContentFlowDiagram({ librarySize }: { librarySize: number }) {
  return (
    <aside
      className="relative min-h-[410px] overflow-hidden border border-[var(--sage-border)] bg-[rgba(20,20,24,0.58)] p-5 sm:p-6"
      aria-label="Content engine flow diagram"
    >
      <div
        className="absolute inset-0 opacity-70"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(242,239,233,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,233,0.055) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(100% 80% at 48% 26%, #000 20%, transparent 76%)',
        }}
      />
      <div className="relative z-10 flex h-full min-h-[360px] flex-col justify-between">
        <div className="flex items-center justify-between gap-4">
          <p className={`${mono} text-[var(--sage-accent-readable)]`}>content engine</p>
          <p className={`${mono} text-[var(--sage-ink-faint)]`}>read -&gt; learn -&gt; build</p>
        </div>

        <svg
          className="my-8 h-[210px] w-full overflow-visible"
          viewBox="0 0 660 320"
          role="img"
          aria-label="Articles routing readers into services, academy, and tools"
        >
          <defs>
            <linearGradient id="blog-flow-gradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#3D5AFE" />
              <stop offset="52%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#FF2D9B" />
            </linearGradient>
            <filter id="blog-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M 66 176 C 154 78, 248 78, 332 154 S 492 262, 592 112"
            fill="none"
            stroke="url(#blog-flow-gradient)"
            strokeLinecap="round"
            strokeWidth="3"
            filter="url(#blog-glow)"
          />
          <path
            d="M 74 236 C 182 180, 262 206, 366 130 S 520 76, 604 190"
            fill="none"
            stroke="rgba(242,239,233,0.16)"
            strokeLinecap="round"
            strokeWidth="1"
          />
          <path
            d="M 82 86 C 194 144, 254 224, 394 210 S 524 166, 604 224"
            fill="none"
            stroke="rgba(242,239,233,0.12)"
            strokeLinecap="round"
            strokeWidth="1"
          />
          {[
            { x: 66, y: 176, label: 'Search' },
            { x: 232, y: 94, label: 'Article' },
            { x: 408, y: 206, label: 'Lesson' },
            { x: 592, y: 112, label: 'Project' },
          ].map((node, index) => (
            <g key={node.label}>
              <circle cx={node.x} cy={node.y} r="26" fill="rgba(61,90,254,0.05)" />
              <circle
                cx={node.x}
                cy={node.y}
                r="8"
                fill="#0B0B0E"
                stroke="url(#blog-flow-gradient)"
                strokeWidth="2"
              />
              <text
                x={node.x}
                y={node.y + (index === 1 ? -34 : 48)}
                fill="#8A8A94"
                fontFamily="var(--font-mono)"
                fontSize="11"
                textAnchor="middle"
                letterSpacing="1.8"
              >
                {node.label}
              </text>
            </g>
          ))}
          <circle className="motion-reduce:hidden" r="5" fill="#FF2D9B">
            <animateMotion dur="5.8s" repeatCount="indefinite" path="M 66 176 C 154 78, 248 78, 332 154 S 492 262, 592 112" />
          </circle>
          <circle className="motion-reduce:hidden" r="4" fill="#3D5AFE">
            <animateMotion
              dur="7.4s"
              begin="-2s"
              repeatCount="indefinite"
              path="M 74 236 C 182 180, 262 206, 366 130 S 520 76, 604 190"
            />
          </circle>
        </svg>

        <dl className="grid grid-cols-3 gap-px bg-[var(--sage-border)]">
          {[
            { label: 'library', value: String(librarySize) },
            { label: 'clusters', value: String(clusterList.length).padStart(2, '0') },
            { label: 'source', value: 'real builds' },
          ].map((stat) => (
            <div className="bg-[rgba(11,11,14,0.74)] p-3" key={stat.label}>
              <dt className={`${mono} text-[var(--sage-ink-faint)]`}>{stat.label}</dt>
              <dd className="mt-2 font-mono text-sm text-[var(--sage-ink)]">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  )
}

export function BlogContent({ posts }: { posts: BlogPost[] }) {
  const [activeCluster, setActiveCluster] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(12)

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [posts],
  )
  const featuredPost = sortedPosts[0]
  const nextFeatured = sortedPosts.slice(1, 4)

  const clusterCounts = useMemo(() => {
    return sortedPosts.reduce<Record<string, number>>((acc, post) => {
      acc[post.cluster] = (acc[post.cluster] ?? 0) + 1
      return acc
    }, {})
  }, [sortedPosts])

  const filteredPosts = useMemo(() => {
    const query = normalize(searchQuery)
    return sortedPosts.filter((post) => {
      const matchesCluster = activeCluster === 'all' || post.cluster === activeCluster
      const matchesSearch =
        query === '' ||
        normalize(post.title).includes(query) ||
        normalize(post.excerpt).includes(query) ||
        post.tags.some((tag) => normalize(tag).includes(query)) ||
        post.keywords.some((keyword) => normalize(keyword).includes(query))
      return matchesCluster && matchesSearch
    })
  }, [activeCluster, searchQuery, sortedPosts])

  const archivePosts =
    activeCluster === 'all' && searchQuery.trim() === ''
      ? filteredPosts.slice(1)
      : filteredPosts

  // Reset the visible window whenever the filter or search changes so a
  // narrowed result set always reads from the top.
  useEffect(() => {
    setVisibleCount(12)
  }, [activeCluster, searchQuery])

  const shownPosts = archivePosts.slice(0, visibleCount)
  const hasMore = archivePosts.length > shownPosts.length

  return (
    <LivingPageShell>
      <section className="relative isolate overflow-hidden border-b border-[var(--sage-border)] px-5 pb-16 pt-32 sm:px-8 lg:px-12 lg:pb-24 lg:pt-40">
        <div
          className="absolute inset-0 -z-10 opacity-75"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(rgba(242,239,233,0.052) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,233,0.052) 1px, transparent 1px)',
            backgroundSize: '96px 96px',
            maskImage: 'radial-gradient(115% 82% at 25% 16%, #000 18%, transparent 72%)',
          }}
        />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.74fr)] lg:items-end">
          <div>
            <p className={`mb-7 ${mono} text-[var(--sage-accent-readable)]`}>
              Sage journal · content engine · {posts.length} dispatches
            </p>
            <h1
              className="max-w-[10ch] text-[clamp(3.4rem,_1.2rem_+_9vw,_8rem)] font-extrabold text-[var(--sage-ink)]"
              style={displayStyle}
            >
              The build record.
            </h1>
            <p className="mt-8 max-w-[62ch] text-lg leading-[1.6] text-[var(--sage-ink-muted)] sm:text-xl">
              Engineering notes, AI systems, product architecture, and studio operating lessons
              from the work behind Sage Ideas. This is the front door for readers, buyers, and
              future academy students.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <LivingCTA href="#archive">Read the archive</LivingCTA>
              <LivingCTA href="/academy" variant="secondary">
                Enter the academy
              </LivingCTA>
            </div>
          </div>
          <ContentFlowDiagram librarySize={posts.length} />
        </div>
        <div className="mx-auto mt-12 max-w-7xl">
          <MotionProofStrip
            items={[
              { label: 'published articles', value: String(posts.length) },
              { label: 'topic clusters', value: String(clusterList.length) },
              { label: 'voice source', value: 'operator' },
              { label: 'sales path', value: 'studio + academy' },
            ]}
          />
        </div>
      </section>

      {featuredPost ? (
        <LivingSection
          eyebrow="Featured dispatch"
          title="Start with the clearest signal."
          lede="The blog should feel like a product surface, not a pile of posts. Lead with one sharp article, then route the reader by topic and intent."
        >
          <div className="grid gap-px bg-[var(--sage-border)] lg:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.72fr)]">
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group bg-[var(--sage-surface-1)] p-6 transition-colors hover:bg-[var(--sage-surface-2)] sm:p-8 lg:p-10"
            >
              <div className="mb-12 flex items-center justify-between gap-4">
                <span className={`${mono} text-[var(--sage-accent-readable)]`}>01 · featured</span>
                <span className={`${mono} text-[var(--sage-ink-faint)]`}>open article -&gt;</span>
              </div>
              <h2
                className="max-w-[13ch] text-[clamp(2.3rem,_1.1rem_+_4vw,_5.4rem)] font-extrabold text-[var(--sage-ink)] transition-colors group-hover:text-white"
                style={displayStyle}
              >
                {featuredPost.title}
              </h2>
              <p className="mt-6 max-w-[64ch] text-base leading-7 text-[var(--sage-ink-muted)] sm:text-lg">
                {featuredPost.excerpt}
              </p>
              <div className="mt-8">
                <PostMeta post={featuredPost} />
              </div>
            </Link>
            <div className="grid gap-px bg-[var(--sage-border)]">
              {nextFeatured.map((post, index) => (
                <Link
                  className="group bg-[rgba(11,11,14,0.8)] p-6 transition-colors hover:bg-[var(--sage-surface-2)]"
                  href={`/blog/${post.slug}`}
                  key={post.slug}
                >
                  <div className="mb-8 flex items-center justify-between gap-4">
                    <span className={`${mono} text-[var(--sage-accent-readable)]`}>
                      {String(index + 2).padStart(2, '0')}
                    </span>
                    <span className={`${mono} text-[var(--sage-ink-faint)]`}>{post.cluster.replace(/-/g, ' ')}</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-[var(--sage-ink)]" style={displayStyle}>
                    {post.title}
                  </h3>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--sage-ink-muted)]">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </LivingSection>
      ) : null}

      <LivingSection
        eyebrow="Topic lanes"
        title="Six doors into the system."
        lede="Every article belongs to a commercial or academy path. Search traffic lands on the right idea, then moves toward the next useful action."
      >
        <div className="grid gap-px bg-[var(--sage-border)] md:grid-cols-2 xl:grid-cols-3">
          {clusterList.map((cluster) => (
            <button
              className={`group min-h-[240px] bg-[var(--sage-surface-1)] p-5 text-left transition-colors hover:bg-[var(--sage-surface-2)] sm:p-6 ${
                activeCluster === cluster.key ? 'outline outline-1 outline-[var(--sage-accent)]' : ''
              }`}
              key={cluster.key}
              onClick={() => setActiveCluster(activeCluster === cluster.key ? 'all' : cluster.key)}
              type="button"
            >
              <div className="mb-9 flex items-center justify-between gap-4">
                <span className={`${mono} text-[var(--sage-accent-readable)]`}>
                  {String(clusterCounts[cluster.key] ?? 0).padStart(2, '0')} posts
                </span>
                <span className={`${mono} text-[var(--sage-ink-faint)]`}>
                  {activeCluster === cluster.key ? 'selected' : 'filter'}
                </span>
              </div>
              <h3 className="text-3xl font-extrabold text-[var(--sage-ink)]" style={displayStyle}>
                {cluster.title}
              </h3>
              <p className="mt-4 text-sm leading-6 text-[var(--sage-ink-muted)]">{cluster.description}</p>
              <Link
                className={`mt-6 inline-flex ${mono} text-[var(--sage-accent-readable)] hover:text-white`}
                href={`/topics/${cluster.slug}`}
                onClick={(event) => event.stopPropagation()}
              >
                Open hub -&gt;
              </Link>
            </button>
          ))}
        </div>
      </LivingSection>

      <LivingSection
        id="archive"
        eyebrow="Archive console"
        title="Find the operating note."
        lede="Filter by topic lane or search the whole library. The archive stays dense enough for serious readers and clear enough for buyers scanning for proof."
      >
        <div className="mb-6 flex flex-col gap-3 border border-[var(--sage-border)] bg-[rgba(20,20,24,0.55)] p-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            <button
              className={`rounded-full px-3 py-2 ${mono} transition ${
                activeCluster === 'all'
                  ? 'bg-[var(--sage-accent)] text-white'
                  : 'border border-[var(--sage-border)] text-[var(--sage-ink-muted)] hover:border-[var(--sage-accent)]'
              }`}
              onClick={() => setActiveCluster('all')}
              type="button"
            >
              All
            </button>
            {clusterList.map((cluster) => (
              <button
                className={`rounded-full px-3 py-2 ${mono} transition ${
                  activeCluster === cluster.key
                    ? 'bg-[var(--sage-accent)] text-white'
                    : 'border border-[var(--sage-border)] text-[var(--sage-ink-muted)] hover:border-[var(--sage-accent)]'
                }`}
                key={cluster.key}
                onClick={() => setActiveCluster(cluster.key)}
                type="button"
              >
                {cluster.title}
              </button>
            ))}
          </div>
          <input
            aria-label="Search articles"
            className="min-h-11 w-full border border-[var(--sage-border)] bg-[var(--sage-bg)] px-4 font-mono text-sm text-[var(--sage-ink)] outline-none transition placeholder:text-[var(--sage-ink-faint)] focus:border-[var(--sage-accent)] sm:ml-auto sm:max-w-[320px]"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search architecture, AI, QA..."
            type="search"
            value={searchQuery}
          />
        </div>

        {archivePosts.length === 0 ? (
          <div className="border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-10 text-center">
            <p className={`${mono} text-[var(--sage-ink-faint)]`}>No matching dispatches.</p>
            <button
              className={`mt-5 ${mono} text-[var(--sage-accent-readable)] hover:text-white`}
              onClick={() => {
                setActiveCluster('all')
                setSearchQuery('')
              }}
              type="button"
            >
              Clear filters -&gt;
            </button>
          </div>
        ) : (
          <>
            <ol className="grid gap-px bg-[var(--sage-border)] md:grid-cols-2 xl:grid-cols-3">
            {shownPosts.map((post, index) => (
              <li className="bg-[var(--sage-surface-1)]" key={post.slug}>
                <Link
                  className="group flex min-h-[280px] flex-col p-5 transition-colors hover:bg-[var(--sage-surface-2)] sm:p-6"
                  href={`/blog/${post.slug}`}
                >
                  <div className="mb-10 flex items-center justify-between gap-4">
                    <span className={`${mono} text-[var(--sage-accent-readable)]`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={`${mono} text-[var(--sage-ink-faint)]`}>{post.cluster.replace(/-/g, ' ')}</span>
                  </div>
                  <h2
                    className="text-[clamp(1.45rem,_1.1rem_+_0.9vw,_2.15rem)] font-extrabold text-[var(--sage-ink)] group-hover:text-white"
                    style={displayStyle}
                  >
                    {post.title}
                  </h2>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--sage-ink-muted)]">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto pt-8">
                    <PostMeta post={post} />
                  </div>
                </Link>
              </li>
            ))}
            </ol>
            <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <p className={`${mono} text-[var(--sage-ink-faint)]`}>
                Showing {shownPosts.length} of {archivePosts.length}
              </p>
              {hasMore ? (
                <button
                  type="button"
                  onClick={() => setVisibleCount((value) => value + 12)}
                  className={`min-h-11 border border-[var(--sage-border-strong)] bg-transparent px-6 ${mono} text-[var(--sage-ink)] transition hover:border-[var(--sage-accent)] hover:bg-[rgba(61,90,254,0.1)]`}
                >
                  Load more dispatches -&gt;
                </button>
              ) : null}
            </div>
          </>
        )}
      </LivingSection>

      <LivingSection
        eyebrow="Reader routes"
        title="Content that turns into action."
        lede="The blog now has obvious next steps for three different readers: the buyer, the DIY builder, and the returning operator who wants tools."
      >
        <div className="grid gap-px bg-[var(--sage-border)] lg:grid-cols-3">
          {editorialTracks.map((track) => (
            <Link
              className="group bg-[var(--sage-surface-1)] p-6 transition-colors hover:bg-[var(--sage-surface-2)] sm:p-8"
              href={track.href}
              key={track.label}
            >
              <p className={`${mono} mb-12 text-[var(--sage-accent-readable)]`}>{track.label}</p>
              <h3 className="text-3xl font-extrabold text-[var(--sage-ink)]" style={displayStyle}>
                {track.title}
              </h3>
              <p className="mt-4 text-sm leading-6 text-[var(--sage-ink-muted)]">{track.body}</p>
              <span className={`mt-8 inline-flex ${mono} text-[var(--sage-accent-readable)] group-hover:text-white`}>
                Continue -&gt;
              </span>
            </Link>
          ))}
        </div>
      </LivingSection>

      <RouteConversionCta
        eyebrow="diagnose the route"
        title="Don't just read. Find the system to build."
        body="Start with the Route Finder, join the academy path, or bring the hard project straight to the studio."
        primary={{ label: 'Find your route', href: '/tools/route-finder?source=blog_final' }}
        secondary={{ label: 'Book the studio', href: '/book' }}
        variant="growth"
        proof={[
          { label: 'reader', value: 'search' },
          { label: 'path', value: 'academy' },
          { label: 'offer', value: 'studio' },
        ]}
      />
    </LivingPageShell>
  )
}
