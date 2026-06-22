import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllBlogPosts } from '@/lib/blog-server'
import { getContentHealth, getEditorialQueue, type CalendarPriority } from '@/lib/seo/content-health'

// Internal content-ops cockpit — the editorial calendar + link-graph health in one
// view. Noindex: this is an operating tool, not public SEO content.
export const metadata: Metadata = {
  title: 'Content Ops — Sage Ideas',
  robots: { index: false, follow: false },
}

const PRIORITY_TONE: Record<CalendarPriority, string> = {
  P0: 'text-[#ff5c7a] border-[#ff5c7a]/40',
  P1: 'text-[#ffb84d] border-[#ffb84d]/40',
  P2: 'text-[var(--sage-ink-faint)] border-[var(--sage-border)]',
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${tone ?? 'text-[var(--sage-ink)]'}`}>{value}</p>
    </div>
  )
}

export default function ContentOpsPage() {
  const posts = getAllBlogPosts()
  const health = getContentHealth(posts)
  const queue = getEditorialQueue(posts)
  const maxCount = Math.max(...health.clusters.map((c) => c.count), 1)

  return (
    <div className="min-h-screen" style={{ background: 'var(--sage-bg)' }}>
      <header className="border-b border-[var(--sage-border)] pt-24 sm:pt-28">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
            Internal · Content Ops
          </p>
          <h1 className="mt-4 text-[clamp(2rem,1.2rem+3vw,3rem)] font-normal text-[var(--sage-ink)]">
            Content engine cockpit
          </h1>
          <p className="mt-4 max-w-[60ch] text-[16px] leading-[1.7] text-[var(--sage-ink-muted)]">
            The link-graph health and editorial calendar in one place. Mirrors{' '}
            <code className="rounded bg-[var(--sage-surface-2)] px-1.5 py-0.5 font-mono text-[13px]">npm run content:report</code>.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <section aria-label="Health summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Posts" value={String(health.total)} />
          <StatCard
            label="Orphans"
            value={String(health.orphans.length)}
            tone={health.orphans.length === 0 ? 'text-[#4ade80]' : 'text-[#ffb84d]'}
          />
          <StatCard
            label="Uncovered keywords"
            value={String(health.uncoveredKeywords.length)}
            tone={health.uncoveredKeywords.length === 0 ? 'text-[#4ade80]' : 'text-[#ffb84d]'}
          />
          <StatCard
            label="Total issues"
            value={String(health.issues)}
            tone={health.issues === 0 ? 'text-[#4ade80]' : 'text-[#ffb84d]'}
          />
        </section>

        <section aria-label="Cluster coverage" className="mt-12">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
            Cluster coverage
          </h2>
          <div className="mt-5 space-y-3">
            {health.clusters.map((c) => (
              <div key={c.key} className="flex items-center gap-4">
                <Link
                  href={`/topics/${c.slug}`}
                  className="w-52 shrink-0 text-sm font-medium text-[var(--sage-ink)] hover:text-[var(--sage-accent-readable)]"
                >
                  {c.title}
                </Link>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-[var(--sage-surface-2)]">
                  <div
                    className="h-full rounded-full bg-[var(--sage-accent)]"
                    style={{ width: `${(c.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-28 shrink-0 text-right font-mono text-[12px] text-[var(--sage-ink-faint)]">
                  {c.count} posts · {c.gaps.length} gaps
                </span>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Editorial calendar" className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              Editorial calendar — {queue.length} queued
            </h2>
            <span className="font-mono text-[11px] text-[var(--sage-ink-faint)]">
              P0 demand · P1 thin-cluster gap · P2 roadmap
            </span>
          </div>
          <ol className="mt-5 divide-y divide-[var(--sage-border)] border-y border-[var(--sage-border)]">
            {queue.map((item, i) => (
              <li key={`${item.cluster}-${item.title}-${i}`} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4">
                <span className={`rounded-full border px-2.5 py-1 font-mono text-[11px] ${PRIORITY_TONE[item.priority]}`}>
                  {item.priority}
                </span>
                <span>
                  <span className="block text-[15px] font-medium text-[var(--sage-ink)]">{item.title}</span>
                  <span className="mt-0.5 block text-[13px] text-[var(--sage-ink-faint)]">{item.reason}</span>
                </span>
                <Link
                  href={`/topics/${item.clusterSlug}`}
                  className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--sage-ink-faint)] hover:text-[var(--sage-accent-readable)]"
                >
                  {item.clusterTitle}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  )
}
