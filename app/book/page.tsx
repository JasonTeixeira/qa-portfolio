import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, ArrowRight } from 'lucide-react'
import { FounderPortrait } from '@/components/founder-portrait'
import { Hairline, MonoLabel, Surface, CtaLink } from '@/components/el'
import { ConversionMap, MotionProofStrip, SystemHeroPanel } from '@/components/living/LivingPageSystem'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.sageideas.dev/book' },
  title: 'Book a Discovery Call',
  description:
    'Schedule a 30-minute discovery call with Sage Ideas. No pitch deck. No obligation. Just a direct conversation about your project.',
  openGraph: {
    title: 'Book a Discovery Call',
    description: "30 minutes. No pitch deck. No obligation.",
    images: [{ url: '/og?title=Book+a+Call&subtitle=Let%27s+talk.' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ["/og?title=Book+a+Call&subtitle=Let%27s+talk."],
  },
}

const PROCESS_STEPS = [
  {
    step: '01',
    label: 'Discovery',
    desc: 'A 30-minute working conversation — not a sales call. We talk through your problem, your constraints, and what success looks like.',
  },
  {
    step: '02',
    label: 'Proposal',
    desc: 'Within 48 hours, you receive a written scope and fixed-price proposal. No ambiguity. You know exactly what you\'re getting.',
  },
  {
    step: '03',
    label: 'Decision',
    desc: 'You sign, we kick off. Or you don\'t — no pressure, no follow-up sequence. If it\'s not the right fit, we\'ll say that directly.',
  },
]

const INTAKE_TOPICS = [
  "What you're trying to build or fix",
  "What you've already tried",
  "Your timeline and constraints",
  "Whether a tier is the right fit",
]

export default function BookPage() {
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
            <MonoLabel tone="faint">{'// discovery call'}</MonoLabel>
          </div>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-start">
            {/* Left — headline */}
            <div>
              <h1
                id="book-heading"
                className="font-normal text-[var(--sage-ink)]"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
                  fontSize: 'clamp(2.4rem, 1.2rem + 5vw, 5rem)',
                  lineHeight: 1.0,
                  letterSpacing: '-0.024em',
                }}
              >
                Book a 30-minute
                <br />
                <span
                  className="italic text-[#3D5AFE]"
                  style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 40, 'WONK' 1" }}
                >
                  discovery call.
                </span>
              </h1>

              <div className="mt-7 flex items-center gap-4" aria-hidden>
                <span className="h-px w-12 bg-[#3D5AFE]" />
                <span className="h-px flex-1 bg-[var(--sage-border-strong)]" />
              </div>

              <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-[var(--sage-ink-muted)]">
                30 minutes. No pitch deck. No obligation. Just a direct conversation about your project — what you&apos;re building, what&apos;s broken, and whether we&apos;re the right fit.
              </p>

              {/* Primary CTA */}
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <CtaLink
                  variant="solid"
                  href="/contact?type=consult&source=book"
                  event="booking_click"
                  eventProps={{ location: 'book_hero', label: 'structured_intake' }}
                >
                  structured intake
                </CtaLink>
                <a
                  href="mailto:sage@sageideas.dev?subject=Discovery%20call%20request&body=Hi%20Sage%2C%0A%0AI%27d%20like%20to%20schedule%20a%2030-minute%20discovery%20call.%0A%0AProject%20overview%3A%0A%0ATimeline%3A%0A%0ABudget%20range%3A%0A%0ASome%20times%20that%20work%20for%20me%3A%0A%0AThanks%2C%0A"
                  className="group inline-flex h-12 items-center gap-2.5 rounded-[3px] border border-[var(--sage-border-strong)] px-6 text-[13px] uppercase tracking-[0.08em] text-[var(--sage-ink-muted)] transition-colors duration-200 [font-family:var(--font-mono),ui-monospace,monospace] hover:border-[var(--sage-border-hover)] hover:text-[var(--sage-ink)]"
                >
                  <span>email directly</span>
                  <span aria-hidden className="text-[var(--sage-ink-faint)] transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                </a>
              </div>
            </div>

            <SystemHeroPanel
              eyebrow="booking graph"
              title="Call decision map"
              nodes={['Context', 'Fit', 'Scope', 'Proposal']}
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
                { label: 'sales pressure', value: '0' },
                { label: 'builder on call', value: 'Jason' },
              ]}
            />
          </div>
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
              href="mailto:sage@sageideas.dev?subject=Discovery%20call%20request&body=Hi%20Sage%2C%0A%0AI%27d%20like%20to%20schedule%20a%2030-minute%20discovery%20call.%0A%0AProject%20overview%3A%0A%0ATimeline%3A%0A%0ABudget%20range%3A%0A%0ASome%20times%20that%20work%20for%20me%3A%0A%0AThanks%2C%0A"
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
                Prefer to skip the form? Reply with project overview, timeline, budget range, and times that work — you&apos;ll get scheduling options back same day.
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
              href="/contact?type=consult&source=book"
              event="booking_click"
              eventProps={{ location: 'book_footer', label: 'structured_intake' }}
            >
              start intake
            </CtaLink>
            <CtaLink variant="ghost" href="/pricing">
              cat pricing.md
            </CtaLink>
          </div>
        </div>
      </section>

    </div>
  )
}
