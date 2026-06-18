import type { Metadata } from 'next'
import Link from 'next/link'

// Phase 1: Offline fallback shell. Pre-cached by the SW at install time.
export const metadata: Metadata = {
  title: 'Offline',
  description: 'No network — Sage Ideas is waiting for you.',
  robots: { index: false, follow: false },
}

export default function OfflinePage() {
  return (
    <div className="min-h-[80vh] bg-[#09090B] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div
          className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-[#3D5AFE] mb-6"
          aria-hidden
        >
          <span className="inline-block w-2 h-2 rounded-full bg-[#E85D3A] animate-pulse" />
          Offline
        </div>
        <h1
          className="text-4xl sm:text-5xl font-normal text-[#F4F2EF] tracking-tight"
          style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
        >
          No signal.
        </h1>
        <p className="mt-4 text-[#B8B0AB] leading-relaxed">
          You&apos;re offline. The pages you&apos;ve already visited still work — try
          one of these:
        </p>

        <ul className="mt-6 grid grid-cols-2 gap-2 text-left">
          {[
            { href: '/', label: 'Home' },
            { href: '/work', label: 'Work' },
            { href: '/lab', label: 'Lab' },
            { href: '/services', label: 'Services' },
            { href: '/pricing', label: 'Pricing' },
            { href: '/contact', label: 'Contact' },
          ].map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="block rounded-lg border border-[#2A2826] bg-[#12110F] px-3 py-2 text-sm text-[#F4F2EF] hover:border-[#3D5AFE]/40 hover:text-[#3D5AFE] transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <pre
          className="mt-8 text-left text-[11px] font-mono text-[#A8A29E] bg-[#0B0A09] border border-[#2A2826] rounded-lg p-4 overflow-x-auto"
          aria-hidden
        >
{`> ping sage-ideas.dev
request timeout

> retry in 3s
attempting reconnect...`}
        </pre>
      </div>
    </div>
  )
}
