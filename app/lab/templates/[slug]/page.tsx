import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  LivingCTA,
  LivingHero,
  LivingPageShell,
  LivingSection,
  SystemHeroPanel,
} from '@/components/living/LivingPageSystem'
import { templates, categoryLabels } from '@/data/lab/templates'
import { TemplateActions } from './template-actions'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return templates.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const t = templates.find((x) => x.slug === slug)
  if (!t) return {}
  return {
    alternates: { canonical: `https://www.sageideas.dev/lab/templates/${t.slug}` },
    title: `${t.name} — Free template | Sage Ideas`,
    description: t.description,
    openGraph: {
      title: `${t.name} — Free template | Sage Ideas`,
      description: t.description,
      images: [
        `/og?title=${encodeURIComponent(t.name)}&subtitle=${encodeURIComponent(t.tagline)}`,
      ],
    },
  }
}

export default async function TemplateDetailPage({ params }: Props) {
  const { slug } = await params
  const t = templates.find((x) => x.slug === slug)
  if (!t) notFound()

  return (
    <LivingPageShell>
      <LivingHero
        eyebrow={`Template · ${categoryLabels[t.category]}`}
        title={t.name}
        lede={
          <>
            {t.tagline} {t.description}
          </>
        }
        actions={
          <>
            <LivingCTA href="#template">Open artifact</LivingCTA>
            <LivingCTA href="/lab/templates" variant="secondary">
              All templates
            </LivingCTA>
          </>
        }
        proof={[
          { label: 'format', value: t.format.toUpperCase() },
          { label: 'audience', value: t.audience },
          { label: 'email gate', value: 'none' },
          { label: 'actions', value: 'copy/download' },
        ]}
        panel={
          <SystemHeroPanel
            eyebrow="Artifact preview"
            title={`${t.name} implementation artifact`}
            nodes={['Brief', 'Rules', 'Run', 'Review']}
            stats={[
              { label: 'file', value: t.filename.split('/').pop() ?? t.filename },
              { label: 'category', value: t.category },
              { label: 'use', value: 'drop-in' },
            ]}
          />
        }
      />

      <LivingSection
        id="template"
        eyebrow="template body"
        title="Copy it, adapt it, version it."
        lede="This is intentionally plain text so it can land in a repo, Notion doc, or operating playbook without ceremony."
      >
        <div className="mb-6">
          <TemplateActions body={t.body} filename={t.filename} />
        </div>

        <article className="border border-[var(--sage-border-strong)] bg-[rgba(20,20,24,0.76)] p-5 sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-4 border-b border-[var(--sage-border)] pb-4">
            <span className="font-mono text-xs text-[var(--sage-ink-muted)]">{t.filename}</span>
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
              {t.format}
            </span>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-7 text-[var(--sage-ink)]">
            {t.body}
          </pre>
        </article>
      </LivingSection>

      <LivingSection eyebrow="application help" title="Need this wired into your stack?">
        <div className="grid gap-6 border border-[rgba(61,90,254,0.34)] bg-[rgba(61,90,254,0.08)] p-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <p className="max-w-2xl text-sm leading-7 text-[var(--sage-ink-muted)]">
            We can scope it in a 30-minute call and tell you whether this is the right
            starting point for your product, AI workflow, or operating system.
          </p>
          <LivingCTA href="/book?context=template">Talk to Sage</LivingCTA>
        </div>
      </LivingSection>
    </LivingPageShell>
  )
}
