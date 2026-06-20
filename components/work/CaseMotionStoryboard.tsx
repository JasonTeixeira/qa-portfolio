import type { CaseStudy } from '@/data/work/case-studies';

type StoryboardSpec = {
  title: string;
  stages: Array<{ label: string; detail: string }>;
  proof: Array<{ label: string; value: string }>;
};

const STORYBOARDS: Record<string, StoryboardSpec> = {
  nexural: {
    title: 'Trading product operating loop',
    stages: [
      { label: 'Market data', detail: 'feeds + alerts' },
      { label: 'Schema', detail: '185 tables' },
      { label: 'API', detail: '69 endpoints' },
      { label: 'Billing', detail: 'Stripe' },
      { label: 'AI bot', detail: 'Discord' },
    ],
    proof: [
      { label: 'tables', value: '185' },
      { label: 'endpoints', value: '69' },
      { label: 'test suites', value: '61' },
    ],
  },
  alphastream: {
    title: 'Signal engine proof loop',
    stages: [
      { label: 'Data', detail: 'OHLCV' },
      { label: 'Features', detail: '200+ indicators' },
      { label: 'Models', detail: '5 ensemble' },
      { label: 'Backtest', detail: 'walk-forward' },
      { label: 'Signal', detail: 'explainable' },
    ],
    proof: [
      { label: 'indicators', value: '200+' },
      { label: 'models', value: '5' },
      { label: 'forks', value: '2' },
    ],
  },
  jobpoise: {
    title: 'Job-search copilot loop',
    stages: [
      { label: 'Profile', detail: 'candidate' },
      { label: 'Resume', detail: 'tailored' },
      { label: 'Apply', detail: 'tracked' },
      { label: 'Interview', detail: 'practice' },
      { label: 'Insights', detail: 'feedback' },
    ],
    proof: [
      { label: 'sessions', value: '8-question' },
      { label: 'billing', value: '3 tiers' },
      { label: 'workflow', value: 'Gmail' },
    ],
  },
  trayd: {
    title: 'Bilingual trades system loop',
    stages: [
      { label: 'Lead', detail: 'EN / ES' },
      { label: 'Qualify', detail: 'trade intent' },
      { label: 'Quote', detail: 'scope' },
      { label: 'Schedule', detail: 'handoff' },
      { label: 'Follow-up', detail: 'nurture' },
    ],
    proof: [
      { label: 'languages', value: 'EN + ES' },
      { label: 'surface', value: 'mobile-first' },
      { label: 'handoff', value: 'operator' },
    ],
  },
};

export function CaseMotionStoryboard({ study }: { study: CaseStudy }) {
  const spec = STORYBOARDS[study.slug];
  if (!spec) return null;

  return (
    <section className="border-t border-[var(--sage-border)]">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="grid gap-px bg-[var(--sage-border)] lg:grid-cols-[1.15fr_0.85fr]">
          <figure className="relative overflow-hidden bg-[var(--sage-surface-1)] p-5 sm:p-6">
            <div
              className="absolute inset-0 opacity-60"
              aria-hidden
              style={{
                backgroundImage:
                  'linear-gradient(rgba(242,239,233,0.052) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,233,0.052) 1px, transparent 1px)',
                backgroundSize: '64px 64px',
                maskImage: 'radial-gradient(90% 74% at 52% 42%, #000 20%, transparent 78%)',
              }}
            />
            <figcaption className="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                motion proof map
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
                {study.slug} · real-system storyboard
              </span>
            </figcaption>
            <svg
              className="relative z-10 mt-6 h-[320px] w-full overflow-visible motion-reduce:[&_*]:animate-none"
              viewBox="0 0 960 340"
              role="img"
              aria-label={`${study.title} motion storyboard`}
            >
              <defs>
                <linearGradient id={`case-story-${study.slug}`} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#3D5AFE" />
                  <stop offset="52%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#FF2D9B" />
                </linearGradient>
                <filter id={`case-glow-${study.slug}`} x="-35%" y="-35%" width="170%" height="170%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                id={`case-path-${study.slug}`}
                d="M 70 178 C 190 74, 315 82, 424 168 S 650 286, 890 92"
                fill="none"
                stroke={`url(#case-story-${study.slug})`}
                strokeLinecap="round"
                strokeWidth="3"
                filter={`url(#case-glow-${study.slug})`}
              />
              <path
                d="M 84 248 C 230 190, 340 220, 498 118 S 714 110, 900 210"
                fill="none"
                stroke="rgba(242,239,233,0.13)"
                strokeLinecap="round"
                strokeWidth="1"
              />
              <circle className="motion-reduce:hidden" r="5" fill="#FF2D9B">
                <animateMotion dur="6.5s" repeatCount="indefinite">
                  <mpath href={`#case-path-${study.slug}`} />
                </animateMotion>
              </circle>
              <circle className="motion-reduce:hidden" r="4" fill="#3D5AFE">
                <animateMotion dur="7.8s" begin="-2.4s" repeatCount="indefinite">
                  <mpath href={`#case-path-${study.slug}`} />
                </animateMotion>
              </circle>
              {[
                [70, 178],
                [275, 82],
                [470, 202],
                [690, 245],
                [890, 92],
              ].map(([x, y], index) => {
                const stage = spec.stages[index];
                return (
                  <g key={stage.label}>
                    <circle cx={x} cy={y} r="30" fill="rgba(61,90,254,0.06)" />
                    <circle cx={x} cy={y} r="9" fill="#0B0B0E" stroke={`url(#case-story-${study.slug})`} strokeWidth="2" />
                    <text x={x} y={y + 50} fill="#F2EFE9" fontFamily="var(--font-mono)" fontSize="12" textAnchor="middle" letterSpacing="1.4">
                      {stage.label}
                    </text>
                    <text x={x} y={y + 67} fill="#8A8A94" fontFamily="var(--font-mono)" fontSize="10" textAnchor="middle" letterSpacing="1">
                      {stage.detail}
                    </text>
                  </g>
                );
              })}
            </svg>
          </figure>
          <div className="grid gap-px bg-[var(--sage-border)]">
            <div className="bg-[var(--sage-bg)] p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                {spec.title}
              </p>
              <h2
                className="mt-5 text-[clamp(2rem,_1rem_+_3vw,_4rem)] font-extrabold text-[var(--sage-ink)]"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 0.98 }}
              >
                Surface, system, proof, route.
              </h2>
              <p className="mt-5 text-sm leading-7 text-[var(--sage-ink-muted)]">
                This storyboard turns the case study into a moving operating map: the buyer sees what was built, where
                the system lives, and which proof points are actually available.
              </p>
            </div>
            <dl className="grid gap-px bg-[var(--sage-border)] sm:grid-cols-3 lg:grid-cols-1">
              {spec.proof.map((item) => (
                <div className="bg-[var(--sage-surface-1)] p-5" key={item.label}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
                    {item.label}
                  </dt>
                  <dd className="mt-3 text-2xl font-semibold text-[var(--sage-ink)]">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
