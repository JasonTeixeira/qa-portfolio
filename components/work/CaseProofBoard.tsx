import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { MetricGrid, StatCard } from '@/components/viz';
import type { CaseStudy } from '@/data/work/case-studies';

function countProofAssets(study: CaseStudy) {
  return (study.screens?.length ?? 0) + (study.gallery?.length ?? 0) + (study.artifacts?.length ?? 0);
}

export function CaseProofBoard({ study }: { study: CaseStudy }) {
  const proofAssets = countProofAssets(study);
  const primaryMetric = study.metrics[0];
  const screenCount = study.screens?.length ?? 0;
  const artifactCount = study.artifacts?.length ?? 0;

  return (
    <section className="border-t border-[var(--sage-border)]">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="grid gap-px bg-[var(--sage-border)] lg:grid-cols-[0.82fr_1.18fr]">
          <div className="bg-[var(--sage-bg)] p-6 sm:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              Proof board
            </p>
            <h2
              className="mt-5 max-w-[9ch] text-[clamp(2.4rem,_1.2rem_+_4vw,_5rem)] font-extrabold text-[var(--sage-ink)]"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 0.98 }}
            >
              Receipts before claims.
            </h2>
            <p className="mt-6 max-w-[48ch] text-sm leading-7 text-[var(--sage-ink-muted)]">
              This page separates shipped surface, system map, real metrics, and available artifacts so the work can be
              inspected instead of just admired.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <StatCard label="proof assets" value={String(proofAssets)} detail="Screens, gallery, artifacts" />
              <StatCard label="screens" value={String(screenCount)} detail="Real product surfaces" />
              <StatCard label="artifacts" value={String(artifactCount)} detail="Available during discovery" />
            </div>
          </div>

          <div className="grid gap-px bg-[var(--sage-border)]">
            <div className="bg-[var(--sage-surface-1)] p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
                    Primary evidence
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-[var(--sage-ink)]">{study.kicker}</h3>
                </div>
                {primaryMetric ? (
                  <div className="text-right">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
                      {primaryMetric.label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--sage-ink)]">
                      {primaryMetric.value}
                    </p>
                  </div>
                ) : null}
              </div>
              <div className="mt-7">
                <MetricGrid metrics={study.metrics} />
              </div>
            </div>

            <div className="grid gap-px bg-[var(--sage-border)] md:grid-cols-2">
              <div className="bg-[var(--sage-surface-1)] p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                  Surface
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--sage-ink-muted)]">
                  Product screenshots and interface frames show the user-facing layer. If real assets are unavailable, the
                  page says so instead of dressing mockups as production proof.
                </p>
              </div>
              <div className="bg-[var(--sage-surface-1)] p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                  System
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--sage-ink-muted)]">
                  Architecture diagrams, build logs, and artifacts make the hidden operating layer visible to technical
                  buyers.
                </p>
              </div>
            </div>

            {study.ctaPrimary ? (
              <Link
                href={study.ctaPrimary.href}
                className="group flex items-center justify-between gap-4 bg-[var(--sage-bg)] p-5 text-sm font-semibold text-[var(--sage-ink)] transition hover:text-[var(--sage-accent-readable)]"
              >
                <span>{study.ctaPrimary.label}</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
