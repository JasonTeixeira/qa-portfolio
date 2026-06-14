import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Home } from 'lucide-react'
import { Hairline, MonoLabel, Surface, CtaLink } from '@/components/el'

export const metadata: Metadata = {
  title: '404 — route not on the map',
  description: 'This page either moved, never existed, or failed its own smoke test.',
  robots: { index: false, follow: false },
}

const HELPFUL_LINKS = [
  { href: '/work', label: 'work/', desc: 'six case studies. real artifacts.' },
  { href: '/services', label: 'services/', desc: 'nine fixed-price engagements.' },
  { href: '/pricing', label: 'pricing.md', desc: 'three lanes. one calculator.' },
  { href: '/founder', label: 'founder.md', desc: 'who you\'re actually talking to.' },
  { href: '/process', label: 'process.md', desc: 'how an engagement runs.' },
  { href: '/contact', label: 'contact()', desc: 'broken link? we want it.' },
]

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center bg-[var(--sage-bg)]">
      <div className="mx-auto w-full max-w-5xl px-5 py-24 sm:px-8">

        {/* Eyebrow */}
        <div className="mb-8 flex items-center gap-4 [font-family:var(--font-mono),ui-monospace,monospace]">
          <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[var(--sage-coral)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--sage-coral)]" aria-hidden />
            exit 404 · route not on the map
          </span>
          <Hairline className="flex-1" />
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">

          {/* Left — 404 headline + CTAs */}
          <div>
            {/* Terminal trace surface */}
            <Surface level={1} className="mb-8 [font-family:var(--font-mono),ui-monospace,monospace]">
              <div className="border-b border-[var(--sage-border)] px-5 py-3">
                <MonoLabel tone="faint">{'// request trace'}</MonoLabel>
              </div>
              <div className="space-y-0.5 px-5 py-4 text-[11px] leading-relaxed">
                <div>
                  <span className="text-[#0ED3CF]">$</span>{' '}
                  <span className="text-[var(--sage-ink-muted)]">curl -I sageideas.dev/&lt;requested-route&gt;</span>
                </div>
                <div className="text-[var(--sage-coral)]">HTTP/2 404</div>
                <div className="text-[var(--sage-ink-faint)]">x-sage-reason: route-not-found</div>
                <div className="text-[var(--sage-ink-faint)]">x-sage-fallback: shown below</div>
              </div>
            </Surface>

            <h1
              className="font-normal text-[var(--sage-ink)]"
              style={{
                fontFamily: 'var(--font-display)',
                fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
                fontSize: 'clamp(4rem, 2rem + 10vw, 9rem)',
                lineHeight: 1.0,
                letterSpacing: '-0.03em',
              }}
            >
              404<span className="text-[#0ED3CF]">.</span>
            </h1>

            <Hairline accentLead className="mt-6 max-w-xs" />

            <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-[var(--sage-ink-muted)]">
              Route not on the map. Either it moved, never existed, or it failed its own smoke test.
              Either way — not your fault. The doors that <em className="not-italic text-[#0ED3CF]">do</em> open are on the right.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink variant="solid" href="/">
                <Home className="h-3.5 w-3.5" aria-hidden />
                cd ~
              </CtaLink>
              <CtaLink variant="ghost" href="/contact?subject=broken-link">
                report --broken
              </CtaLink>
            </div>

            <p className="mt-6 text-[10px] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]">
              {'// tip: press ⌘K from anywhere to jump around'}
            </p>
          </div>

          {/* Right — valid routes grid */}
          <div>
            <div className="mb-4 flex items-center gap-4">
              <Hairline className="hidden flex-1 sm:block" />
              <MonoLabel tone="faint">{'// ls valid-routes/'}</MonoLabel>
              <Hairline className="flex-1" strong />
            </div>

            <div className="grid gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] sm:grid-cols-2">
              {HELPFUL_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group flex flex-col gap-1.5 bg-[var(--sage-surface-1)] p-4 transition-[background-color,border-color] duration-200 hover:bg-[var(--sage-surface-2)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-[var(--sage-ink)] [font-family:var(--font-mono),ui-monospace,monospace]">
                      {l.label}
                    </span>
                    <ArrowRight
                      className="h-3 w-3 text-[var(--sage-ink-faint)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#0ED3CF]"
                      aria-hidden
                    />
                  </div>
                  <span className="text-[11px] text-[var(--sage-ink-muted)]">{l.desc}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
