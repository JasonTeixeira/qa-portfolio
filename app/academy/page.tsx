import type { Metadata } from 'next'
import Link from 'next/link'
import { NewsletterSignup } from '@/components/newsletter-signup'
import { ConversionMap, MotionProofStrip, SystemHeroPanel } from '@/components/living/LivingPageSystem'
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
              className="max-w-[11ch] text-[clamp(3.5rem,1.2rem+9vw,8rem)] font-extrabold"
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
            <h2 className="text-[clamp(2.3rem,1.2rem+4vw,5rem)] font-extrabold" style={displayStyle}>
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
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.2fr)]">
            <div>
              <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                Curriculum
              </p>
              <h2 className="text-[clamp(2.3rem,1.2rem+4vw,5rem)] font-extrabold" style={displayStyle}>
                Built as the studio builds.
              </h2>
            </div>
            <div className="grid gap-px bg-[var(--sage-border)] sm:grid-cols-2">
              {academyTracks.map((track) => (
                <Link
                  className="group bg-[var(--sage-surface-1)] p-6 transition-colors hover:bg-[var(--sage-surface-2)]"
                  href={`/academy/${track.slug}`}
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
                </Link>
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
            <h2 className="text-[clamp(2.3rem,1.2rem+4vw,5rem)] font-extrabold" style={displayStyle}>
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

      <section id="join" className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(320px,0.7fr)] lg:items-center">
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              First cohort
            </p>
            <h2 className="text-[clamp(2.5rem,1.2rem+5vw,6rem)] font-extrabold" style={displayStyle}>
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
