'use client';

import { motion } from 'framer-motion';
import { slideUp, stagger } from '@/lib/motion/presets';
import type { SeoReport, Check } from '@/lib/seo-audit/analyzer';

type Props = {
  score: number;
  report: SeoReport;
};

// ─── Score ring ──────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color =
    score >= 80
      ? '#0ED3CF'
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
            stroke="#2A2826"
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
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#57534E] mt-0.5">
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

function CheckRow({ name, check }: { name: string; check: Check }) {
  const PassIcon = () => (
    <span
      aria-hidden
      className="shrink-0 w-5 h-5 rounded-full bg-[#0ED3CF]/10 border border-[#0ED3CF]/30 flex items-center justify-center"
    >
      <svg className="w-2.5 h-2.5 text-[#0ED3CF]" viewBox="0 0 10 10" fill="currentColor">
        <path d="M8.5 2.5L4 7.5 1.5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );

  const FailIcon = () => (
    <span
      aria-hidden
      className="shrink-0 w-5 h-5 rounded-full bg-[#E85D3A]/10 border border-[#E85D3A]/30 flex items-center justify-center"
    >
      <svg className="w-2.5 h-2.5 text-[#E85D3A]" viewBox="0 0 10 10" fill="none">
        <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  );

  return (
    <motion.li
      variants={slideUp}
      className={`flex items-start gap-3 rounded-xl px-4 py-3 border transition-colors ${
        check.pass
          ? 'bg-[#0ED3CF]/[0.03] border-[#0ED3CF]/10'
          : 'bg-[#E85D3A]/[0.03] border-[#E85D3A]/10'
      }`}
    >
      {check.pass ? <PassIcon /> : <FailIcon />}
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13.5px] font-medium text-[#F4F2EF]">{check.label}</span>
          <span
            className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
            style={{
              color: '#57534E',
              borderColor: '#2A2826',
              background: '#12110F',
            }}
          >
            w={check.weight}
          </span>
        </div>
        <p className="text-[12px] text-[#A8A29E] mt-0.5 leading-snug">{check.detail}</p>
      </div>
    </motion.li>
  );
}

// ─── Main Report ─────────────────────────────────────────────────────────────

export function Report({ score, report }: Props) {
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
      className="mt-8 space-y-6"
    >
      {/* Header row */}
      <motion.div
        variants={slideUp}
        className="rounded-2xl bg-[#12110F] border border-[#2A2826] p-6"
      >
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <ScoreRing score={score} />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#57534E] mb-1">
              Audited
            </p>
            <p
              className="text-sm font-mono text-[#A8A29E] truncate mb-4"
              title={report.url}
            >
              {report.url}
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="text-center">
                <div className="text-xl font-bold font-mono text-[#0ED3CF]">{passCount}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#57534E]">
                  Passed
                </div>
              </div>
              <div className="w-px bg-[#2A2826] self-stretch" />
              <div className="text-center">
                <div className="text-xl font-bold font-mono text-[#E85D3A]">{failCount}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#57534E]">
                  Failed
                </div>
              </div>
              {hasPerf && (
                <>
                  <div className="w-px bg-[#2A2826] self-stretch" />
                  <div className="text-center">
                    <div className="text-xl font-bold font-mono text-[#A8C633]">
                      {report.performance!.score}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#57534E]">
                      Perf
                    </div>
                  </div>
                  {report.performance?.lcpMs && (
                    <>
                      <div className="w-px bg-[#2A2826] self-stretch" />
                      <div className="text-center">
                        <div className="text-xl font-bold font-mono text-[#F4F2EF]">
                          {(report.performance.lcpMs / 1000).toFixed(1)}s
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-[#57534E]">
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
        <p className="mt-4 text-[11px] text-[#57534E] font-mono">
          {hasPerf
            ? 'Score = 70% on-page checks + 30% mobile PageSpeed'
            : 'Score = weighted on-page checks · Add PAGESPEED_API_KEY for a performance blend'}
        </p>
      </motion.div>

      {/* Prioritized fix list */}
      {failCount > 0 && (
        <motion.div variants={slideUp}>
          <h2 className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#E85D3A] mb-3">
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
          <h2 className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#0ED3CF] mb-3">
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
        className="rounded-2xl bg-[#0ED3CF]/[0.04] border border-[#0ED3CF]/20 p-6 text-center"
      >
        <p className="text-[13px] text-[#A8A29E] mb-3">
          Want these issues fixed? Sage Ideas offers an SEO sprint as part of the{' '}
          <strong className="text-[#F4F2EF]">Audit + Sprint</strong> package.
        </p>
        <a
          href="/contact?context=seo-audit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0ED3CF] text-[#09090B] text-[13px] font-semibold font-mono tracking-wide uppercase hover:bg-[#0AA8A5] transition-colors"
          style={{ boxShadow: '0 0 16px rgba(14,211,207,0.35)' }}
        >
          Fix these issues →
        </a>
      </motion.div>
    </motion.section>
  );
}
