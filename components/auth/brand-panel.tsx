export function SageLogo({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-label="Sage Ideas">
      <rect x="2" y="2" width="60" height="60" rx="14" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 22 L32 22 M20 32 L44 32 M20 42 L36 42"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="44" cy="22" r="3" fill="currentColor" />
    </svg>
  );
}

function LockIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export type AuthAudience = 'studio' | 'academy';

interface PanelVariant {
  bg: string;
  accent: string;
  glow: string;
  kicker: string;
  headline: string;
  sub: string;
  features: [string, string][];
  footer: string;
}

const VARIANTS: Record<AuthAudience, PanelVariant> = {
  studio: {
    bg: '#0B0B0E',
    accent: '#3D5AFE',
    glow:
      'radial-gradient(60% 50% at 18% 18%, rgba(61,90,254,0.18), transparent 60%), radial-gradient(50% 60% at 82% 78%, rgba(124,58,237,0.12), transparent 60%)',
    kicker: 'The Studio · Client Workspace',
    headline: 'Your private workspace for every engagement.',
    sub: 'Real-time deliverables, signed contracts, threaded conversations, and a direct line to the operator — all in one place.',
    features: [
      ['Live pipeline', 'Every phase and deliverable, in real time.'],
      ['Inline e-sign', 'Contracts signed in-app, full audit trail.'],
      ['Direct messaging', 'No email threads. No Slack. Just clarity.'],
      ['Stripe billing', 'Invoices, retainers, and add-ons in one place.'],
    ],
    footer: 'Sage Ideas Studio',
  },
  academy: {
    bg: '#0C0E0D',
    accent: '#3D6BFF',
    glow:
      'radial-gradient(60% 50% at 18% 18%, rgba(61,107,255,0.20), transparent 60%), radial-gradient(50% 60% at 82% 78%, rgba(61,90,254,0.12), transparent 60%)',
    kicker: 'Sage Academy · Learn to build',
    headline: 'Pick up exactly where you left off.',
    sub: 'Project-based courses, guided labs you actually ship, and certificates you keep — your whole learning record in one place.',
    features: [
      ['Your courses', 'Every track you’ve started, resume in one tap.'],
      ['Hands-on labs', 'Build real projects, not notes — in the browser.'],
      ['Certificates', 'Earn and keep proof of what you’ve shipped.'],
      ['Progress', 'Streaks, completion, and what to do next.'],
    ],
    footer: 'Sage Academy',
  },
};

export function BrandPanel({ audience = 'studio' }: { audience?: AuthAudience }) {
  const v = VARIANTS[audience];
  return (
    <div className="hidden lg:flex flex-1 relative overflow-hidden" style={{ background: v.bg }}>
      {/* Layered atmosphere: drifting glow, faint grid, corner vignette, lit seam. */}
      <div className="absolute inset-0 opacity-80" style={{ backgroundImage: v.glow }} />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(130% 90% at 0% 0%, transparent 42%, rgba(0,0,0,0.5) 100%)' }}
      />
      <div
        className="absolute top-0 right-0 h-full w-px"
        style={{ background: `linear-gradient(to bottom, transparent, ${v.accent}55, transparent)` }}
      />
      <div
        className="absolute inset-0 opacity-[0.022] mix-blend-overlay"
        aria-hidden
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
        <div className="flex items-center gap-3">
          <div
            className="grid place-items-center w-11 h-11 rounded-xl border border-white/10 bg-white/[0.03]"
            style={{ color: v.accent }}
          >
            <SageLogo className="w-6 h-6" />
          </div>
          <div>
            <div className="font-semibold text-[15px] tracking-tight text-white">Sage Ideas</div>
            <div className="text-[10px] uppercase tracking-[0.18em] font-mono" style={{ color: v.accent }}>
              {v.kicker}
            </div>
          </div>
        </div>

        <div className="max-w-md">
          <p
            style={{ fontFamily: 'var(--font-serif)' }}
            className="text-[40px] xl:text-[46px] leading-[1.04] tracking-[-0.025em] text-white"
          >
            {v.headline}
          </p>
          <p className="mt-5 text-[15px] leading-relaxed text-[#9C9CA6]">{v.sub}</p>

          <div className="mt-9 grid grid-cols-2 gap-x-6 gap-y-6">
            {v.features.map(([title, desc]) => (
              <div key={title} className="relative pl-4">
                <span
                  className="absolute left-0 top-[6px] h-2.5 w-2.5 rounded-full"
                  style={{ background: v.accent, boxShadow: `0 0 12px ${v.accent}` }}
                />
                <div className="text-[13.5px] font-medium text-white">{title}</div>
                <div className="mt-0.5 text-[12.5px] leading-relaxed text-[#8A8A94]">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#57534E]">
          <LockIcon />
          <span>Encrypted session · {v.footer} · sageideas.dev</span>
        </div>
      </div>
    </div>
  );
}
