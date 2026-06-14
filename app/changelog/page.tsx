import type { Metadata } from 'next'
import Link from 'next/link'
import { Section, Surface, Hairline, MonoLabel, CtaLink, StatDisplay } from '@/components/el'
import { changelog, type ChangelogEntry } from '@/lib/changelogData'

export const metadata: Metadata = {
  title: 'Changelog',
  description:
    'A real, dated feed of what has shipped on Sage Ideas Studio — features, fixes, content, and infrastructure changes.',
  alternates: { canonical: 'https://www.sageideas.dev/changelog' },
  openGraph: {
    title: 'Changelog — Sage Ideas',
    description: 'Everything that has actually shipped, dated and grouped by month.',
    url: 'https://www.sageideas.dev/changelog',
    images: ['/og-default.svg'],
  },
}

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
  letterSpacing: '-0.024em',
  lineHeight: 1.02,
}

const TAG_STYLE: Record<ChangelogEntry['tag'], { label: string; cls: string }> = {
  feat: { label: 'feat', cls: 'border-[#0ED3CF]/40 bg-[#0ED3CF]/[0.06] text-[#0ED3CF]' },
  fix: { label: 'fix', cls: 'border-[#F59E0B]/40 bg-[#F59E0B]/[0.06] text-[#F59E0B]' },
  refactor: { label: 'refactor', cls: 'border-[var(--sage-border-hover)] bg-[var(--sage-surface-3)] text-[var(--sage-ink-muted)]' },
  content: { label: 'content', cls: 'border-[#A8C633]/40 bg-[#A8C633]/[0.06] text-[#A8C633]' },
}

function formatMonth(iso: string) {
  const d = new Date(iso + 'T00:00:00Z')
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

function formatDay(iso: string) {
  const d = new Date(iso + 'T00:00:00Z')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

function groupByMonth(entries: ChangelogEntry[]) {
  const groups: Record<string, ChangelogEntry[]> = {}
  for (const e of entries) {
    const key = e.date.slice(0, 7)
    if (!groups[key]) groups[key] = []
    groups[key].push(e)
  }
  return Object.entries(groups)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([key, items]) => ({
      key,
      label: formatMonth(items[0].date),
      items: items.slice().sort((a, b) => (a.date < b.date ? 1 : -1)),
    }))
}

export default function ChangelogPage() {
  const groups = groupByMonth(changelog)
  const totalShipped = changelog.length

  return (
    <div className="min-h-screen bg-[var(--sage-bg)]">
      {/* Hero */}
      <section
        aria-label="Changelog"
        className="max-w-7xl mx-auto px-5 sm:px-8 pt-28 pb-16 border-b border-[var(--sage-border)]"
      >
        <div className="max-w-3xl">
          <div className="mb-7 flex items-center gap-4">
            <MonoLabel tone="accent">01</MonoLabel>
            <Hairline className="flex-1" />
            <MonoLabel tone="muted">{'// changelog'}</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>
          <h1
            className="text-[var(--sage-ink)] font-normal text-[clamp(2.4rem,1.2rem+4vw,5rem)]"
            style={HEADING_STYLE}
          >
            What we&apos;ve shipped.
          </h1>
          <p className="mt-6 text-[15px] leading-[1.75] text-[var(--sage-ink-muted)] sm:text-base">
            A real, dated feed pulled straight from the repo. Features, fixes, content, infrastructure — grouped by month,
            most recent first.
          </p>

          <div className="mt-8 max-w-md">
            <StatDisplay
              stats={[
                { value: String(totalShipped), label: 'Shipped' },
                { value: String(groups.length), label: 'Months' },
                { value: 'Weekly', label: 'Cadence' },
              ]}
              columns={3}
            />
          </div>
        </div>
      </section>

      {/* Feed */}
      <section
        aria-label="Changelog feed"
        className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20"
      >
        <div className="grid lg:grid-cols-[200px_1fr] gap-8">
          {/* Sticky month nav (desktop) */}
          <aside className="hidden lg:block" aria-label="Jump to month">
            <div className="sticky top-24 space-y-1">
              <MonoLabel tone="faint" as="div" className="mb-3">Jump to</MonoLabel>
              {groups.map((g) => (
                <a
                  key={g.key}
                  href={`#${g.key}`}
                  className="block text-sm text-[var(--sage-ink-muted)] hover:text-[var(--sage-ink)] transition py-1"
                >
                  {g.label}
                </a>
              ))}
            </div>
          </aside>

          {/* Entries */}
          <div className="space-y-16">
            {groups.map((g) => (
              <section key={g.key} id={g.key} className="scroll-mt-24">
                <div className="flex items-baseline gap-3 mb-6 border-t border-[var(--sage-border)] pt-6">
                  <h2
                    className="text-xl font-normal text-[var(--sage-ink)]"
                    style={HEADING_STYLE}
                  >
                    {g.label}
                  </h2>
                  <MonoLabel tone="faint">
                    {g.items.length} {g.items.length === 1 ? 'entry' : 'entries'}
                  </MonoLabel>
                </div>

                <ol className="relative space-y-4">
                  {/* Vertical line */}
                  <span
                    aria-hidden="true"
                    className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--sage-border)]"
                  />

                  {g.items.map((e, idx) => {
                    const tag = TAG_STYLE[e.tag]
                    return (
                      <li key={`${g.key}-${idx}`} className="relative pl-8">
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-3 h-3.5 w-3.5 rounded-full border border-[var(--sage-border)] bg-[var(--sage-surface-1)]"
                        >
                          <span className="absolute inset-1 rounded-full bg-[#0ED3CF]/60" />
                        </span>

                        <Surface level={2} className="p-5 hover:border-[var(--sage-border-hover)] transition">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span
                              className={[
                                'inline-flex items-center text-[10px] [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-[0.18em] px-2 py-0.5 rounded-[3px] border',
                                tag.cls,
                              ].join(' ')}
                            >
                              {tag.label}
                              {e.scope && <span className="ml-1 text-[var(--sage-ink-faint)]">({e.scope})</span>}
                            </span>
                            <MonoLabel tone="faint">{formatDay(e.date)}</MonoLabel>
                          </div>
                          <div className="text-sm text-[var(--sage-ink)] leading-snug">{e.title}</div>
                          {e.body && (
                            <p className="mt-2 text-sm text-[var(--sage-ink-muted)] leading-relaxed">{e.body}</p>
                          )}
                        </Surface>
                      </li>
                    )
                  })}
                </ol>
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <Section
        eyebrow="what's next"
        heading={<>New work ships<br /><em className="not-italic text-[#0ED3CF]">every week.</em></>}
        lede="Studio engagements, lab products, blog posts, and platform receipts all show up here. Want a thread?"
        centered
        grain
        action={
          <div className="flex flex-wrap items-center justify-center gap-4">
            <CtaLink href="/blog" variant="ghost">
              Read the blog
            </CtaLink>
            <CtaLink href="/lab" variant="ghost">
              See lab products
            </CtaLink>
            <CtaLink href="/contact" variant="solid" event="cta_changelog_footer">
              Start a conversation
            </CtaLink>
          </div>
        }
      />
    </div>
  )
}
