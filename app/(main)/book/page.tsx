import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, ArrowRight } from 'lucide-react'
import { FounderPortrait } from '@/components/founder-portrait'
import { Hairline, MonoLabel, Surface, CtaLink } from '@/components/el'
import { ConversionMap, MotionProofStrip, SystemHeroPanel } from '@/components/living/LivingPageSystem'
import { PublicScheduler } from '@/components/booking/public-scheduler'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.sageideas.dev/book' },
  title: 'Book a Build Call for Your AI System or Conversion Site | Sage Ideas',
  description:
    'Book a 30-minute build call with Sage Ideas. Bring the business leak, review the right demo, and leave with the next build step.',
  openGraph: {
    title: 'Book a Build Call | Sage Ideas',
    description: '30 minutes. Bring the leak, open the demo, and map the build path.',
    images: [{ url: '/og?title=Book+a+Build+Call&subtitle=Map+the+system+before+scope.' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og?title=Book+a+Build+Call&subtitle=Map+the+system+before+scope.'],
  },
}

const PROCESS_STEPS = [
  {
    step: '01',
    label: 'Discovery',
    desc: 'A 30-minute working conversation, not a sales call. We talk through your problem, your constraints, and what success looks like.',
  },
  {
    step: '02',
    label: 'Proposal',
    desc: 'Within 48 hours, you receive a written scope and fixed-price proposal. No ambiguity. You know exactly what you\'re getting.',
  },
  {
    step: '03',
    label: 'Decision',
    desc: 'You sign, we kick off. Or you do not. No pressure and no follow-up sequence. If it is not the right fit, we will say that directly.',
  },
]

const INTAKE_TOPICS = [
  "What you're trying to build or fix",
  "What you've already tried",
  "Your timeline and constraints",
  "Whether a tier is the right fit",
]

type BookSearchParams = Promise<{
  source?: string | string[]
  context?: string | string[]
  tier?: string | string[]
}>

const haloCta =
  'before:pointer-events-none before:absolute before:-inset-3 before:-z-10 before:rounded-[18px] before:bg-[radial-gradient(circle_at_45%_50%,rgba(91,157,255,0.64),transparent_58%)] before:blur-xl before:opacity-60 before:content-[""] hover:before:opacity-90'

export default async function BookPage({ searchParams }: { searchParams: BookSearchParams }) {
  const params = await searchParams
  const source = Array.isArray(params.source) ? params.source[0] : params.source
  const isRevenueOs = source?.startsWith('revenue_os')
  const mailSubject = isRevenueOs ? 'Revenue OS build call request' : 'Build call request'
  const mailBody = isRevenueOs
    ? 'Hi Sage,\n\nI saw the Revenue OS demo and want to talk through what this could look like around my business.\n\nCurrent lead/revenue workflow:\n\nWhat is leaking or slow:\n\nTools we use:\n\nSome times that work for me:\n\nThanks,\n'
    : "Hi Sage,\n\nI'd like to schedule a 30-minute build call.\n\nProject overview:\n\nTimeline:\n\nBudget range:\n\nSome times that work for me:\n\nThanks,\n"
  const mailHref = `mailto:sage@sageideas.dev?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`

  return (
    <div className="min-h-screen bg-[var(--sage-bg)]">

      {/* ── Hero band ── */}
      <section
        aria-labelledby="book-heading"
        className="relative border-b border-[var(--sage-border)] py-20 sm:py-28 lg:py-36"
      >
        {/* Hairline frame rule beneath nav */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[var(--sage-border)]"
        />

        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Eyebrow row */}
          <div className="mb-8 flex items-center gap-4 [font-family:var(--font-mono),ui-monospace,monospace]">
            <MonoLabel tone="accent">book</MonoLabel>
            <Hairline className="flex-1" />
            <MonoLabel tone="faint">{isRevenueOs ? '// revenue os walkthrough' : '// build call'}</MonoLabel>
          </div>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-start">
            {/* Left — headline */}
            <div>
              <h1
                id="book-heading"
                className="font-normal text-[var(--sage-ink)]"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
                  fontSize: 'clamp(2.4rem, 1.2rem + 5vw, 5rem)',
                  lineHeight: 1.0,
                  letterSpacing: '-0.024em',
                }}
              >
                {isRevenueOs ? 'Build the version'
                  : 'Book the build'}
                <br />
                <span
                  className="italic text-[#3D5AFE]"
                  style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 40, 'WONK' 1" }}
                >
                  {isRevenueOs ? 'for your business.' : 'call.'}
                </span>
              </h1>

              <div className="mt-7 flex items-center gap-4" aria-hidden>
                <span className="h-px w-12 bg-[#3D5AFE]" />
                <span className="h-px flex-1 bg-[var(--sage-border-strong)]" />
              </div>

              <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-[var(--sage-ink-muted)]">
                {isRevenueOs
                  ? 'You saw the Revenue OS demo. Bring the messy reality: forms, replies, missed calls, stale follow-ups, and the tools your team already uses. We map what a working version would look like around your business.'
                  : 'Bring the leak, the goal, and the constraints. We look at the right demo, map the build path, and decide if Sage Ideas is the right fit.'}
              </p>

              {/* Primary CTA */}
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <CtaLink
                  variant="solid"
                  href="#schedule"
                  event="booking_click"
                  eventProps={{ location: 'book_hero', label: 'pick_a_time', source: source ?? 'direct' }}
                  className={haloCta}
                >
                  {isRevenueOs ? 'Pick a walkthrough time' : 'Pick a time'}
                </CtaLink>
                <a
                  href={mailHref}
                  className="group inline-flex h-12 items-center gap-2.5 rounded-[3px] border border-[var(--sage-border-strong)] px-6 text-[13px] uppercase tracking-[0.08em] text-[var(--sage-ink-muted)] transition-colors duration-200 [font-family:var(--font-mono),ui-monospace,monospace] hover:border-[var(--sage-border-hover)] hover:text-[var(--sage-ink)]"
                >
                  <span>email directly</span>
                  <span aria-hidden className="text-[var(--sage-ink-faint)] transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                </a>
              </div>
            </div>

            <SystemHeroPanel
              eyebrow="booking graph"
              title={isRevenueOs ? 'Revenue OS fit map' : 'Call decision map'}
              nodes={isRevenueOs ? ['Lead leak', 'Workflow', 'Build path', 'Proposal'] : ['Context', 'Fit', 'Scope', 'Proposal']}
              stats={[
                { label: 'duration', value: '30m' },
                { label: 'proposal', value: '48h' },
                { label: 'pitch deck', value: '0' },
              ]}
            />
          </div>
          <div className="mt-12">
            <MotionProofStrip
              items={[
                { label: 'call length', value: '30 min' },
                { label: 'written proposal', value: '48h' },
                { label: isRevenueOs ? 'workflow map' : 'sales pressure', value: isRevenueOs ? 'live' : '0' },
                { label: 'builder on call', value: 'Jason' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── Live scheduler ── */}
      <section id="schedule" aria-label="Pick a time" className="scroll-mt-24 border-b border-[var(--sage-border)] py-14 sm:py-18">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="mb-6 flex items-center gap-4">
            <MonoLabel tone="accent">{'// schedule'}</MonoLabel>
            <Hairline className="flex-1" strong />
            <MonoLabel tone="faint">{'// 30 min · free'}</MonoLabel>
          </div>
          <PublicScheduler />
          <p className="mt-5 text-center text-[13px] text-[var(--sage-ink-faint)]">
            Prefer not to pick a time now? Use the structured intake below for a written reply within 24 hours.
          </p>
        </div>
      </section>

      <section className="border-b border-[var(--sage-border)] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-10 flex items-center gap-4">
            <MonoLabel tone="muted">{'// decision route'}</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>
          <ConversionMap
            steps={[
              { label: 'Bring context', detail: INTAKE_TOPICS.join(', ') + '.' },
              { label: 'Pressure-test fit', detail: 'We decide whether a productized tier, custom scope, academy route, or no engagement is right.' },
              { label: 'Define next step', detail: 'If there is a fit, the next step is written: scope, price, timeline, and owner.' },
              { label: 'Move cleanly', detail: 'You either get a proposal or a clear reason not to proceed. No drip campaign.' },
            ]}
          />
        </div>
      </section>

      {/* ── Two ways to start ── */}
      <section aria-label="Ways to engage" className="border-b border-[var(--sage-border)] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">

          <div className="mb-10 flex items-center gap-4">
            <Hairline className="hidden flex-1 sm:block" />
            <MonoLabel tone="muted">{'// two ways to start'}</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Option A — structured intake */}
            <Link
              href="/contact?type=consult&source=book"
              className="group relative rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-6 transition-[border-color,background-color] duration-200 hover:border-[var(--sage-border-hover)] hover:bg-[var(--sage-surface-2)]"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-[3px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-2)]">
                  <Mail className="h-4 w-4 text-[#3D5AFE]" />
                </span>
                <MonoLabel tone="accent" className="text-[#3D5AFE]">recommended</MonoLabel>
              </div>
              <h2
                className="mb-2 text-[1.15rem] font-normal text-[var(--sage-ink)]"
                style={{ fontFamily: 'var(--font-display)', fontVariationSettings: "'opsz' 64" }}
              >
                Structured intake
              </h2>
              <p className="text-[13px] leading-relaxed text-[var(--sage-ink-muted)]">
                A 5-minute form. You get a written reply within 24 hours with a recommended path, scope, and ballpark price. No call required to start.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-[#3D5AFE] [font-family:var(--font-mono),ui-monospace,monospace]">
                Start intake
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>

            {/* Option B — direct email */}
            <a
              href={mailHref}
              className="group relative rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-6 transition-[border-color,background-color] duration-200 hover:border-[var(--sage-border-hover)] hover:bg-[var(--sage-surface-2)]"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-[3px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-2)]">
                  <ArrowRight className="h-4 w-4 text-[var(--sage-ink-muted)]" />
                </span>
                <MonoLabel tone="faint">direct</MonoLabel>
              </div>
              <h2
                className="mb-2 text-[1.15rem] font-normal text-[var(--sage-ink)]"
                style={{ fontFamily: 'var(--font-display)', fontVariationSettings: "'opsz' 64" }}
              >
                Email Sage directly
              </h2>
              <p className="text-[13px] leading-relaxed text-[var(--sage-ink-muted)]">
                Prefer to skip the form? Reply with project overview, timeline, budget range, and times that work. You will get scheduling options back same day.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-[var(--sage-ink-muted)] [font-family:var(--font-mono),ui-monospace,monospace]">
                sage@sageideas.dev
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Founder + process ── */}
      <section aria-label="Process and founder" className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">

          {/* Founder block */}
          <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
            <div className="shrink-0">
              <FounderPortrait size="md" caption={false} />
              <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]">
                Jason Teixeira
              </p>
            </div>
            <Surface level={2} className="flex-1 px-6 py-5">
              <MonoLabel tone="muted" className="mb-3">{'// from the founder'}</MonoLabel>
              <p className="text-[15px] leading-relaxed text-[var(--sage-ink-muted)]">
                &ldquo;I take these calls myself. No sales rep, no account manager. If we&rsquo;re a fit,
                I&rsquo;ll tell you exactly what I&rsquo;d build, how long it takes, and what it costs.
                If we&rsquo;re not, I&rsquo;ll tell you that too.&rdquo;
              </p>
            </Surface>
          </div>

          <Hairline accentLead className="mb-12" />

          {/* Process steps */}
          <div className="mb-8 flex items-center gap-4">
            <Hairline className="hidden flex-1 sm:block" />
            <MonoLabel tone="muted">{'// what happens next'}</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>

          <div className="grid gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] sm:grid-cols-3">
            {PROCESS_STEPS.map((item) => (
              <div
                key={item.step}
                className="flex flex-col gap-3 bg-[var(--sage-surface-1)] px-5 py-6 [font-family:var(--font-mono),ui-monospace,monospace]"
              >
                <MonoLabel tone="accent" as="p">{`// ${item.step}`}</MonoLabel>
                <p
                  className="text-base font-normal text-[var(--sage-ink)]"
                  style={{ fontFamily: 'var(--font-display)', fontVariationSettings: "'opsz' 64" }}
                >
                  {item.label}
                </p>
                <p className="text-[13px] leading-relaxed text-[var(--sage-ink-muted)]">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <CtaLink
              variant="solid"
              href={isRevenueOs ? '/contact?type=consult&source=revenue_os_book' : '/contact?type=consult&source=book'}
              event="booking_click"
              eventProps={{ location: 'book_footer', label: 'structured_intake', source: source ?? 'direct' }}
              className={haloCta}
            >
              {isRevenueOs ? 'Map my Revenue OS' : 'Start intake'}
            </CtaLink>
            <CtaLink variant="ghost" href="/pricing?source=book_footer">
              Compare pricing
            </CtaLink>
          </div>
        </div>
      </section>

    </div>
  )
}
