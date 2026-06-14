import type { Metadata } from "next";
import type { ComponentType } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  CircuitBoard,
  DatabaseZap,
  ExternalLink,
  FileCheck2,
  GitBranch,
  LockKeyhole,
  Network,
  ShieldCheck,
} from "lucide-react";
import proof from "@/data/public-proof/engineering-os-proof.json";
import { AsciiRule, Sigil } from "@/components/sage";

const SITE = "https://www.sageideas.dev";

export const metadata: Metadata = {
  title: "Sage Ideas Engineering OS",
  description:
    "Public-safe proof layer for the Sage Ideas Engineering OS: reusable engines, recipes, QA evidence, registry scorecards, and product proofs.",
  alternates: {
    canonical: `${SITE}/engineering-os`,
  },
  openGraph: {
    title: "Sage Ideas Engineering OS",
    description:
      "A public-safe view into the internal engineering resource factory Sage Ideas uses to build faster with reusable infrastructure and evidence.",
    url: `${SITE}/engineering-os`,
    siteName: "Sage Ideas",
    type: "website",
  },
};

const metrics = proof.proof_metrics;
const visibleGaps = proof.remaining_gaps.filter(
  (gap) => !gap.toLowerCase().includes("has not consumed this export"),
);

const metricCards = [
  {
    label: "Public repos indexed",
    value: String(metrics.public_repositories_indexed),
    detail: `${metrics.private_repositories_summarized} private repos summarized without names`,
  },
  {
    label: "Assets scored",
    value: String(metrics.public_assets_scored),
    detail: `load-bearing average ${metrics.load_bearing_average_score}/100`,
  },
  {
    label: "Golden path gates",
    value: `${metrics.golden_path_gates_passed}/${metrics.golden_path_gate_count}`,
    detail: `${metrics.golden_path_verify_checks.passed}/${metrics.golden_path_verify_checks.total} verifier checks passed`,
  },
  {
    label: "Wall clock proof",
    value: `${metrics.golden_path_wall_clock_seconds}s`,
    detail: metrics.golden_path_deployed_url
      ? "public Vercel proof verified"
      : "local runtime proof, not a live Vercel claim",
  },
];

const systemNodes = [
  {
    icon: CircuitBoard,
    title: "Control plane",
    body: "Registry, scorecards, proof packets",
    tone: "text-[#0ED3CF]",
  },
  {
    icon: Boxes,
    title: "Resource factory",
    body: "Reusable engines, kits, recipes, playbooks",
    tone: "text-[#E85D3A]",
  },
  {
    icon: ShieldCheck,
    title: "Quality system",
    body: "QA OS, evidence hashes, release gates",
    tone: "text-[#A8C633]",
  },
  {
    icon: Network,
    title: "Product proofs",
    body: "Apps that demonstrate reusable patterns",
    tone: "text-[#E85094]",
  },
];

const proofLines = [
  ["packet", proof.evidence.packet_hash],
  ["golden_path", proof.evidence.golden_path_hash],
  ["run_id", proof.evidence.golden_path_run_id],
  ["deployed", proof.evidence.golden_path_deployed_url ?? "not attached"],
  ["generated", proof.generated_at],
];

