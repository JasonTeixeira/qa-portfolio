import type { Metadata } from 'next'
import {
  LivingCTA,
  LivingHero,
  LivingPageShell,
  LivingSection,
  SystemHeroPanel,
} from '@/components/living/LivingPageSystem'
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
  fontFamily: 'var(--font-serif)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
  letterSpacing: '-0.024em',
  lineHeight: 1.02,
}

const TAG_STYLE: Record<ChangelogEntry['tag'], { label: string; cls: string }> = {
  feat: { label: 'feat', cls: 'border-[rgba(61,90,254,0.42)] bg-[rgba(61,90,254,0.10)] text-[var(--sage-accent-readable)]' },
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
    <LivingPageShell>
      <LivingHero
        eyebrow="Studio · changelog"
        title={<>Everything shipped, dated.</>}
        lede={
          <>
            A real release feed for the studio: features, fixes, content, and infrastructure,
            grouped by month and ordered most recent first.
          </>
        }
        primaryCta={{ label: 'Read the feed', href: '#feed' }}
        secondaryCta={{ label: 'Read the blog', href: '/blog' }}
        proof={[
          { label: 'shipped', value: String(totalShipped) },
          { label: 'months', value: String(groups.length) },
          { label: 'cadence', value: 'weekly' },
          { label: 'source', value: 'repo' },
        ]}
        panel={
          <SystemHeroPanel
            eyebrow="Release ledger"
            title="Visible shipping system"
            nodes={['Feature', 'Fix', 'Content', 'Infra']}
            stats={[
              { label: 'feed', value: 'dated' },
              { label: 'order', value: 'recent' },
              { label: 'claim', value: 'real' },
            ]}
          />
        }
      />

      <LivingSection
        id="feed"
        eyebrow="release feed"
        title="The work has a trail."
        lede="This page exists to make momentum inspectable. No vague claims about shipping speed, just dated entries."
      >
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block" aria-label="Jump to month">
            <div className="sticky top-24 space-y-1">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
                Jump to
              </div>
              {groups.map((g) => (
                <a
                  key={g.key}
                  href={`#${g.key}`}
                  className="block py-1 text-sm text-[var(--sage-ink-muted)] transition hover:text-[var(--sage-ink)]"
                >
                  {g.label}
                </a>
              ))}
            </div>
          </aside>

          <div className="space-y-16">
            {groups.map((g) => (
              <section key={g.key} id={g.key} className="scroll-mt-24">
                <div className="mb-6 flex items-baseline gap-3 border-t border-[var(--sage-border)] pt-6">
                  <h2
                    className="text-2xl font-semibold text-[var(--sage-ink)]"
                    style={HEADING_STYLE}
                  >
                    {g.label}
                  </h2>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
                    {g.items.length} {g.items.length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>

                <ol className="relative space-y-4">
                  <span
                    aria-hidden="true"
                    className="absolute bottom-2 left-[7px] top-2 w-px bg-[var(--sage-border)]"
                  />

                  {g.items.map((e, idx) => {
                    const tag = TAG_STYLE[e.tag]
                    return (
                      <li key={`${g.key}-${idx}`} className="relative pl-8">
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-3 h-3.5 w-3.5 rounded-full border border-[var(--sage-border)] bg-[var(--sage-surface-1)]"
                        >
                          <span className="absolute inset-1 rounded-full bg-[var(--sage-accent)]" />
                        </span>

                        <article className="border border-[var(--sage-border)] bg-[rgba(20,20,24,0.70)] p-5 transition hover:border-[rgba(61,90,254,0.46)]">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                              className={[
                                'inline-flex items-center border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]',
                                tag.cls,
                              ].join(' ')}
                            >
                              {tag.label}
                              {e.scope && <span className="ml-1 text-[var(--sage-ink-faint)]">({e.scope})</span>}
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
                              {formatDay(e.date)}
                            </span>
                          </div>
                          <div className="text-sm leading-snug text-[var(--sage-ink)]">{e.title}</div>
                          {e.body && (
                            <p className="mt-2 text-sm leading-relaxed text-[var(--sage-ink-muted)]">{e.body}</p>
                          )}
                        </article>
                      </li>
                    )
                  })}
                </ol>
              </section>
            ))}
          </div>
        </div>
      </LivingSection>

      <LivingSection
        eyebrow="what's next"
        title={<>New work ships every week.</>}
        lede="Studio engagements, lab products, blog posts, and platform receipts all show up here."
      >
        <div className="flex flex-wrap gap-3">
          <LivingCTA href="/blog" variant="secondary">Read the blog</LivingCTA>
          <LivingCTA href="/lab" variant="secondary">See lab products</LivingCTA>
          <LivingCTA href="/book?context=changelog">Start a conversation</LivingCTA>
        </div>
      </LivingSection>
    </LivingPageShell>
  )
}
