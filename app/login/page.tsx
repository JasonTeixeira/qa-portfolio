import Link from 'next/link';
import { signInWithPassword } from '@/app/auth/actions';
import { AuthShell, AuthSubmit, authFieldClass } from '@/components/auth/auth-shell';

export const metadata = {
  title: 'Sign in · Sage Ideas',
  description: 'Secure client and studio access for Sage Ideas engagements.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ error?: string; next?: string; audience?: string }>;
};

const COPY = {
  studio: {
    kicker: 'Studio access',
    heading: 'Welcome back to the studio.',
    sub: 'Sign in with the email tied to your engagement, or continue with a connected account.',
    signUpLabel: 'Request access',
  },
  academy: {
    kicker: 'Sage Academy',
    heading: 'Sign in to keep learning.',
    sub: 'Reach your courses, hands-on labs, and certificates — right where you left off.',
    signUpLabel: 'Create account',
  },
} as const;

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const error = sp.error ? decodeURIComponent(sp.error) : undefined;
  const next = sp.next ?? '/auth/redirect';
  const audience: 'studio' | 'academy' =
    sp.audience === 'academy' || next.startsWith('/academy') ? 'academy' : 'studio';
  const c = COPY[audience];

  const signInHref = audience === 'academy' ? '/login?audience=academy&next=/academy/dashboard' : '/login';
  const signUpHref =
    audience === 'academy'
      ? '/academy/signup'
      : next !== '/auth/redirect'
        ? `/signup?next=${encodeURIComponent(next)}`
        : '/signup';

  return (
    <AuthShell
      audience={audience}
      mode="signin"
      kicker={c.kicker}
      heading={c.heading}
      sub={c.sub}
      error={error}
      next={next}
      signInHref={signInHref}
      signUpHref={signUpHref}
      signUpLabel={c.signUpLabel}
      footer={
        <p className="text-[12px] text-[#52525B]">
          {audience === 'academy' ? (
            <Link href="/login" className="hover:text-[#9C9CA6] transition-colors">
              Studio client? Sign in here →
            </Link>
          ) : (
            <Link
              href="/login?audience=academy&next=/academy/dashboard"
              className="hover:text-[#9C9CA6] transition-colors"
            >
              Here to learn? Academy sign-in →
            </Link>
          )}
        </p>
      }
    >
      <form action={signInWithPassword} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label
            htmlFor="email"
            className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#8A8A94] mb-1.5"
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
            className={authFieldClass}
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <label htmlFor="password" className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#8A8A94]">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-[12px] text-[#9C9CA6] hover:text-white transition-colors rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              Forgot?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            className={authFieldClass}
          />
        </div>
        <AuthSubmit>Sign in</AuthSubmit>
      </form>
    </AuthShell>
  );
}
