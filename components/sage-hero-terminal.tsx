'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { HeroManifest } from '@/components/hero/HeroManifest'
import { EASE_OUT_QUINT } from '@/lib/motion/presets'
import { trackEvent } from '@/lib/analytics/events'

interface Project {
  name: string
  url: string
  screenshot: string
  accent: string
}

interface SageHeroTerminalProps {
  logoMark?: React.ReactNode
  projects?: Project[]
}

/**
 * SageHeroTerminal — "Engineered Luxury" flagship hero.
 *
 * Linear × Swiss-watch brochure: dark, restrained, precise. A hairline-framed
 * editorial composition — huge Fraunces display headline against tiny mono
 * eyebrows, one electric-teal accent used sparingly, layered surfaces + grain
 * for depth, and a precise mono "system status" line as the signature moment.
 *
 * Accessibility:
 * - One real H1 carries the marketing headline as the accessible name.
 * - The visible display headline is aria-hidden (duplicate of the H1 text).
 * - Decorative manifest panel is aria-hidden.
 * - One orchestrated load reveal; reduced-motion is honored globally via
 *   MotionConfig (durations collapse to 0 — elements land at rest).
 */
export default function SageHeroTerminal(_props: SageHeroTerminalProps) {
  // Single orchestrated cascade. Slow, expensive easing. y-only on the
  // headline (opacity stays 1) so the browser can measure it as LCP on
  // first paint without a fade.
  const reveal = (delay: number, fade = true) => ({
    initial: { opacity: fade ? 0 : 1, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.85, ease: EASE_OUT_QUINT, delay },
  })

  return (
    <section
      aria-label="Sage Ideas Studio — introduction"
      className="sage-grain relative isolate w-full overflow-hidden bg-[var(--sage-bg)]"
    >
      {/* ── Atmosphere: soft radial depth + faint baseline grid. No blobs. ── */}
      <div aria-hidden className="sage-depth pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="sage-baseline pointer-events-none absolute inset-0 opacity-[0.6]"
      />
      {/* Hairline top + bottom frame rules that bracket the whole hero band. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[88px] h-px bg-[var(--sage-border)]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-28 sm:px-8 sm:pt-32 lg:pb-28 lg:pt-40">
        {/* ── Eyebrow row: status sigil + mono section marker, ruled. ── */}
        <motion.div
          {...reveal(0.05)}
          className="mb-10 flex items-center gap-4 [font-family:var(--font-mono),ui-monospace,monospace]"
        >
          <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[var(--sage-ink-muted)]">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-[#0ED3CF] [animation:status-dot_2.6s_ease-in-out_infinite] motion-reduce:animate-none" />
              <span className="absolute inset-0 rounded-full bg-[#0ED3CF]" />
            </span>
            accepting Q3
          </span>
          <span className="h-px flex-1 bg-[var(--sage-border)]" aria-hidden />
          <span className="text-[10px] uppercase tracking-[0.24em] text-[var(--sage-ink-faint)]">
            // sage ideas · studio
          </span>
        </motion.div>

        <div className="grid grid-cols-1 gap-x-12 gap-y-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
          {/* ════ LEFT — editorial headline + meta ════ */}
          <div className="flex flex-col">
            {/* Real, single H1 (visually hidden, accessible name) */}
            <h1 className="sr-only">
              Sage Ideas — a studio that ships production AI and web systems with
              the receipts to prove it
            </h1>

            {/* Display headline — Fraunces, huge optical size, one italic accent.
                aria-hidden duplicate of the H1; opacity:1 entrance for LCP. */}
            <motion.p
              {...reveal(0.12, false)}
              aria-hidden
              className="font-normal text-[var(--sage-ink)]"
              style={{
                fontFamily: 'var(--font-display)',
                fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
                fontSize: 'clamp(2.65rem, 1.1rem + 6.6vw, 6.25rem)',
                lineHeight: 0.98,
                letterSpacing: '-0.028em',
              }}
            >
              Ships production
              <br />
              systems. Carries
              <br />
              the{' '}
              <span
                className="italic text-[#0ED3CF]"
                style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 40, 'WONK' 1" }}
              >
                receipts
              </span>
              <span className="text-[#0ED3CF]">.</span>
            </motion.p>

            {/* Accent hairline — single sharp signal beneath the headline. */}
            <motion.div
              {...reveal(0.22)}
              aria-hidden
              className="mt-9 flex items-center gap-4"
            >
              <span className="h-px w-16 bg-[#0ED3CF]" />
              <span className="h-px flex-1 bg-[var(--sage-border-strong)]" />
            </motion.div>

            {/* Lede — Geist, generous measure. */}
            <motion.p
              {...reveal(0.3)}
              className="mt-7 max-w-[54ch] text-[15px] leading-[1.75] text-[var(--sage-ink-muted)] sm:text-base"
            >
              A solo, founder-led studio that builds AI agents, voice systems, and
              web platforms for founders who measure outcomes — not promises.
              Productized engagements, transparent pricing, callable references.
            </motion.p>

            {/* CTAs */}
            <motion.div
              {...reveal(0.38)}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/book"
                onClick={() => trackEvent('booking_click', { location: 'hero' })}
                className="group relative inline-flex h-12 items-center gap-2.5 rounded-[3px] bg-[#0ED3CF] px-6 text-[13px] font-medium uppercase tracking-[0.08em] text-[#08110F] transition-[background-color,box-shadow,transform] duration-200 ease-out [font-family:var(--font-mono),ui-monospace,monospace] hover:bg-[#33EBE8] hover:shadow-[0_0_28px_-4px_rgba(14,211,207,0.55)] focus-visible:outline-none active:translate-y-px"
              >
                <span>./book</span>
                <span
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
              <Link
                href="/work"
                onClick={() =>
                  trackEvent('cta_click', {
                    location: 'hero',
                    label: 'ls work/',
                    href: '/work',
                  })
                }
                className="group inline-flex h-12 items-center gap-2.5 rounded-[3px] border border-[var(--sage-border-strong)] px-6 text-[13px] uppercase tracking-[0.08em] text-[var(--sage-ink-muted)] transition-colors duration-200 [font-family:var(--font-mono),ui-monospace,monospace] hover:border-[var(--sage-border-hover)] hover:text-[var(--sage-ink)]"
              >
                <span>ls work/</span>
                <span
                  aria-hidden
                  className="text-[var(--sage-ink-faint)] transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </motion.div>

            {/* ── Trust strip — small-caps mono, numbered + ruled "receipts" ── */}
            <motion.dl
              {...reveal(0.46)}
              className="mt-14 grid max-w-xl grid-cols-3 gap-px overflow-hidden rounded-[2px] border border-[var(--sage-border)] bg-[var(--sage-border)] [font-family:var(--font-mono),ui-monospace,monospace]"
            >
              {[
                { k: 'productized', v: 'engagements' },
                { k: '< 24h', v: 'response' },
                { k: 'callable', v: 'references' },
              ].map((item) => (
                <div
                  key={item.v}
                  className="flex flex-col gap-1.5 bg-[var(--sage-surface-1)] px-4 py-4"
                >
                  <dt className="text-[12px] tracking-tight text-[var(--sage-ink)]">
                    {item.k}
                  </dt>
                  <dd className="text-[9px] uppercase tracking-[0.2em] text-[var(--sage-ink-faint)]">
                    {item.v}
                  </dd>
                </div>
              ))}
            </motion.dl>
          </div>

          {/* ════ RIGHT — receipts manifest (desktop only) ════ */}
          <motion.div
            {...reveal(0.34)}
            className="hidden lg:block lg:pt-2"
          >
            <HeroManifest />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
