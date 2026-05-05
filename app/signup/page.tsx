import Link from 'next/link';
import { redirect } from 'next/navigation';
import { signUpWithMagicLink } from '@/app/auth/actions';
import { BrandPanel, SageLogo } from '@/components/auth/brand-panel';
import { OAuthButtons } from '@/components/auth/oauth-buttons';

export const metadata = {
  title: 'Request access · Sage Ideas',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{
    step?: string;
    email?: string;
    error?: string;
  }>;
};

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = ['Identify', 'Tell us about you', 'Pending approval'];
  return (
    <ol className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const idx = (i + 1) as 1 | 2 | 3;
        const active = idx === step;
        const done = idx < step;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono border ${
                done
                  ? 'bg-[#06B6D4] border-[#06B6D4] text-[#09090B]'
                  : active
                    ? 'border-[#06B6D4] text-[#06B6D4]'
                    : 'border-[#27272A] text-[#52525B]'
              }`}
            >
              {idx}
            </span>
            <span
              className={`text-[11px] font-mono uppercase tracking-widest ${
                active ? 'text-[#FAFAFA]' : 'text-[#52525B]'
              }`}
            >
              {label}
            </span>
            {idx < 3 && <span className="w-6 h-px bg-[#27272A]" />}
          </li>
        );
      })}
    </ol>
  );
}

export default async function SignupPage({ searchParams }: Props) {
  const sp = await searchParams;
  const stepParam = Number(sp.step ?? '1');
  const step = (stepParam === 2 || stepParam === 3 ? stepParam : 1) as 1 | 2 | 3;
  const email = sp.email ?? '';
  const error = sp.error;

  if (step === 2 && !email) redirect('/signup');

  return (
    <div className="min-h-screen flex bg-[#09090B]">
      <BrandPanel />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 text-[#FAFAFA] mb-8">
            <SageLogo />
            <span className="font-semibold">Sage Ideas Studio</span>
          </div>

          <Stepper step={step} />

          {error && (
            <div className="mb-5 rounded-lg border border-[#7F1D1D]/50 bg-[#7F1D1D]/10 px-3 py-2.5 text-sm text-[#FCA5A5]">
              {decodeURIComponent(error)}
            </div>
          )}

          {step === 1 && <StepIdentify />}
          {step === 2 && <StepIntake email={email} />}
          {step === 3 && <StepPending email={email} />}

          {step !== 3 && (
            <p className="mt-8 text-xs text-[#71717A] text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-[#06B6D4] hover:text-[#22D3EE]">
                Sign in →
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StepIdentify() {
  return (
    <>
      <div className="space-y-1.5 mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">
          Request access to the studio
        </h2>
        <p className="text-sm text-[#A1A1AA]">
          New accounts are reviewed manually within 24 hours. Pick how you’d like to identify.
        </p>
      </div>

      <form action="/signup" method="GET" className="space-y-2.5">
        <input type="hidden" name="step" value="2" />
        <label
          htmlFor="email"
          className="block text-[10px] font-mono uppercase tracking-widest text-[#71717A]"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0C] px-3 py-2.5 text-sm text-[#FAFAFA] placeholder:text-[#52525B] focus:border-[#06B6D4] focus:outline-none focus:ring-1 focus:ring-[#06B6D4]/40"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-[#06B6D4] px-4 py-2.5 text-sm font-semibold text-[#09090B] hover:bg-[#0891B2] transition-colors"
        >
          Continue
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-[#27272A]" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#52525B]">
          or continue with
        </span>
        <div className="flex-1 h-px bg-[#27272A]" />
      </div>

      <OAuthButtons next="/auth/redirect" />
    </>
  );
}

function StepIntake({ email }: { email: string }) {
  return (
    <>
      <div className="space-y-1.5 mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">
          Tell us about you
        </h2>
        <p className="text-sm text-[#A1A1AA]">
          We use this to triage your request faster. Two minutes — promise.
        </p>
      </div>

      <form action={signUpWithMagicLink} className="space-y-4">
        <input type="hidden" name="email" value={email} />

        <div className="space-y-1.5">
          <label
            htmlFor="full_name"
            className="block text-[10px] font-mono uppercase tracking-widest text-[#71717A]"
          >
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            placeholder="Jane Operator"
            className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0C] px-3 py-2.5 text-sm text-[#FAFAFA] placeholder:text-[#52525B] focus:border-[#06B6D4] focus:outline-none focus:ring-1 focus:ring-[#06B6D4]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="company"
            className="block text-[10px] font-mono uppercase tracking-widest text-[#71717A]"
          >
            Company
          </label>
          <input
            id="company"
            name="company"
            type="text"
            placeholder="Acme Inc."
            className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0C] px-3 py-2.5 text-sm text-[#FAFAFA] placeholder:text-[#52525B] focus:border-[#06B6D4] focus:outline-none focus:ring-1 focus:ring-[#06B6D4]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="role_in_company"
            className="block text-[10px] font-mono uppercase tracking-widest text-[#71717A]"
          >
            Your role
          </label>
          <input
            id="role_in_company"
            name="role_in_company"
            type="text"
            placeholder="Head of Engineering"
            className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0C] px-3 py-2.5 text-sm text-[#FAFAFA] placeholder:text-[#52525B] focus:border-[#06B6D4] focus:outline-none focus:ring-1 focus:ring-[#06B6D4]/40"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-[#06B6D4] px-4 py-2.5 text-sm font-semibold text-[#09090B] hover:bg-[#0891B2] transition-colors"
        >
          Send magic link & submit
        </button>

        <p className="text-xs text-[#71717A] leading-relaxed pt-1">
          We’ll email <span className="text-[#FAFAFA] font-medium">{email}</span> a sign-in link.
          Your request enters the queue once you click it.
        </p>
      </form>
    </>
  );
}

function StepPending({ email }: { email: string }) {
  return (
    <div className="space-y-5">
      <div className="text-[10px] font-mono uppercase tracking-widest text-[#06B6D4]">
        Request received
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">
        Check your inbox to finish.
      </h2>
      <p className="text-sm text-[#A1A1AA] leading-relaxed">
        We sent a magic link to{' '}
        <span className="font-medium text-[#FAFAFA]">{email || 'your email'}</span>. Click it to
        verify, then we’ll review your access within 24 hours and email you when the studio is
        ready for you.
      </p>
      <div className="rounded-xl border border-[#27272A] bg-[#0F0F12] p-4 space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
          What happens next
        </div>
        <ul className="space-y-1.5 text-xs text-[#A1A1AA]">
          <li>1. Click the magic link in your inbox to verify your email.</li>
          <li>2. We review the request manually (typically same business day).</li>
          <li>3. You get an approval email; sign in to land in your workspace.</li>
        </ul>
      </div>
      <Link
        href="/login"
        className="inline-flex items-center text-xs font-mono uppercase tracking-widest text-[#06B6D4] hover:text-[#22D3EE]"
      >
        ← Back to sign in
      </Link>
    </div>
  );
}
