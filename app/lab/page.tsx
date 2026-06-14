import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Gauge, Calculator } from 'lucide-react'
import { Section, Surface, Hairline, MonoLabel, CtaLink } from '@/components/el'
import { LabGrid } from './lab-grid'
import { labProducts } from '@/data/lab/products'
import { NewsletterSignup } from '@/components/newsletter-signup'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.sageideas.dev/lab' },
  title: 'The Lab',
  description:
    'Six AI-native products built and operated by Sage Ideas: Nexural, Jobpoise, Trayd, VOZA, Owly, and AlphaStream. These are the businesses we\'d want to run.',
  openGraph: {
    title: 'The Lab',
    description:
      'Six AI-native products built and operated by Sage Ideas: Nexural, Jobpoise, Trayd, VOZA, Owly, and AlphaStream.',
    images: ['/og?title=The+Lab.&subtitle=Built+here+first.'],
  },
}

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
  letterSpacing: '-0.024em',
  lineHeight: 1.02,
}

export default function LabPage() {
  return (
    <div className="min-h-screen bg-[var(--sage-bg)]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-28">
        {/* Hero */}
        <section aria-label="The Lab" className="mb-20 border-b border-[var(--sage-border)] pb-16">
          <div className="mb-7 flex items-center gap-4">
            <MonoLabel tone="accent">01</MonoLabel>
            <Hairline className="flex-1" />
            <MonoLabel tone="muted">{'// products'}</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>
          <h1
            className="text-[var(--sage-ink)] font-normal text-[clamp(2.4rem,1.2rem+4vw,5rem)]"
            style={HEADING_STYLE}
          >
            The Lab.
          </h1>
          <p className="mt-4 text-base text-[var(--sage-ink-muted)] max-w-2xl">
            Where we build the things we&apos;d want to use.
          </p>
          <p className="mt-4 text-sm text-[var(--sage-ink-faint)] max-w-2xl leading-relaxed">
            The Lab is Sage Ideas&apos; product portfolio — not client work, not concept pieces, but live software built, maintained, and operated by the studio. Every product here started as a genuine itch. Every one of them has influenced a service offering or infrastructure pattern.
          </p>
          <p className="mt-3 text-sm text-[var(--sage-ink-faint)] max-w-2xl leading-relaxed">
            When we say &ldquo;we build what we operate,&rdquo; the Lab is the proof.
          </p>
        </section>

        {/* Free tools */}
        <section aria-label="Free tools" className="mb-20 border-b border-[var(--sage-border)] pb-16">
          <div className="mb-7 flex items-center gap-4">
            <MonoLabel tone="accent">02</MonoLabel>
            <Hairline className="flex-1" />
            <MonoLabel tone="muted">{'// free tools'}</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>
          <h2
            className="text-[clamp(1.6rem,1rem+2vw,2.5rem)] font-normal text-[var(--sage-ink)] mb-8"
            style={HEADING_STYLE}
          >
            Try before you talk to us.
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/lab/ai-readiness"
              className="group block"
            >
              <Surface level={2} interactive className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[3px] border border-[#0ED3CF]/20 bg-[#0ED3CF]/10 shrink-0">
                    <Gauge className="h-5 w-5 text-[#0ED3CF]" aria-hidden />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm text-[var(--sage-ink)]">AI Readiness Score</h3>
                      <ArrowRight className="h-4 w-4 text-[var(--sage-ink-faint)] transition-all group-hover:translate-x-1 group-hover:text-[#0ED3CF]" aria-hidden />
                    </div>
                    <p className="mt-1 text-sm text-[var(--sage-ink-muted)]">
                      10-question diagnostic across data, infra, process, talent, and ROI clarity. Personalized next step.
                    </p>
                  </div>
                </div>
              </Surface>
            </Link>
            <Link
              href="/lab/calculators"
              className="group block"
            >
              <Surface level={2} interactive className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[3px] border border-[#0ED3CF]/20 bg-[#0ED3CF]/10 shrink-0">
                    <Calculator className="h-5 w-5 text-[#0ED3CF]" aria-hidden />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm text-[var(--sage-ink)]">ROI calculators</h3>
                      <ArrowRight className="h-4 w-4 text-[var(--sage-ink-faint)] transition-all group-hover:translate-x-1 group-hover:text-[#0ED3CF]" aria-hidden />
                    </div>
                    <p className="mt-1 text-sm text-[var(--sage-ink-muted)]">
                      Five interactive estimates: AI SDR, support agent, RAG, voice, churn prediction.
                    </p>
                  </div>
                </div>
              </Surface>
            </Link>
          </div>
        </section>

        {/* Newsletter */}
        <section aria-label="Newsletter" className="mb-20">
          <NewsletterSignup source="lab" />
        </section>

        {/* Product grid */}
        <section aria-label="Lab products">
          <div className="mb-7 flex items-center gap-4">
            <MonoLabel tone="accent">03</MonoLabel>
            <Hairline className="flex-1" />
            <MonoLabel tone="muted">{'// products'}</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>
          <h2
            className="text-[clamp(1.6rem,1rem+2vw,2.5rem)] font-normal text-[var(--sage-ink)] mb-8"
            style={HEADING_STYLE}
          >
            Things we built and run ourselves.
          </h2>
          <LabGrid products={labProducts} />
        </section>
      </div>
    </div>
  )
}
