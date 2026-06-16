'use client'

import Link from 'next/link'
import {
  ConversionMap,
  MotionProofStrip,
  SurfaceSystemPanel,
  SystemHeroPanel,
} from './LivingPageSystem'

type Stat = {
  label: string
  value: string
}

type Step = {
  label: string
  detail: string
}

type ProofAsset = {
  label: string
  detail: string
  status?: 'ready' | 'needed'
  href?: string
}

type DynamicRouteDeepeningProps = {
  eyebrow: string
  title: string
  body: string
  nodes: string[]
  stats: Stat[]
  architectureTitle: string
  architectureBody: string
  architectureSteps: Step[]
  conversionSteps: Step[]
  assets?: ProofAsset[]
  cta?: {
    label: string
    href: string
  }
}

const defaultAssets: ProofAsset[] = [
  {
    label: 'Product screenshot',
    detail: 'Wire in a verified product screenshot when the final asset is available.',
  },
  {
    label: 'Founder photo',
    detail: 'Use the real founder photo only. No generated portrait replacement.',
  },
  {
    label: 'Permissioned logo or quote',
    detail: 'Show client proof only after written permission is available.',
  },
]

export function ProofAssetRail({ assets = defaultAssets }: { assets?: ProofAsset[] }) {
  return (
    <div className="grid gap-px bg-[var(--sage-border)] md:grid-cols-3">
      {assets.map((asset) => {
        const isReady = asset.status === 'ready'
        const content = (
          <div className="group flex min-h-[230px] flex-col justify-between bg-[var(--sage-surface-1)] p-5 transition-colors hover:bg-[var(--sage-surface-2)]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
                {isReady ? 'Verified asset' : 'Asset slot'}
              </p>
              <h3 className="mt-8 text-xl font-semibold leading-tight text-[var(--sage-ink)]">
                {asset.label}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--sage-ink-muted)]">
                {asset.detail}
              </p>
            </div>
            <span
              className={[
                'mt-8 inline-flex w-fit rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em]',
                isReady
                  ? 'border-[var(--sage-accent)] text-[var(--sage-accent-readable)]'
                  : 'border-[var(--sage-border)] text-[var(--sage-ink-faint)]',
              ].join(' ')}
            >
              {isReady ? 'live' : 'pending real proof'}
            </span>
          </div>
        )

        return asset.href ? (
          <Link href={asset.href} key={asset.label}>
            {content}
          </Link>
        ) : (
          <div key={asset.label}>{content}</div>
        )
      })}
    </div>
  )
}

export function DynamicRouteDeepening({
  eyebrow,
  title,
  body,
  nodes,
  stats,
  architectureTitle,
  architectureBody,
  architectureSteps,
  conversionSteps,
  assets = defaultAssets,
  cta,
}: DynamicRouteDeepeningProps) {
  return (
    <section className="border-t border-[var(--sage-border)] bg-[var(--sage-bg)] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(360px,0.72fr)] lg:items-end">
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              {eyebrow}
            </p>
            <h2
              className="max-w-[12ch] text-[clamp(2.7rem,1.25rem+5.8vw,6.7rem)] font-extrabold text-[var(--sage-ink)]"
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.03em',
                lineHeight: 0.98,
              }}
            >
              {title}
            </h2>
            <p className="mt-7 max-w-[62ch] text-base leading-7 text-[var(--sage-ink-muted)] sm:text-lg">
              {body}
            </p>
            {cta ? (
              <Link
                href={cta.href}
                className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--sage-accent)] px-6 text-sm font-semibold text-white transition hover:bg-[#5670ff]"
              >
                {cta.label}<span aria-hidden className="ml-1">-&gt;</span>
              </Link>
            ) : null}
          </div>

          <SystemHeroPanel eyebrow={eyebrow} title={title} nodes={nodes} stats={stats} />
        </div>

        <div className="mt-12">
          <MotionProofStrip items={stats} />
        </div>

        <div className="mt-12">
          <SurfaceSystemPanel
            title={architectureTitle}
            body={architectureBody}
            steps={architectureSteps}
            cta={cta}
          />
        </div>

        <div className="mt-12">
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              Conversion path
            </p>
            <p className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)] sm:block">
              Surface ⇄ System
            </p>
          </div>
          <ConversionMap steps={conversionSteps} />
        </div>

        <div className="mt-12">
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              Proof assets
            </p>
            <p className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)] sm:block">
              Real only
            </p>
          </div>
          <ProofAssetRail assets={assets} />
        </div>
      </div>
    </section>
  )
}
