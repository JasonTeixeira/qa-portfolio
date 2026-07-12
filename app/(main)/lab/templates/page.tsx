import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, FileText } from 'lucide-react'
import {
  LivingHero,
  LivingPageShell,
  LivingSection,
  SystemHeroPanel,
} from '@/components/living/LivingPageSystem'
import { templates, categoryLabels } from '@/data/lab/templates'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.sageideas.dev/lab/templates' },
  title: 'Free Templates — The Lab',
  description:
    'Five free templates from the Sage Ideas studio: prompt library, eval harness, agent spec, ROI calculator, and AI vendor RFP. Drop them in today.',
  openGraph: {
    title: 'Free Templates — The Lab | Sage Ideas',
    description:
      'Prompt library, eval harness, agent spec, ROI calculator, AI vendor RFP — five templates we actually use.',
    images: ['/og?title=Free+Templates.&subtitle=Drop-in+ready.'],
  },
}

export default function TemplatesIndexPage() {
  return (
    <LivingPageShell>
      <LivingHero
        eyebrow="Lab · templates"
        title={<>Useful templates. No fake gate.</>}
        lede={
          <>
            Studio-used prompt, eval, spec, ROI, and procurement templates. Copy them,
            adapt them, and skip fewer important steps.
          </>
        }
        primaryCta={{ label: 'Browse templates', href: '#templates' }}
        secondaryCta={{ label: 'Back to the lab', href: '/lab' }}
        proof={[
          { label: 'templates', value: String(templates.length) },
          { label: 'email gate', value: 'none' },
          { label: 'formats', value: 'MD/JSON' },
          { label: 'use case', value: 'AI ops' },
        ]}
        panel={
          <SystemHeroPanel
            eyebrow="Template system"
            title="Reusable operating artifacts"
            nodes={['Prompt', 'Eval', 'Spec', 'RFP']}
            stats={[
              { label: 'copy', value: 'one click' },
              { label: 'download', value: 'local' },
              { label: 'source', value: 'studio' },
            ]}
          />
        }
      />

      <LivingSection
        id="templates"
        eyebrow="drop-in artifacts"
        title="Templates for the parts teams usually hand-wave."
        lede="These will not do the work for you, but they make it harder to skip versioning, evals, ownership, and the math."
      >
        <div className="grid gap-px bg-[var(--sage-border)] sm:grid-cols-2">
          {templates.map((t) => (
            <Link
              key={t.slug}
              href={`/lab/templates/${t.slug}`}
              className="group flex min-h-[260px] flex-col bg-[rgba(20,20,24,0.82)] p-6 transition hover:bg-[rgba(61,90,254,0.08)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-[rgba(61,90,254,0.36)] bg-[rgba(61,90,254,0.10)] text-[var(--sage-accent-readable)]">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                  {categoryLabels[t.category]}
                </span>
              </div>
              <h2 className="mt-10 text-2xl font-semibold text-[var(--sage-ink)]">{t.name}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--sage-ink-muted)]">{t.tagline}</p>
              <p className="mt-4 font-mono text-xs uppercase tracking-[0.12em] text-[var(--sage-ink-faint)]">
                For: {t.audience}
              </p>
              <div className="mt-auto flex items-center gap-2 pt-6 text-sm font-semibold text-[var(--sage-accent-readable)]">
                Open template
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </LivingSection>
    </LivingPageShell>
  )
}