export default function EngineeringOsPage() {
  return (
    <div className="relative overflow-hidden bg-[var(--sage-bg)] text-[var(--sage-ink)]">
      <section className="relative min-h-[92vh] border-b border-[var(--sage-border)] pt-28 sm:pt-32 lg:pt-36">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24">
          <div className="flex flex-col justify-center">
            <AsciiRule
              label="// public proof layer"
              tone="cyan"
              className="mb-8 max-w-xl"
            />
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <Sigil status="secure" label="PUBLIC-SAFE EXPORT" />
              <span className="rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-2)] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--sage-ink-muted)] [font-family:var(--font-mono),ui-monospace,monospace]">
                no private repo names
              </span>
            </div>

            <h1
              className="max-w-4xl text-[40px] font-normal leading-[0.98] tracking-[-0.01em] text-[var(--sage-ink)] sm:text-[72px] lg:text-[96px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="block">Sage Ideas</span>
              <span className="block italic text-[#0ED3CF]">Engineering OS</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-[var(--sage-ink-muted)] sm:text-lg">
              A private engineering resource factory that turns reusable
              engines, recipes, QA evidence, and product proofs into faster
              software delivery.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="https://github.com/JasonTeixeira/nexural-meta"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[3px] bg-[#0ED3CF] px-5 text-[13px] font-medium uppercase tracking-[0.08em] text-[#08110F] transition-colors hover:bg-[#33EBE8] [font-family:var(--font-mono),ui-monospace,monospace]"
              >
                inspect control plane
                <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                href="/work"
                className="group inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[3px] border border-[var(--sage-border-strong)] px-5 text-[13px] uppercase tracking-[0.08em] text-[var(--sage-ink-muted)] transition-colors hover:border-[var(--sage-border-hover)] hover:text-[var(--sage-ink)] [font-family:var(--font-mono),ui-monospace,monospace]"
              >
                view product proofs
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
          </div>

          <ProofConsole />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metricCards.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-b border-[var(--sage-border)] py-16 sm:py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <AsciiRule label="// system map" tone="coral" className="mb-6" />
            <h2
              className="text-3xl font-normal tracking-tight text-[var(--sage-ink)] sm:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Built once. Reused everywhere. Scored before trust.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--sage-ink-muted)]">
              This is not a pile of repos. The public proof layer exposes the
              structure: a control plane, reusable resources, quality gates, and
              product examples tied back to evidence.
            </p>
          </div>

          <div className="rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-4 sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              {systemNodes.map((node, index) => (
                <SystemNode key={node.title} index={index + 1} {...node} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-b border-[var(--sage-border)] py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <AsciiRule
                label="// evidence-backed claims"
                tone="lime"
                className="mb-6"
              />
              <h2
                className="text-3xl font-normal tracking-tight text-[var(--sage-ink)] sm:text-5xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Claims are only shown when the export can back them.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-[var(--sage-ink-muted)]">
              The broad public score is intentionally low. It is a gap map for
              what to improve, not a vanity metric.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {proof.public_claims.map((claim) => (
              <article
                key={claim.claim}
                className="rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-2)] p-5 transition-colors hover:border-[#0ED3CF]/45"
              >
                <FileCheck2
                  className="mb-5 h-5 w-5 text-[#0ED3CF]"
                  aria-hidden
                />
                <h3 className="text-base font-semibold leading-6 text-[var(--sage-ink)]">
                  {claim.claim}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--sage-ink-muted)]">
                  {claim.evidence}
                </p>
                <p className="mt-5 break-words rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-bg)] px-3 py-2 text-[11px] text-[var(--sage-ink-muted)] [font-family:var(--font-mono),ui-monospace,monospace]">
                  {claim.source}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-b border-[var(--sage-border)] py-16 sm:py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <section className="rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-6 sm:p-8">
            <AsciiRule
              label="// recommended public assets"
              tone="cyan"
              className="mb-6"
            />
            <div className="space-y-4">
              {proof.recommended_assets.map((asset) => (
                <Link
                  key={asset.name}
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid cursor-pointer gap-3 rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-2)] p-4 transition-colors hover:border-[#0ED3CF]/45 sm:grid-cols-[1fr_auto]"
                >
                  <span>
                    <span className="block text-lg font-semibold text-[var(--sage-ink)] group-hover:text-[#0ED3CF]">
                      {asset.name}
                    </span>
                    <span className="mt-1 block text-sm text-[var(--sage-ink-muted)]">
                      {asset.layer}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 text-sm text-[var(--sage-ink-muted)] [font-family:var(--font-mono),ui-monospace,monospace]">
                    {asset.maturity} / {asset.score}
                    <ExternalLink className="h-4 w-4 text-[var(--sage-ink-faint)]" />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-6 sm:p-8">
            <AsciiRule
              label="// redaction boundary"
              tone="magenta"
              className="mb-6"
            />
            <ul className="space-y-4">
              {proof.redaction_policy.map((rule) => (
                <li
                  key={rule}
                  className="flex gap-3 text-sm leading-7 text-[var(--sage-ink-muted)]"
                >
                  <LockKeyhole
                    className="mt-1 h-4 w-4 shrink-0 text-[#E85094]"
                    aria-hidden
                  />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <AsciiRule label="// still honest" tone="coral" className="mb-6" />
            <h2
              className="text-3xl font-normal tracking-tight text-[var(--sage-ink)] sm:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              The page shows the system without pretending the hard parts are
              solved.
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--sage-ink-muted)]">
              The proof packet is now consumed by this route. The remaining
              blockers are stated directly so the public page stays credible.
            </p>
          </div>
          <div className="space-y-4">
            <article className="rounded-[3px] border border-[#A8C633]/25 bg-[#A8C633]/[0.04] p-5">
              <CheckCircle2
                className="mb-4 h-5 w-5 text-[#A8C633]"
                aria-hidden
              />
              <h3 className="font-semibold text-[var(--sage-ink)]">
                Phase 6B integration
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--sage-ink-muted)]">
                This page consumes the exported proof packet from the control
                plane and publishes it with the redaction boundary intact.
              </p>
            </article>

            {visibleGaps.map((gap) => (
              <article
                key={gap}
                className="rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-2)] p-5"
              >
                <GitBranch
                  className="mb-4 h-5 w-5 text-[#E85D3A]"
                  aria-hidden
                />
                <p className="text-sm leading-7 text-[var(--sage-ink-muted)]">{gap}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ProofConsole() {
  return (
    <div className="relative self-center rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)]/90 shadow-2xl shadow-black/30">
      <div className="flex items-center gap-2 border-b border-[var(--sage-border)] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#E85D3A]" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-[#E5C341]" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-[#A8C633]" aria-hidden />
        <span className="ml-2 truncate text-xs text-[var(--sage-ink-muted)] [font-family:var(--font-mono),ui-monospace,monospace]">
          ~/sageideas/proof-layer
        </span>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-bg)] p-4">
          <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#0ED3CF] [font-family:var(--font-mono),ui-monospace,monospace]">
            <DatabaseZap className="h-4 w-4" aria-hidden />
            packet status
          </div>
          <p className="text-2xl font-semibold text-[var(--sage-ink)]">
            export consumed
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--sage-ink-muted)]">
            Public-safe JSON, no secrets, no private repository names, no
            customer details.
          </p>
        </div>

        <div className="space-y-3">
          {proofLines.map(([label, value]) => (
            <div key={label} className="grid gap-1">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]">
                {label}
              </span>
              <code className="break-words rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-2)] px-3 py-2 text-[11px] leading-5 text-[var(--sage-ink-muted)]">
                {value}
              </code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-2)] p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--sage-ink-muted)] [font-family:var(--font-mono),ui-monospace,monospace]">
        {label}
      </p>
      <p className="mt-3 text-3xl tabular-nums text-[var(--sage-ink)] [font-family:var(--font-mono),ui-monospace,monospace]">{value}</p>
      <p className="mt-2 text-xs leading-5 text-[var(--sage-ink-muted)]">{detail}</p>
    </article>
  );
}

function SystemNode({
  icon: Icon,
  title,
  body,
  tone,
  index,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
  tone: string;
  index: number;
}) {
  return (
    <article className="relative min-h-44 rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-2)] p-5">
      <div className="mb-6 flex items-start justify-between gap-4">
        <Icon className={`h-6 w-6 ${tone}`} aria-hidden />
        <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]">
          node_0{index}
        </span>
      </div>
      <h3 className="text-base font-normal text-[var(--sage-ink)]" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--sage-ink-muted)]">{body}</p>
    </article>
  );
}
