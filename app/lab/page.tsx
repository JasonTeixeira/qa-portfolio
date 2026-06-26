import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Gauge, Calculator } from 'lucide-react'
import { Surface, Hairline, MonoLabel } from '@/components/el'
import { LabGrid } from './lab-grid'
import { labProducts } from '@/data/lab/products'
import { NewsletterSignup } from '@/components/newsletter-signup'
import {
  ConversionMap,
  MotionProofStrip,
  SystemHeroPanel,
} from '@/components/living/LivingPageSystem'

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
  fontFamily: 'var(--font-serif)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
  letterSpacing: '-0.024em',
  lineHeight: 1.02,
}

export default function LabPage() {
  return (
    <main className="min-h-screen bg-[var(--sage-bg)] text-[var(--sage-ink)]">
      <section className="border-b border-[var(--sage-border)] px-5 pb-16 pt-28 sm:px-8 lg:px-12 lg:pb-24 lg:pt-36">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-end">
            <div>
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                The Lab · built here first
              </p>
              <h1
                className="max-w-[10ch] text-[clamp(3.2rem,_1.2rem_+_8vw,_7.6rem)] font-extrabold"
                style={{
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.03em',
                  lineHeight: 0.98,
                }}
              >
                Products that prove the system.
              </h1>
              <p className="mt-8 max-w-[58ch] text-lg leading-[1.6] text-[var(--sage-ink-muted)] sm:text-xl">
                Live software built, maintained, and operated by the studio. Not concepts.
                Not decorative mockups. Every product here feeds the product, AI, brand,
                and growth systems Sage Ideas ships for clients.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/showcase?source=lab_hero"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#f4f7ff] px-6 text-sm font-semibold text-[#05070d] shadow-[0_0_42px_rgba(61,90,254,0.22)] transition hover:bg-white"
                >
                  Open client-facing demos
                </Link>
                <Link
                  href="/book?source=lab_hero"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--sage-border-strong)] bg-white/[0.035] px-6 text-sm font-semibold text-[var(--sage-ink)] transition hover:border-[var(--sage-accent)] hover:bg-white/[0.06]"
                >
                  Book the build call
                </Link>
              </div>
            </div>
            <SystemHeroPanel
              eyebrow="product graph"
              title="The Lab"
              nodes={['Nexural', 'Jobpoise', 'Trayd', 'AlphaStream']}
              stats={[
                { label: 'products', value: String(labProducts.length).padStart(2, '0') },
                { label: 'mode', value: 'owned' },
                { label: 'proof', value: 'live' },
              ]}
            />
          </div>

          <div className="mt-12">
            <MotionProofStrip
              items={[
                { label: 'live portfolio', value: String(labProducts.length) },
                { label: 'source', value: 'studio' },
                { label: 'status', value: 'operated' },
                { label: 'role', value: 'proof' },
              ]}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">

        {/* Free tools */}
        <section aria-label="Free tools" className="mb-20 border-b border-[var(--sage-border)] pb-16">
          <div className="mb-7 flex items-center gap-4">
            <MonoLabel tone="accent">02</MonoLabel>
            <Hairline className="flex-1" />
            <MonoLabel tone="muted">{'// free tools'}</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>
          <h2
            className="mb-8 text-[clamp(1.6rem,_1rem_+_2vw,_2.5rem)] font-normal text-[var(--sage-ink)]"
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-[3px] border border-[#3D5AFE]/20 bg-[#3D5AFE]/10 shrink-0">
                    <Gauge className="h-5 w-5 text-[#3D5AFE]" aria-hidden />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm text-[var(--sage-ink)]">AI Readiness Score</h3>
                      <ArrowRight className="h-4 w-4 text-[var(--sage-ink-faint)] transition-all group-hover:translate-x-1 group-hover:text-[#3D5AFE]" aria-hidden />
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-[3px] border border-[#3D5AFE]/20 bg-[#3D5AFE]/10 shrink-0">
                    <Calculator className="h-5 w-5 text-[#3D5AFE]" aria-hidden />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm text-[var(--sage-ink)]">ROI calculators</h3>
                      <ArrowRight className="h-4 w-4 text-[var(--sage-ink-faint)] transition-all group-hover:translate-x-1 group-hover:text-[#3D5AFE]" aria-hidden />
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

        <section aria-label="Lab conversion map" className="mb-20 border-b border-[var(--sage-border)] pb-16">
          <div className="mb-7 flex items-center gap-4">
            <MonoLabel tone="accent">03</MonoLabel>
            <Hairline className="flex-1" />
            <MonoLabel tone="muted">{'// system'}</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>
          <ConversionMap
            steps={[
              { label: 'Build in public', detail: 'Owned products expose the actual systems behind the studio.' },
              { label: 'Extract patterns', detail: 'Reusable data models, AI boundaries, and launch paths become client capabilities.' },
              { label: 'Teach the method', detail: 'Academy tracks turn real builds into practical builder education.' },
              { label: 'Scope the next build', detail: 'Qualified visitors route into services with proof already established.' },
            ]}
          />
        </section>

        {/* Product grid */}
        <section aria-label="Lab products">
          <div className="mb-7 flex items-center gap-4">
            <MonoLabel tone="accent">04</MonoLabel>
            <Hairline className="flex-1" />
            <MonoLabel tone="muted">{'// products'}</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>
          <h2
            className="mb-8 text-[clamp(1.6rem,_1rem_+_2vw,_2.5rem)] font-normal text-[var(--sage-ink)]"
            style={HEADING_STYLE}
          >
            Things we built and run ourselves.
          </h2>
          <LabGrid products={labProducts} />
        </section>
      </div>
    </main>
  )
}
