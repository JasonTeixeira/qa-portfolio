import type { Metadata } from 'next'
import Link from 'next/link'
import { Hairline, MonoLabel, CtaLink, Reveal } from '@/components/el'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.sageideas.dev/pov' },
  title: 'POV',
  description:
    'Why Sage Ideas refuses to ship anything that can’t be rolled back in 30 seconds, and what that decision costs (and saves).',
  openGraph: {
    title: 'POV — The 30-Second Rollback Rule',
    description: 'How Sage Ideas decides what to ship.',
    images: [
      '/og?title=The+30-Second+Rollback+Rule&subtitle=Sage+Ideas+POV',
    ],
  },
}

const rollbackRules = [
  'Every deployment is a single artifact, behind a single switch. Vercel deploy, Docker tag, Terraform apply. One handle.',
  'Database migrations are additive-only. We add columns; we don’t drop them in the same release. We dual-write before we cut over.',
  'Webhook handlers are idempotent and event-deduplicated. Replays are safe by construction — not by hope.',
  'Feature flags wrap every change to user-visible behavior. The flag flip is the rollback.',
  'No release happens without a one-line undo in the runbook. If the undo isn’t obvious, the change isn’t ready.',
]

const DISPLAY_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
  letterSpacing: '-0.024em',
}

export default function POVPage() {
  return (
    <div className="min-h-screen">
      {/* ── Manifesto hero — centered editorial treatment ───────────────────── */}
      <section
        aria-label="Point of view manifesto"
        className="relative border-b border-[var(--sage-border)] py-24 sm:py-32 lg:py-40"
      >
        {/* Faint teal depth wash — no blobs, just atmosphere */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 0%, rgba(61,90,254,0.07) 0%, transparent 70%)',
          }}
        />

        <div className="relative mx-auto max-w-3xl px-5 sm:px-8 text-center">
          {/* Eyebrow row — centered */}
          <div className="mb-10 flex items-center justify-center gap-4">
            <Hairline className="w-12 sm:w-20" />
            <MonoLabel tone="accent">Sage Ideas · POV</MonoLabel>
            <Hairline className="w-12 sm:w-20" />
          </div>

          {/* The statement — Fraunces, largest treatment on the site */}
          <h1
            className="font-normal text-[var(--sage-ink)] leading-[1.04]"
            style={{
              ...DISPLAY_STYLE,
              fontSize: 'clamp(2.25rem, 1rem + 5vw, 5rem)',
            }}
          >
            Why we refuse to ship anything that can&rsquo;t be rolled back in
            30 seconds.
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-base leading-[1.75] text-[var(--sage-ink-muted)] sm:text-lg">
            One rule. It changes what you build, what you charge, and who hires
            you. Worth writing down.
          </p>

          {/* Meta strip */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <MonoLabel tone="faint">Sage Ideas Studio</MonoLabel>
            <span aria-hidden className="text-[var(--sage-ink-faint)]">·</span>
            <MonoLabel tone="faint">~7 min read</MonoLabel>
            <span aria-hidden className="text-[var(--sage-ink-faint)]">·</span>
            <MonoLabel tone="faint">First published 2026</MonoLabel>
          </div>
        </div>
      </section>

      {/* ── Article body ──────────────────────────────────────────────────────── */}
      <article className="mx-auto max-w-3xl px-5 sm:px-8 pb-28 pt-16" aria-label="The 30-second rollback rule">
        <div className="space-y-7 text-base leading-[1.8] text-[var(--sage-ink-muted)] sm:text-lg">

          {/* Lede — elevated */}
          <Reveal>
            <p
              className="text-xl text-[var(--sage-ink)] font-normal leading-[1.65] sm:text-2xl"
              style={DISPLAY_STYLE}
            >
              Most software shipped this year cannot be rolled back. Not in 30
              seconds. Not in 30 minutes. In some cases, not at all without a
              war-room and a written apology to customers.
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <p>
              That is a strategic posture, not an accident. Teams ship one-way
              doors because the incentives reward velocity over reversibility,
              and because nobody fails a sprint review for shipping fast. They
              fail it for shipping slow.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <p>
              The studio takes the opposite bet. Every change we ship to a
              production system either rolls back in under 30 seconds, or it
              doesn&rsquo;t ship that day. That is the rule. It is annoying. It
              is opinionated. It is the single most valuable engineering habit we
              have, and it is the reason a one-person studio can credibly run
              production fintech, billing systems, and AI-native products without
              a 24/7 ops team behind it.
            </p>
          </Reveal>

          {/* Pull quote — the manifesto's central statement */}
          <Reveal delay={0.05}>
            <blockquote className="relative my-12 py-10 border-y border-[var(--sage-border)]">
              {/* Accent lead rule */}
              <div className="absolute left-0 top-0 h-px w-16 bg-[var(--sage-accent-readable)]" aria-hidden />
              <p
                className="text-xl font-normal text-[var(--sage-ink)] leading-[1.5] sm:text-2xl"
                style={DISPLAY_STYLE}
              >
                Every change we ship either rolls back in under 30 seconds, or it
                doesn&rsquo;t ship that day.
              </p>
              <MonoLabel tone="faint" as="p" className="mt-5">
                The rule. Always.
              </MonoLabel>
            </blockquote>
          </Reveal>

          {/* Section: what the rule actually means */}
          <Reveal>
            <div className="mt-4 mb-2 flex items-center gap-4">
              <MonoLabel tone="accent" className="tabular-nums">01</MonoLabel>
              <Hairline className="flex-1" />
              <MonoLabel tone="muted">{'// what it means in practice'}</MonoLabel>
            </div>
            <h2
              className="mt-6 text-2xl font-normal text-[var(--sage-ink)] sm:text-3xl"
              style={DISPLAY_STYLE}
            >
              What &ldquo;30-second rollback&rdquo; actually means.
            </h2>
          </Reveal>

          <Reveal delay={0.05}>
            <p>
              It is not a slogan. It is a literal operational constraint that
              forces a set of design decisions before the first line of code is
              written.
            </p>
          </Reveal>

          {/* Ruled rule list */}
          <Reveal delay={0.05}>
            <div className="space-y-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] my-8">
              {rollbackRules.map((rule, i) => (
                <div key={i} className="flex items-start gap-5 bg-[var(--sage-surface-1)] px-6 py-5">
                  <MonoLabel tone="accent" className="mt-0.5 shrink-0 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </MonoLabel>
                  <span className="text-sm leading-[1.7] text-[var(--sage-ink-muted)] sm:text-base">{rule}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <p>
              That list looks like overhead until the first time something goes
              wrong on a Friday afternoon. Then it looks like the only sane way
              anyone has ever shipped software.
            </p>
          </Reveal>

          {/* Section: the cost */}
          <Reveal>
            <div className="mt-8 mb-2 flex items-center gap-4">
              <MonoLabel tone="accent" className="tabular-nums">02</MonoLabel>
              <Hairline className="flex-1" />
              <MonoLabel tone="muted">{'// the real cost'}</MonoLabel>
            </div>
            <h2
              className="mt-6 text-2xl font-normal text-[var(--sage-ink)] sm:text-3xl"
              style={DISPLAY_STYLE}
            >
              The cost is real. So is the math.
            </h2>
          </Reveal>

          <Reveal delay={0.05}>
            <p>
              The 30-second rule is not free. It adds up-front design time,
              slows certain refactors, and rules out a few flashy patterns that
              look great in conference talks. We have shipped fewer features
              because of it. We have also never had to write a customer apology
              for a billing incident, lost user data, or a deployment we
              couldn&rsquo;t reverse.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <p>
              On Nexural, the studio&rsquo;s production fintech platform, the
              rule shows up as zero billing incidents since launch across
              hundreds of Stripe webhook events, including one stretch where
              Stripe replayed events for a different reason than usual and the
              entire integration kept its composure because it was built to
              assume replays from day one. That is not heroics. That is a
              constraint paying out.
            </p>
          </Reveal>

          {/* Section: why it matters for clients */}
          <Reveal>
            <div className="mt-8 mb-2 flex items-center gap-4">
              <MonoLabel tone="accent" className="tabular-nums">03</MonoLabel>
              <Hairline className="flex-1" />
              <MonoLabel tone="muted">{'// why it matters to you'}</MonoLabel>
            </div>
            <h2
              className="mt-6 text-2xl font-normal text-[var(--sage-ink)] sm:text-3xl"
              style={DISPLAY_STYLE}
            >
              Why this matters for the people who hire us.
            </h2>
          </Reveal>

          <Reveal delay={0.05}>
            <p>
              Most founders don&rsquo;t buy a development engagement because
              they want code. They buy it because they want a system that
              doesn&rsquo;t wake them up at night and doesn&rsquo;t cost them a
              customer when something breaks. Reversibility is the closest thing
              in software to a money-back guarantee on operational pain.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <p>
              When we tell a founder &ldquo;we won&rsquo;t ship this until we can
              roll it back in 30 seconds,&rdquo; we are also telling them: the
              engagement won&rsquo;t end with a binder of tribal knowledge that
              only the original author can decode. The rule forces clarity.
              Clarity transfers.
            </p>
          </Reveal>

          {/* Section: in practice */}
          <Reveal>
            <div className="mt-8 mb-2 flex items-center gap-4">
              <MonoLabel tone="accent" className="tabular-nums">04</MonoLabel>
              <Hairline className="flex-1" />
              <MonoLabel tone="muted">{'// on an engagement'}</MonoLabel>
            </div>
            <h2
              className="mt-6 text-2xl font-normal text-[var(--sage-ink)] sm:text-3xl"
              style={DISPLAY_STYLE}
            >
              What it looks like in practice.
            </h2>
          </Reveal>

          <Reveal delay={0.05}>
            <p>
              On a studio engagement, the rule shows up in three places.{' '}
              <span className="text-[var(--sage-ink)]">During scoping,</span> we agree on
              which surfaces are reversible and which are not, and we plan the
              irreversible ones (data deletes, externally-visible URL changes,
              money movement) in dedicated, slow, double-confirmed batches.{' '}
              <span className="text-[var(--sage-ink)]">During build,</span> every PR
              description includes the rollback note. No note, no merge.{' '}
              <span className="text-[var(--sage-ink)]">During handoff,</span> the
              runbook documents the one-line undo for every shipped surface, in
              the language of the person who has to push the button at 2 a.m.
            </p>
          </Reveal>

          {/* Section: the studio's bet */}
          <Reveal>
            <div className="mt-8 mb-2 flex items-center gap-4">
              <MonoLabel tone="accent" className="tabular-nums">05</MonoLabel>
              <Hairline className="flex-1" />
              <MonoLabel tone="muted">{'// the bet'}</MonoLabel>
            </div>
            <h2
              className="mt-6 text-2xl font-normal text-[var(--sage-ink)] sm:text-3xl"
              style={DISPLAY_STYLE}
            >
              The studio takes one bet on every engagement.
            </h2>
          </Reveal>

          <Reveal delay={0.05}>
            <p>
              The bet is that founders who hire a studio in 2026 are tired of
              the velocity-over-reversibility trade and ready to pay for the
              other side. We win that bet about as often as we lose it. The
              people who get it become long-term clients. The people who
              don&rsquo;t go elsewhere. Both outcomes are fine.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <p>
              The studio is going to keep shipping software the same way for the
              same reason a good kitchen keeps a clean line: not because anyone
              is watching, but because the cost of doing it the other way is
              higher than it looks until the day it isn&apos;t.
            </p>
          </Reveal>

          {/* Closing statement — anchored */}
          <Reveal delay={0.05}>
            <p
              className="mt-8 text-xl font-normal text-[var(--sage-ink)] leading-[1.6] sm:text-2xl"
              style={DISPLAY_STYLE}
            >
              If you can&rsquo;t roll it back in 30 seconds, it&apos;s not done
              shipping yet. Everything else follows from that.
            </p>
          </Reveal>
        </div>

        {/* ── Sign-off ──────────────────────────────────────────────────────── */}
        <Reveal delay={0.05}>
          <div className="mt-16 pt-10 border-t border-[var(--sage-border)]">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <MonoLabel tone="faint" as="p" className="mb-2">Written by</MonoLabel>
                <p
                  className="text-base font-normal text-[var(--sage-ink)]"
                  style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
                >
                  Jason Teixeira
                </p>
                <MonoLabel tone="muted" as="p" className="mt-1">Founder, Sage Ideas Studio</MonoLabel>
              </div>
              <CtaLink href="/book" variant="solid" event="pov_book_cta">
                Bring this rule to your next engagement
              </CtaLink>
            </div>
          </div>
        </Reveal>
      </article>

      {/* ── Related work ─────────────────────────────────────────────────────── */}
      <section
        aria-label="Related work"
        className="border-t border-[var(--sage-border)] bg-[var(--sage-surface-1)] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <Reveal>
            <div className="mb-7 flex items-center gap-4">
              <MonoLabel tone="muted">{'// where this rule shows up in the work'}</MonoLabel>
              <Hairline className="flex-1" />
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                href: '/work/nexural',
                label: 'Nexural — zero billing incidents across hundreds of Stripe webhooks.',
                tag: 'Case study',
              },
              {
                href: '/work/aws-landing-zone',
                label: 'AWS Landing Zone — every change reversible by Terraform plan.',
                tag: 'Case study',
              },
            ].map((item) => (
              <Reveal key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center justify-between rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-2)] px-6 py-6 transition-colors hover:border-[var(--sage-border-hover)] hover:bg-[var(--sage-surface-3)]"
                >
                  <div className="min-w-0 pr-4">
                    <MonoLabel tone="accent" as="p" className="mb-2">{item.tag}</MonoLabel>
                    <p className="text-sm text-[var(--sage-ink)] leading-[1.6]">{item.label}</p>
                  </div>
                  <span
                    aria-hidden
                    className="shrink-0 text-[var(--sage-ink-faint)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--sage-accent-readable)]"
                  >
                    →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
