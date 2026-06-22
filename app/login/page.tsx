import Link from 'next/link';
import { signInWithPassword } from '@/app/auth/actions';
import { BrandPanel, SageLogo } from '@/components/auth/brand-panel';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { GradientMesh } from '@/components/auth/gradient-mesh';

export const metadata = {
  title: 'Sign in · Sage Ideas',
  description: 'Secure client and studio access for Sage Ideas engagements.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{
    error?: string;
    next?: string;
    audience?: string;
  }>;
};

const COPY = {
  studio: {
    kicker: 'Studio access. Built for clients and craft.',
    heading: 'Sign in to the studio',
    sub: 'Use the email and password tied to your engagement, or continue with a connected account.',
    mobileLabel: 'Sage Ideas Studio',
    accent: '#3D5AFE',
    newPrompt: 'Need studio access?',
    newCta: 'Request an account →',
  },
  academy: {
    kicker: 'Sage Academy. Learn to build, by building.',
    heading: 'Sign in to keep learning',
    sub: 'Use the email tied to your membership to reach your courses, labs, and certificates.',
    mobileLabel: 'Sage Academy',
    accent: '#18b663',
    newPrompt: 'New to the Academy?',
    newCta: 'Join — $20/mo, instant access →',
  },
} as const;

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const error = sp.error;
  const next = sp.next ?? '/auth/redirect';
  // Which door is this? Explicit ?audience, or inferred from an academy destination.
  const audience: 'studio' | 'academy' =
    sp.audience === 'academy' || next.startsWith('/academy') ? 'academy' : 'studio';
  const c = COPY[audience];
  const signupHref =
    audience === 'academy'
      ? '/academy/join'
      : next !== '/auth/redirect'
        ? `/signup?next=${encodeURIComponent(next)}`
        : '/signup';

  return (
    <div className="relative min-h-screen flex bg-[#09090B]">
      <GradientMesh />
      <div className="relative z-10 flex flex-1">
        <BrandPanel audience={audience} />

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-3 text-[#FAFAFA] mb-8">
              <SageLogo />
              <span className="font-semibold">{c.mobileLabel}</span>
            </div>

            <div className="space-y-2 mb-8">
              <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: c.accent }}>
                {c.kicker}
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">
                {c.heading}
              </h2>
              <p className="text-sm text-[#A8A29E]">{c.sub}</p>
            </div>

            <div aria-live="polite" aria-atomic="true">
              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-lg border border-[#7F1D1D]/50 bg-[#7F1D1D]/10 px-3 py-2.5 text-sm text-[#FCA5A5]"
                >
                  {decodeURIComponent(error)}
                </div>
              )}
            </div>

            <form action={signInWithPassword} className="space-y-4">
              <input type="hidden" name="next" value={next} />
              <div>
                <label
                  htmlFor="email"
                  className="block text-[10px] font-mono uppercase tracking-widest text-[#78716C] mb-2"
                >
                  Work email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-[#2A2826] bg-[#0B0A09] px-3 py-2.5 text-sm text-[#FAFAFA] placeholder:text-[#52525B] focus:border-[#3D5AFE] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5AFE]/40"
                />
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="text-[10px] font-mono uppercase tracking-widest text-[#78716C]"
                  >
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-[#3D5AFE] hover:text-[#5670ff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5AFE]/60 rounded-sm"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-[#2A2826] bg-[#0B0A09] px-3 py-2.5 text-sm text-[#FAFAFA] placeholder:text-[#52525B] focus:border-[#3D5AFE] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5AFE]/40"
                />
              </div>
              <button
                type="submit"
                style={{ background: c.accent }}
                className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-[#09090B] hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] transition-all"
              >
                Sign in
              </button>
            </form>

            <div className="my-6 flex items-center gap-3" role="separator" aria-hidden>
              <div className="flex-1 h-px bg-[#2A2826]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#52525B]">
                or continue with
              </span>
              <div className="flex-1 h-px bg-[#2A2826]" />
            </div>

            <OAuthButtons next={next} />

            <p className="mt-8 text-center text-sm text-[#A8A29E]">
              {c.newPrompt}{' '}
              <Link
                href={signupHref}
                style={{ color: c.accent }}
                className="hover:brightness-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-sm"
              >
                {c.newCta}
              </Link>
            </p>

            {/* Cross-door link so people who hit the wrong house can switch. */}
            <p className="mt-3 text-center text-xs text-[#52525B]">
              {audience === 'academy' ? (
                <Link href="/login" className="hover:text-[#A8A29E]">
                  Studio client? Sign in here →
                </Link>
              ) : (
                <Link href="/login?audience=academy&next=/academy/dashboard" className="hover:text-[#A8A29E]">
                  Here to learn? Academy sign-in →
                </Link>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
