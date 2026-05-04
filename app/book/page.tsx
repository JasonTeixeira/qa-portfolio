import type { Metadata } from 'next'
import Link from 'next/link'
import { CalEmbed } from '@/components/studio/cal-embed'
import { SectionLabel } from '@/components/section-label'
import { ArrowRight } from 'lucide-react'

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

export default function BookPage() {
  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="max-w-2xl">
            <SectionLabel>Discovery Call</SectionLabel>
            <h1 className="mt-4 text-5xl sm:text-6xl font-bold text-[#FAFAFA] leading-tight">
              Book a 30-minute
              <br />
              <span className="text-[#06B6D4]">discovery call.</span>
            </h1>
            <p className="mt-5 text-lg text-[#A1A1AA] leading-relaxed">
              30 minutes. No pitch deck. No obligation. Just a direct conversation.
            </p>
          </div>

          {/* What to expect */}
          <div className="mt-8 grid sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="rounded-xl bg-[#0F0F12] border border-[#27272A] p-4">
              <p className="text-xs font-mono text-[#06B6D4] uppercase tracking-widest mb-2">
                We&apos;ll cover
              </p>
              <ul className="space-y-1.5">
                {[
                  "What you're trying to build or fix",
                  "What you've already tried",
                  "Your timeline and constraints",
                  "Whether a tier is the right fit",
                ].map((item) => (
                  <li key={item} className="text-sm text-[#A1A1AA] flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#06B6D4] mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-[#0F0F12] border border-[#27272A] p-4">
              <p className="text-xs font-mono text-[#06B6D4] uppercase tracking-widest mb-2">
                Come prepared with
              </p>
              <ul className="space-y-1.5">
                {[
                  "What success looks like in 30–90 days",
                  "An approximate budget range",
                  "Your timeline (any hard deadlines?)",
                  "A few sentences about your project",
                ].map((item) => (
                  <li key={item} className="text-sm text-[#A1A1AA] flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#71717A] mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Cal embed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="rounded-2xl border border-[#27272A] bg-[#0F0F12] overflow-hidden">
          <CalEmbed calLink="sage-ideas/discovery" />
        </div>

        {/* What to expect strip */}
        <div className="mt-16 grid sm:grid-cols-3 gap-6">
          {[
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
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-[#27272A] bg-[#0F0F12] p-6"
            >
              <span className="text-xs font-mono text-[#06B6D4] uppercase tracking-widest">
                {item.step}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-[#FAFAFA]">{item.label}</h3>
              <p className="mt-2 text-sm text-[#A1A1AA] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Prefer typed intake */}
        <div className="mt-12 text-center">
          <p className="text-[#71717A] text-sm mb-2">Prefer to write it out?</p>
          <Link
            href="/contact?type=consult&source=book"
            className="inline-flex items-center gap-1.5 text-[#06B6D4] hover:text-[#22D3EE] font-medium transition-colors text-sm"
          >
            Send a structured inquiry
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <p className="text-[#71717A] text-xs mt-1">
            Same inbox, faster routing.
          </p>
        </div>
      </section>
    </div>
  )
}
