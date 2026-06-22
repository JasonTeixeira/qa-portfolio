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

export type AuthAudience = 'studio' | 'academy';

interface PanelVariant {
  bg: string;
  border: string;
  glow: string;
  accent: string;
  kicker: string;
  headline: string;
  sub: string;
  features: [string, string][];
  footer: string;
}

const VARIANTS: Record<AuthAudience, PanelVariant> = {
  studio: {
    bg: '#0B0B0E',
    border: '#1E1E24',
    glow:
      'radial-gradient(60% 50% at 20% 20%, rgba(61,90,254,0.14), transparent 60%), radial-gradient(50% 60% at 80% 70%, rgba(124,58,237,0.10), transparent 60%)',
    accent: '#3D5AFE',
    kicker: 'The Studio · Client Workspace',
    headline: 'Your private workspace for every engagement.',
    sub: 'Real-time deliverables, signed contracts, threaded conversations, and a direct line to the operator — all in one place.',
    features: [
      ['Live pipeline', 'Every phase, deliverable, and iteration in real time.'],
      ['Inline e-sign', 'Contracts signed in-app with a full audit trail.'],
      ['Direct messaging', 'No email threads. No Slack. Just clarity.'],
      ['Stripe billing', 'Invoices, retainers, and add-ons in one place.'],
    ],
    footer: 'Sage Ideas Studio · sageideas.dev',
  },
  academy: {
    bg: '#0C0E0D',
    border: '#1C2420',
    glow:
      'radial-gradient(60% 50% at 20% 20%, rgba(24,182,99,0.16), transparent 60%), radial-gradient(50% 60% at 80% 70%, rgba(61,90,254,0.10), transparent 60%)',
    accent: '#18b663',
    kicker: 'Sage Academy · Learn to build',
    headline: 'Pick up exactly where you left off.',
    sub: 'Project-based courses, guided labs you actually ship, and certificates you keep — your whole learning record in one place.',
    features: [
      ['Your courses', 'Every track you’ve started, resume in one tap.'],
      ['Hands-on labs', 'Build real projects, not notes — in the browser.'],
      ['Certificates', 'Earn and keep proof of what you’ve shipped.'],
      ['Progress', 'Streaks, completion, and what to do next.'],
    ],
    footer: 'Sage Academy · sageideas.dev',
  },
};

export function BrandPanel({ audience = 'studio' }: { audience?: AuthAudience }) {
  const v = VARIANTS[audience];
  return (
    <div
      className="hidden lg:flex flex-1 relative overflow-hidden"
      style={{ background: v.bg, borderRight: `1px solid ${v.border}` }}
    >
      <div className="absolute inset-0 opacity-70" style={{ backgroundImage: v.glow }} />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      <div className="relative z-10 flex flex-col justify-between p-12 w-full">
        <div className="flex items-center gap-3 text-[#F2EFE9]">
          <SageLogo />
          <div>
            <div className="font-semibold text-base tracking-tight">Sage Ideas</div>
            <div className="text-xs uppercase tracking-wider font-mono" style={{ color: v.accent }}>
              {v.kicker}
            </div>
          </div>
        </div>

        <div className="space-y-8 max-w-md">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[#F2EFE9]">
            {v.headline}
          </h1>
          <p className="text-[#9C9CA6] leading-relaxed">{v.sub}</p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            {v.features.map(([title, desc]) => (
              <div key={title} className="space-y-1">
                <div className="text-sm font-medium text-[#F2EFE9]">{title}</div>
                <div className="text-xs text-[#8A8A94] leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-[#57534E]">
          © {new Date().getFullYear()} {v.footer}
        </div>
      </div>
    </div>
  );
}
