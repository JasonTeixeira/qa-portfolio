import type { Metadata } from 'next'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { tiers } from '@/data/services/tiers'
import { SectionLabel } from '@/components/section-label'
import { Button } from '@/components/ui/button'
import { ServicesGrid } from './services-grid'

export const metadata: Metadata = {
  title: 'Services — Sage Ideas',
  description:
    'Six productized service tiers from Sage Ideas: fixed scope, fixed price, Stripe checkout. From a $1,500 audit to a $7,500/mo fractional CTO.',
  openGraph: {
    title: 'Services — Sage Ideas',
    description: 'Six productized service tiers. Fixed price. No asterisks.',
    images: [{ url: '/og?title=Services&subtitle=Fixed+price.+No+asterisks.' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og?title=Services&subtitle=Fixed+price.+No+asterisks.'],
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
              Six engagements.{' '}
              <span className="text-[#06B6D4]">One studio.</span>
            </h1>
            <p className="mt-6 text-lg text-[#A1A1AA] leading-relaxed max-w-2xl">
              Every service is productized — fixed scope, fixed price, defined timeline. No
              discovery fee, no retainer ambiguity, no scope-creep surprises. You know what
              you&apos;re getting before you sign anything.
            </p>
          </div>
        </div>
      </section>

      {/* Tier Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <ServicesGrid tiers={tiers} />

        {/* Not sure which? */}
        <div className="mt-16 rounded-2xl border border-[#27272A] bg-[#0F0F12] p-8 sm:p-12 text-center">
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
