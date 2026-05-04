import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Home } from 'lucide-react'

export const metadata: Metadata = {
  title: '404 — Not Found',
  description: 'This page either moved, never existed, or failed its own smoke test.',
  robots: { index: false, follow: false },
}

const HELPFUL_LINKS = [
  { href: '/work', label: 'Recent work', desc: 'Five case studies, real artifacts' },
  { href: '/services/studio-engagement', label: 'Studio Engagement', desc: 'Embedded delivery, by application' },
  { href: '/pricing', label: 'Pricing', desc: 'Three transparent lanes' },
  { href: '/founder', label: 'Founder', desc: 'Who you’re actually talking to' },
  { href: '/process', label: 'Process', desc: 'How an engagement runs' },
  { href: '/contact', label: 'Contact', desc: 'Start a conversation' },
]

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-[#09090B] flex items-center">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/30 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#FCA5A5]">
                Status 404 · route not found
              </span>
            </div>
            <h1 className="text-7xl sm:text-8xl font-bold text-[#FAFAFA] leading-none tracking-tight">
              404.
            </h1>
            <p className="mt-6 text-lg text-[#A1A1AA] leading-relaxed max-w-md">
              This page either moved, never existed, or failed its own smoke test. Either way — not your fault. Here are the routes that do work.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-[#06B6D4] hover:bg-[#22D3EE] text-[#09090B] font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                <Home className="h-4 w-4" />
                Back home
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-[#27272A] hover:border-[#3F3F46] text-[#FAFAFA] font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                Report a broken link
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#71717A] mb-4">
              Try one of these
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {HELPFUL_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group rounded-xl border border-[#27272A] bg-[#0F0F12] hover:border-[#06B6D4]/60 hover:bg-[#0F0F12]/80 p-4 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-semibold text-[#FAFAFA]">{l.label}</div>
                    <ArrowRight className="h-3.5 w-3.5 text-[#52525B] group-hover:text-[#06B6D4] group-hover:translate-x-0.5 transition" />
                  </div>
                  <div className="text-xs text-[#A1A1AA]">{l.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
