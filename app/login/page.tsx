import { SignIn } from '@clerk/nextjs';

export const metadata = { title: 'Sign in' };

function SageLogo() {
  return (
    <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none" aria-label="Sage Ideas">
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

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left: brand panel */}
      <div className="hidden lg:flex flex-1 relative bg-[#0f0f12] border-r border-[#27272a] overflow-hidden">
        <div className="grid-pattern absolute inset-0 opacity-40" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3 text-[#fafafa]">
            <SageLogo />
            <div>
              <div className="font-semibold text-base tracking-tight">Sage Ideas</div>
              <div className="text-xs text-[#71717a]">The Studio · Client Workspace</div>
            </div>
          </div>

          <div className="space-y-8 max-w-md">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[#fafafa]">
              Your private workspace for every engagement.
            </h1>
            <p className="text-[#a1a1aa] leading-relaxed">
              Real-time deliverables, signed contracts, threaded conversations, and a direct line
              to the team — all in one place.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                ['Live pipeline', 'See every phase, deliverable, and iteration in real time.'],
                ['Inline e-sign', 'Contracts signed in-app with full audit trail.'],
                ['Direct messaging', 'No email threads. No Slack channels. Just clarity.'],
                ['Stripe billing', 'Invoices, subscriptions, and add-ons in one place.'],
              ].map(([title, desc]) => (
                <div key={title} className="space-y-1">
                  <div className="text-sm font-medium text-[#fafafa]">{title}</div>
                  <div className="text-xs text-[#71717a] leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-[#52525b]">
            © {new Date().getFullYear()} Sage Ideas Studio · sageideas.dev
          </div>
        </div>
      </div>

      {/* Right: sign-in */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#09090B]">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 text-[#fafafa] mb-8">
            <SageLogo />
            <span className="font-semibold">Sage Ideas Studio</span>
          </div>
          <SignIn
            routing="hash"
            signUpUrl="/login"
            fallbackRedirectUrl="/portal/home"
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'bg-transparent shadow-none border-0 p-0',
                headerTitle: 'text-2xl font-semibold tracking-tight',
                headerSubtitle: 'text-[#71717a]',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
