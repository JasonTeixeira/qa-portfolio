import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Home } from 'lucide-react'

export const metadata: Metadata = {
  title: '404 — route not on the map',
  description: 'This page either moved, never existed, or failed its own smoke test.',
  robots: { index: false, follow: false },
}

const HELPFUL_LINKS = [
  { href: '/work', label: 'work/', desc: 'six case studies. real artifacts.' },
  { href: '/services', label: 'services/', desc: 'nine fixed-price engagements.' },
  { href: '/pricing', label: 'pricing.md', desc: 'three lanes. one calculator.' },
  { href: '/founder', label: 'founder.md', desc: 'who you’re actually talking to.' },
  { href: '/process', label: 'process.md', desc: 'how an engagement runs.' },
  { href: '/contact', label: 'contact()', desc: 'broken link? we want it.' },
]

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-[#09090B] flex items-center sage-grid-noise">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E85D3A]/10 border border-[#E85D3A]/30 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E85D3A] animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#E85D3A]">
                exit 404 · route not on the map
              </span>
            </div>

            <div className="font-mono text-[11px] leading-relaxed text-[#78716C] mb-6 space-y-0.5">
              <div><span className="text-[#0ED3CF]">$</span> curl -I sageideas.dev/&lt;requested-route&gt;</div>
              <div className="text-[#E85D3A]">HTTP/2 404</div>
              <div>x-sage-reason: route-not-found</div>
              <div>x-sage-fallback: shown below</div>
            </div>

            <h1
              className="text-7xl sm:text-8xl lg:text-9xl font-normal text-[#FAFAFA] leading-none tracking-tight sage-glitch"
              data-text="404."
            >
              404.
            </h1>
            <p className="mt-6 text-lg text-[#A8A29E] leading-relaxed max-w-md">
              Route not on the map. Either it moved, never existed, or it failed its own smoke test.
              Either way — not your fault. The doors that <em className="not-italic text-[#0ED3CF]">do</em> open are on the right.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="sage-neon-cta sage-bloom-cyan inline-flex items-center gap-2 bg-[#0ED3CF] hover:bg-[#0AA8A5] text-[#09090B] font-semibold px-5 py-2.5 rounded-md transition-colors [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-wide text-sm"
              >
                <Home className="h-4 w-4" />
                cd ~
              </Link>
              <Link
                href="/contact?subject=broken-link"
                className="inline-flex items-center gap-2 border border-[#2A2826] hover:border-[#3D3A37] text-[#FAFAFA] font-medium px-5 py-2.5 rounded-md transition-colors [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-wide text-sm"
              >
                report --broken
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 text-xs text-[#57534E] [font-family:var(--font-mono),ui-monospace,monospace]">
              {'// tip: press ⌘K from anywhere to jump around'}
            </div>
          </div>

          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#78716C] mb-4">
              ls valid-routes/
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {HELPFUL_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group rounded-xl border border-[#2A2826] bg-[#12110F] hover:border-[#0ED3CF]/60 hover:bg-[#12110F]/80 p-4 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-semibold text-[#FAFAFA] [font-family:var(--font-mono),ui-monospace,monospace]">{l.label}</div>
                    <ArrowRight className="h-3.5 w-3.5 text-[#57534E] group-hover:text-[#0ED3CF] group-hover:translate-x-0.5 transition" />
                  </div>
                  <div className="text-xs text-[#A8A29E]">{l.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
