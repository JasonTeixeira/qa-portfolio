'use client';

import { motion } from 'framer-motion';
import { slideUp, stagger } from '@/lib/motion/presets';
import type { SeoReport, Check } from '@/lib/seo-audit/analyzer';

type Props = {
  score: number;
  report: SeoReport;
  shareId?: string | null;
};

// ─── Score ring ──────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color =
    score >= 80
      ? '#3D5AFE'
      : score >= 50
        ? '#A8C633'
        : '#E85D3A';
  const label =
    score >= 80 ? 'Good' : score >= 50 ? 'Needs work' : 'Poor';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full -rotate-90"
          aria-hidden
        >
          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="#1E1E24"
            strokeWidth="8"
          />
          {/* Progress */}
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-3xl font-bold font-mono leading-none"
            style={{ color }}
          >
            {score}
          </span>
          <span className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-[var(--sage-ink-faint)]">
            /100
          </span>
        </div>
      </div>
      <span
        className="text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full border"
        style={{
          color,
          borderColor: `${color}40`,
          background: `${color}10`,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Check row ────────────────────────────────────────────────────────────────

function PassIcon() {
  return (
    <span
      aria-hidden
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[rgba(61,90,254,0.34)] bg-[rgba(61,90,254,0.12)]"
    >
      <svg className="h-2.5 w-2.5 text-[var(--sage-accent-readable)]" viewBox="0 0 10 10" fill="currentColor">
        <path d="M8.5 2.5L4 7.5 1.5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function FailIcon() {
  return (
    <span
      aria-hidden
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#E85D3A]/30 bg-[#E85D3A]/10"
    >
      <svg className="w-2.5 h-2.5 text-[#E85D3A]" viewBox="0 0 10 10" fill="none">
        <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function CheckRow({ name: _name, check }: { name: string; check: Check }) {
  return (
    <motion.li
      variants={slideUp}
      className={`flex items-start gap-3 border px-4 py-3 transition-colors ${
        check.pass
          ? 'border-[rgba(61,90,254,0.14)] bg-[rgba(61,90,254,0.035)]'
          : 'bg-[#E85D3A]/[0.03] border-[#E85D3A]/10'
      }`}
    >
      {check.pass ? <PassIcon /> : <FailIcon />}
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13.5px] font-medium text-[var(--sage-ink)]">{check.label}</span>
          <span
            className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
            style={{
              color: 'var(--sage-ink-faint)',
              borderColor: 'var(--sage-border)',
              background: 'var(--sage-surface-1)',
            }}
          >
            w={check.weight}
          </span>
        </div>
        <p className="mt-0.5 text-[12px] leading-snug text-[var(--sage-ink-muted)]">{check.detail}</p>
      </div>
    </motion.li>
  );
}

// ─── Main Report ─────────────────────────────────────────────────────────────

export function Report({ score, report, shareId }: Props) {
  const checks = Object.entries(report.checks);
  // Failures first, then passes — ordered by weight descending within each group
  const sorted = [...checks].sort(([, a], [, b]) => {
    if (a.pass !== b.pass) return a.pass ? 1 : -1;
    return b.weight - a.weight;
  });

  const failCount = checks.filter(([, c]) => !c.pass).length;
  const passCount = checks.filter(([, c]) => c.pass).length;
  const hasPerf = typeof report.performance?.score === 'number';

  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={stagger(0.05)}
      aria-label="SEO audit report"
      data-testid="seo-audit-report"
      className="mt-8 space-y-6"
    >
      {/* Header row */}
      <motion.div
        variants={slideUp}
        className="border border-[var(--sage-border-strong)] bg-[rgba(20,20,24,0.72)] p-6"
      >
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <ScoreRing score={score} />
          <div className="flex-1 min-w-0">
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--sage-ink-faint)]">
              Audited
            </p>
            <p
              className="mb-4 truncate font-mono text-sm text-[var(--sage-ink-muted)]"
              title={report.url}
            >
              {report.url}
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="text-center">
                <div className="font-mono text-xl font-bold text-[var(--sage-accent-readable)]">{passCount}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--sage-ink-faint)]">
                  Passed
                </div>
              </div>
              <div className="w-px self-stretch bg-[var(--sage-border)]" />
              <div className="text-center">
                <div className="font-mono text-xl font-bold text-[#FF8A72]">{failCount}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--sage-ink-faint)]">
                  Failed
                </div>
              </div>
              {hasPerf && (
                <>
                  <div className="w-px self-stretch bg-[var(--sage-border)]" />
                  <div className="text-center">
                    <div className="font-mono text-xl font-bold text-[#A8C633]">
                      {report.performance!.score}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--sage-ink-faint)]">
                      Perf
                    </div>
                  </div>
                  {report.performance?.lcpMs && (
                    <>
                      <div className="w-px self-stretch bg-[var(--sage-border)]" />
                      <div className="text-center">
                        <div className="font-mono text-xl font-bold text-[var(--sage-ink)]">
                          {(report.performance.lcpMs / 1000).toFixed(1)}s
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--sage-ink-faint)]">
                          LCP
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scoring note */}
        <p className="mt-4 font-mono text-[11px] text-[var(--sage-ink-faint)]">
          {hasPerf
            ? 'Score = 70% on-page checks + 30% mobile PageSpeed'
            : 'Score = weighted on-page checks · Add PAGESPEED_API_KEY for a performance blend'}
        </p>
        {shareId ? (
          <div className="mt-5 border border-[rgba(61,90,254,0.34)] bg-[rgba(61,90,254,0.08)] p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              Shareable report
            </p>
            <a
              className="mt-2 block break-all text-sm text-[var(--sage-ink)] underline decoration-[var(--sage-accent)] underline-offset-4"
              href={`/tools/seo-audit/r/${shareId}`}
            >
              https://www.sageideas.dev/tools/seo-audit/r/{shareId}
            </a>
            <p className="mt-2 text-xs leading-5 text-[var(--sage-ink-muted)]">
              The public report excludes your email. Add the badge to link back to this audit.
            </p>
          </div>
        ) : null}
      </motion.div>

      {/* Prioritized fix list */}
      {failCount > 0 && (
        <motion.div variants={slideUp}>
          <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[#FF8A72]">
            Priority fixes ({failCount})
          </h2>
          <motion.ul variants={stagger(0.04)} className="space-y-2">
            {sorted
              .filter(([, c]) => !c.pass)
              .map(([name, check]) => (
                <CheckRow key={name} name={name} check={check} />
              ))}
          </motion.ul>
        </motion.div>
      )}

      {/* Passing checks */}
      {passCount > 0 && (
        <motion.div variants={slideUp}>
          <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--sage-accent-readable)]">
            Passing ({passCount})
          </h2>
          <motion.ul variants={stagger(0.03)} className="space-y-2">
            {sorted
              .filter(([, c]) => c.pass)
              .map(([name, check]) => (
                <CheckRow key={name} name={name} check={check} />
              ))}
          </motion.ul>
        </motion.div>
      )}

      {/* CTA */}
      <motion.div
        variants={slideUp}
        className="border border-[rgba(61,90,254,0.22)] bg-[rgba(61,90,254,0.06)] p-6 text-center"
      >
        <p className="mb-3 text-[13px] text-[var(--sage-ink-muted)]">
          Want these issues fixed? Sage Ideas offers an SEO sprint as part of the{' '}
          <strong className="text-[var(--sage-ink)]">Audit + Sprint</strong> package.
        </p>
        <a
          href="/book?context=seo-audit"
          className="inline-flex items-center gap-2 bg-[var(--sage-accent)] px-5 py-2.5 font-mono text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#5670ff]"
          style={{ boxShadow: '0 0 18px rgba(61,90,254,0.32)' }}
        >
          Fix these issues →
        </a>
      </motion.div>
    </motion.section>
  );
}
