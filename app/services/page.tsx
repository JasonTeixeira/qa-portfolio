import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { tiersOrdered, careTiers } from '@/data/services/tiers'
import { SectionLabel } from '@/components/section-label'
import { Button } from '@/components/ui/button'
import { ServicesGrid } from './services-grid'
import { RefreshCw, Sparkles } from 'lucide-react'

const SITE = 'https://www.sageideas.dev'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Nine productized service tiers plus three monthly care retainers from Sage Ideas: fixed scope, fixed price, Stripe checkout. Strategy, web, automation, SEO, content, brand, product, and platform engagements from $750 to $9,500+. Custom packages always available.',
  alternates: { canonical: `${SITE}/services` },
  openGraph: {
    title: 'Services',
    description: 'Nine tiers, three retainers, custom packages on request. Fixed price. No asterisks.',
    images: [{ url: '/og?title=Services&subtitle=Tiers%2C+retainers%2C+and+custom+packages.' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og?title=Services&subtitle=Tiers%2C+retainers%2C+and+custom+packages.'],
  },
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <SectionLabel>Engagements</SectionLabel>
            <h1 className="mt-4 text-5xl sm:text-6xl font-bold text-[#FAFAFA] leading-tight">
              Tiers. Retainers.{' '}
              <span className="text-[#06B6D4]">Custom welcome.</span>
            </h1>
            <p className="mt-6 text-lg text-[#A1A1AA] leading-relaxed max-w-2xl">
              Nine productized engagements with fixed scope and Stripe checkout. Three
              monthly care retainers for ongoing upkeep. And every engagement can be
              custom-scoped — retainers, hybrid packages, multi-month builds. No discovery
              fee, no surprises.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[#71717A]">
              <Link
                href="/capabilities"
                className="inline-flex items-center gap-1.5 text-[#06B6D4] hover:text-[#0EA5E9] transition-colors font-medium"
              >
                See the capability matrix
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[#3F3F46]">·</span>
              <Link
                href="/industries"
                className="inline-flex items-center gap-1.5 text-[#A1A1AA] hover:text-[#06B6D4] transition-colors"
              >
                Browse by industry
              </Link>
              <span className="text-[#3F3F46]">·</span>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 text-[#A1A1AA] hover:text-[#06B6D4] transition-colors"
              >
                Compare every tier
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tier Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <ServicesGrid tiers={tiersOrdered} />
      </section>

      {/* Care retainers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center gap-2 mb-3">
          <RefreshCw className="w-4 h-4 text-[#8B5CF6]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#8B5CF6]">
            Monthly retainers
          </span>
        </div>
        <h2 className="text-3xl font-bold text-[#FAFAFA] mb-3">Care plans</h2>
        <p className="text-[#A1A1AA] mb-8 max-w-2xl">
          Lightweight monthly retainers for teams who already shipped. Cancel anytime.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {careTiers.map((c) => (
            <Link
              key={c.slug}
              href={`/services/${c.slug}`}
              className="group rounded-2xl border border-[#8B5CF6]/20 bg-gradient-to-br from-[#8B5CF6]/[0.04] to-transparent p-6 hover:border-[#8B5CF6]/50 hover:from-[#8B5CF6]/[0.08] transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw className="w-4 h-4 text-[#8B5CF6]" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8B5CF6]">
                  Retainer
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#FAFAFA] mb-1">{c.name}</h3>
              <div className="text-sm text-[#FAFAFA]/90 font-medium mb-3">
                {c.price}/mo
              </div>
              <p className="text-sm text-[#A1A1AA] leading-snug mb-4">{c.tagline}</p>
              <span className="inline-flex items-center gap-1 text-xs font-mono text-[#8B5CF6] group-hover:translate-x-0.5 transition-transform">
                Explore <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Custom packages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="rounded-2xl border border-[#27272A] bg-[#0F0F12] p-8 sm:p-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#A1A1AA]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
              Custom packages
            </span>
          </div>
          <h2 className="text-3xl font-bold text-[#FAFAFA] mb-3">
            Or scope something custom.
          </h2>
          <p className="text-[#A1A1AA] max-w-2xl leading-relaxed mb-6">
            Need a hybrid engagement? A multi-month build? A retainer with specific
            deliverables? Every engagement can be custom-scoped — transparent quote,
            fixed price, no asterisks.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-[#27272A] hover:border-[#06B6D4] text-[#FAFAFA]"
            >
              <Link href="/contact?engagement=custom">
                Talk to Sage
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-[#A1A1AA]"
            >
              <Link href="/capabilities">See the matrix</Link>
            </Button>
          </div>
        </div>

        {/* Not sure which? */}
        <div className="mt-10 rounded-2xl border border-[#27272A] bg-[#0F0F12] p-8 sm:p-12 text-center">
          <p className="text-[#71717A] text-sm font-mono uppercase tracking-widest mb-3">
            Not sure which fits?
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#FAFAFA] mb-4">
            Start with a conversation.
          </h2>
          <p className="text-[#A1A1AA] max-w-xl mx-auto mb-8">
            Book a free 30-minute discovery call. We&apos;ll talk through what you&apos;re building,
            what you&apos;ve already tried, and which engagement — if any — is the right fit.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#06B6D4] hover:bg-[#0891B2] text-[#09090B] font-semibold"
          >
            <Link href="/book">
              Book a Discovery Call
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
