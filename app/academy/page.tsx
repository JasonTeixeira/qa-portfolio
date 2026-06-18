import type { Metadata } from 'next'
import Link from 'next/link'
import { NewsletterSignup } from '@/components/newsletter-signup'
import { TrackedLink } from '@/components/analytics/tracked-link'
import { ConversionMap, MotionProofStrip, SystemHeroPanel } from '@/components/living/LivingPageSystem'
import { RouteConversionCta } from '@/components/living/RouteConversionCta'
import { SystemFlowOverlay } from '@/components/living/SystemFlowLayer'
import { academyPrinciples, academyTracks } from '@/data/academy/tracks'

const SITE = 'https://www.sageideas.dev'

export const metadata: Metadata = {
  title: 'Academy',
  description:
    'Sage Ideas Academy: practical lessons on AI-native product building, premium conversion sites, content engines, and automation systems from the studio build record.',
  alternates: { canonical: `${SITE}/academy` },
  openGraph: {
    title: 'Sage Ideas Academy',
    description:
      'Learn the product, brand, AI, and growth systems behind the Sage Ideas studio.',
    images: ['/og?title=Sage+Ideas+Academy&subtitle=Learn+the+system+behind+the+builds.'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og?title=Sage+Ideas+Academy&subtitle=Learn+the+system+behind+the+builds.'],
  },
}

const displayStyle = {
  fontFamily: 'var(--font-display)',
  letterSpacing: '-0.03em',
  lineHeight: 0.98,
} as const

const academyPathMeta: Record<
  string,
  { bestFor: string; studioPath: string; studioHref: string; proof: string }
> = {
  'ai-native-product-building': {
    bestFor: 'Founders who want to ship AI-native software without confusing demos for products.',
    studioPath: 'Product / SaaS build',
    studioHref: '/services/app-development',
    proof: 'real product architecture',
  },
  'premium-conversion-sites': {
    bestFor: 'Operators who need a site that explains the offer, captures demand, and feels premium.',
    studioPath: 'Conversion site sprint',
    studioHref: '/services/site-starter-marketing',
    proof: 'offer + page system',
  },
  'content-engine': {
    bestFor: 'Builders turning expertise, proof, and operating notes into a durable media engine.',
    studioPath: 'Growth / SEO system',
    studioHref: '/services/content-engine',
    proof: 'topic clusters',
  },
  'ai-automation-systems': {
    bestFor: 'Teams turning repeated work into AI workflows, agents, and internal systems.',
    studioPath: 'AI automation build',
    studioHref: '/services/ai-agent-development',
    proof: 'workflow map',
  },
}

export default function AcademyPage() {
  return (
    <main className="min-h-screen bg-[var(--sage-bg)] text-[var(--sage-ink)]">
      <section className="relative isolate overflow-hidden border-b border-[var(--sage-border)] px-5 pb-20 pt-32 sm:px-8 lg:px-12 lg:pb-28 lg:pt-40">
        <div
          className="absolute inset-0 -z-10 opacity-70"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(rgba(242,239,233,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,233,0.055) 1px, transparent 1px)',
            backgroundSize: '88px 88px',
            maskImage: 'radial-gradient(120% 90% at 28% 20%, #000 20%, transparent 74%)',
          }}
        />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.72fr)] lg:items-end">
          <div>
            <p className="mb-7 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              Sage Academy · forming now
            </p>
            <h1
              className="max-w-[11ch] text-[clamp(3.5rem,_1.2rem_+_9vw,_8rem)] font-extrabold"
              style={displayStyle}
            >
              Learn the system behind the builds.
            </h1>
            <p className="mt-8 max-w-[56ch] text-lg leading-[1.55] text-[var(--sage-ink-muted)] sm:text-xl">
              Practical courses, build logs, templates, and live operating notes for people who
              want to build sharper products, better brands, AI-native workflows, and content
              engines without pretending they run a giant team.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#join"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--sage-accent)] px-6 text-sm font-semibold text-white transition hover:bg-[#5670ff]"
              >
                Join the build list →
              </Link>
              <Link
                href="/blog"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--sage-border)] px-6 text-sm font-semibold text-[var(--sage-ink)] transition hover:border-[var(--sage-accent)]"
              >
                Read the journal ↘
              </Link>
            </div>
          </div>
          <SystemHeroPanel
            eyebrow="academy engine"
            title="Academy funnel map"
            nodes={['Build notes', 'Courses', 'Templates', 'Studio']}
            stats={[
              { label: 'tracks', value: String(academyTracks.length).padStart(2, '0') },
              { label: 'format', value: 'cohort' },
              { label: 'scarcity', value: 'none' },
            ]}
          />
        </div>
        <div className="mx-auto mt-12 max-w-7xl">
          <MotionProofStrip
            items={[
              { label: 'academy tracks', value: String(academyTracks.length) },
              { label: 'source material', value: 'real builds' },
              { label: 'content engine', value: 'weekly' },
              { label: 'upsell path', value: 'studio' },
            ]}
          />
        </div>
      </section>

      <section className="border-b border-[var(--sage-border)] px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              Learning funnel
            </p>
            <h2 className="text-[clamp(2.3rem,_1.2rem_+_4vw,_5rem)] font-extrabold" style={displayStyle}>
              Learn the build. Then choose your path.
            </h2>
            <p className="mt-6 text-lg leading-[1.55] text-[var(--sage-ink-muted)]">
              The academy should feed the content machine, help DIY builders, and create a clean
              route into higher-touch studio work when someone needs implementation.
            </p>
          </div>
          <ConversionMap
            steps={[
              { label: 'Read', detail: 'Build notes and topic hubs capture search intent and founder voice.' },
              { label: 'Learn', detail: 'Course tracks turn repeated studio patterns into teachable systems.' },
              { label: 'Apply', detail: 'Templates and checklists give DIY builders a concrete next step.' },
              { label: 'Hire', detail: 'Qualified buyers route into services when they need the system built for them.' },
            ]}
          />
        </div>
      </section>

      <section className="border-b border-[var(--sage-border)] px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              Track comparison
            </p>
            <h2 className="text-[clamp(2.3rem,_1.2rem_+_4vw,_5rem)] font-extrabold" style={displayStyle}>
              Pick the lesson. Keep the studio path visible.
            </h2>
            <p className="mt-6 text-lg leading-[1.55] text-[var(--sage-ink-muted)]">
              The academy is the DIY path. Every track also shows the matching studio offer for
              people who want the system built instead of studying the blueprint.
            </p>
          </div>
          <div className="grid gap-px bg-[var(--sage-border)] lg:grid-cols-4">
            {academyTracks.map((track, index) => {
              const meta = academyPathMeta[track.slug]
              return (
                <div
                  className="relative min-h-[360px] overflow-hidden bg-[var(--sage-surface-1)] p-5 sm:p-6"
                  key={track.slug}
                >
                  <SystemFlowOverlay
                    variant={index % 2 === 0 ? 'academy' : 'systems'}
                    intensity="quiet"
                  />
                  <div className="relative z-10">
                    <div className="mb-8 flex items-center justify-between gap-4">
                      <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--sage-accent-readable)]">
                        {track.label}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
                        {track.status}
                      </span>
                    </div>
                    <h3 className="text-2xl font-extrabold" style={displayStyle}>
                      {track.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[var(--sage-ink-muted)]">
                      {meta?.bestFor ?? track.audience}
                    </p>
                    <dl className="mt-6 grid gap-px bg-[var(--sage-border)]">
                      <div className="bg-[rgba(11,11,14,0.74)] p-3">
                        <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
                          format
                        </dt>
                        <dd className="mt-2 text-sm text-[var(--sage-ink)]">{track.format}</dd>
                      </div>
                      <div className="bg-[rgba(11,11,14,0.74)] p-3">
                        <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
                          studio path
                        </dt>
                        <dd className="mt-2 text-sm text-[var(--sage-ink)]">
                          {meta?.studioPath ?? 'Studio diagnostic'}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-6 flex flex-col gap-3">
                      <TrackedLink
                        href={`/academy/${track.slug}`}
                        event="academy_track_selected"
                        eventProps={{ slug: track.slug, location: 'academy_comparison' }}
                        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--sage-accent)] px-5 text-sm font-semibold text-white transition hover:bg-[#5670ff]"
                      >
                        View course path -&gt;
                      </TrackedLink>
                      <Link
                        href={meta?.studioHref ?? '/tools/route-finder?source=academy_comparison'}
                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--sage-border-strong)] px-5 text-sm font-semibold text-[var(--sage-ink)] transition hover:border-[var(--sage-accent)]"
                      >
                        Hire this system -&gt;
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--sage-border)] px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.2fr)]">
            <div>
              <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                Curriculum
              </p>
              <h2 className="text-[clamp(2.3rem,_1.2rem_+_4vw,_5rem)] font-extrabold" style={displayStyle}>
                Built as the studio builds.
              </h2>
            </div>
            <div className="grid gap-px bg-[var(--sage-border)] sm:grid-cols-2">
              {academyTracks.map((track) => (
                <TrackedLink
                  className="group bg-[var(--sage-surface-1)] p-6 transition-colors hover:bg-[var(--sage-surface-2)]"
                  href={`/academy/${track.slug}`}
                  event="academy_track_selected"
                  eventProps={{
                    slug: track.slug,
                    title: track.title,
                    location: 'academy_index',
                  }}
                  key={track.slug}
                >
                  <div className="mb-8 flex items-center justify-between gap-4">
                    <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--sage-accent-readable)]">
                      {track.label}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--sage-ink-subtle)]">
                      {track.status === 'forming' ? 'Forming' : 'Open soon'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-extrabold" style={displayStyle}>
                    {track.title}
                  </h3>
                  <p className="mt-4 text-sm leading-[1.65] text-[var(--sage-ink-muted)]">
                    {track.description}
                  </p>
                  <p className="mt-4 text-sm leading-[1.65] text-[var(--sage-ink)]">
                    {track.outcome}
                  </p>
                  <ul className="mt-6 space-y-2">
                    {track.lessons.map((lesson) => (
                      <li
                        className="border-t border-[var(--sage-border)] pt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--sage-ink-subtle)]"
                        key={lesson}
                      >
                        {lesson}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-7 inline-flex font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sage-accent-readable)] group-hover:text-white">
                    View track -&gt;
                  </span>
                </TrackedLink>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--sage-border)] px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:items-start">
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              The rule
            </p>
            <h2 className="text-[clamp(2.3rem,_1.2rem_+_4vw,_5rem)] font-extrabold" style={displayStyle}>
              No guru theater.
            </h2>
            <p className="mt-6 max-w-[52ch] text-lg leading-[1.55] text-[var(--sage-ink-muted)]">
              The academy should make the studio more credible, not cheaper. It teaches from real
              builds, real constraints, and real operating decisions.
            </p>
          </div>
          <ul className="grid gap-px bg-[var(--sage-border)]">
            {academyPrinciples.map((principle, index) => (
              <li
                className="grid gap-4 bg-[var(--sage-surface-1)] p-5 sm:grid-cols-[auto_1fr]"
                key={principle}
              >
                <span className="font-mono text-xs text-[var(--sage-accent-readable)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-sm leading-[1.6] text-[var(--sage-ink-muted)]">{principle}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <RouteConversionCta
        eyebrow="academy to studio"
        title="Learn the system, or have it built."
        body="Readers can stay on the DIY path, use the diagnostic to choose a route, or bring the project straight into the studio when implementation matters more than curriculum."
        primary={{ label: 'Find your route', href: '/tools/route-finder?source=academy_final' }}
        secondary={{ label: 'Book the studio', href: '/book' }}
        variant="academy"
        proof={[
          { label: 'academy tracks', value: String(academyTracks.length) },
          { label: 'source', value: 'real builds' },
          { label: 'studio path', value: 'visible' },
        ]}
      />

      <section id="join" className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(320px,0.7fr)] lg:items-center">
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              First cohort
            </p>
            <h2 className="text-[clamp(2.5rem,_1.2rem_+_5vw,_6rem)] font-extrabold" style={displayStyle}>
              Get the first lessons as they ship.
            </h2>
            <p className="mt-6 max-w-[56ch] text-lg leading-[1.55] text-[var(--sage-ink-muted)]">
              Join the list for build notes, teardown lessons, curriculum drops, and early access
              when the first paid course is ready.
            </p>
          </div>
          <NewsletterSignup
            source="academy"
            headline="Join Sage Academy."
            blurb="Build notes, course drops, and practical systems. No fake scarcity."
          />
        </div>
      </section>
    </main>
  )
}
