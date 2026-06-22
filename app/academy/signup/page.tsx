import Link from 'next/link';
import { signUpAcademy } from '@/app/auth/actions';
import { BrandPanel, SageLogo } from '@/components/auth/brand-panel';
import { GradientMesh } from '@/components/auth/gradient-mesh';

export const metadata = {
  title: 'Join Sage Academy',
  description: 'Create your free Sage Academy account and start building.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const ACCENT = '#18b663';

type Props = { searchParams: Promise<{ error?: string; email?: string }> };

export default async function AcademySignupPage({ searchParams }: Props) {
  const sp = await searchParams;

  return (
    <div className="relative min-h-screen flex bg-[#0b0d0c]">
      <GradientMesh />
      <div className="relative z-10 flex flex-1">
        <BrandPanel audience="academy" />

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-3 text-[#F2EFE9] mb-8">
              <SageLogo />
              <span className="font-semibold">Sage Academy</span>
            </div>

            <div className="space-y-2 mb-8">
              <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: ACCENT }}>
                Free account · instant access
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#F2EFE9]">
                Start learning today.
              </h2>
              <p className="text-sm text-[#9C9CA6]">
                Create a free account to track progress and keep what you build. Upgrade to Pro
                ($20/mo) any time for every course and lab.
              </p>
            </div>

            <div aria-live="polite" aria-atomic="true">
              {sp.error && (
                <div
                  role="alert"
                  className="mb-5 rounded-lg border border-[#7F1D1D]/50 bg-[#7F1D1D]/10 px-3 py-2.5 text-sm text-[#FCA5A5]"
                >
                  {decodeURIComponent(sp.error)}
                </div>
              )}
            </div>

            <form action={signUpAcademy} className="space-y-4">
              <div>
                <label htmlFor="full_name" className="block text-[10px] font-mono uppercase tracking-widest text-[#8A8A94] mb-2">
                  Name <span className="opacity-50">(optional)</span>
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  className="w-full rounded-lg border border-[#1C2420] bg-[#070908] px-3 py-2.5 text-sm text-[#F2EFE9] placeholder:text-[#52525B] focus:border-[#18b663] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#18b663]/40"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-[10px] font-mono uppercase tracking-widest text-[#8A8A94] mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  defaultValue={sp.email ?? ''}
                  placeholder="you@email.com"
                  className="w-full rounded-lg border border-[#1C2420] bg-[#070908] px-3 py-2.5 text-sm text-[#F2EFE9] placeholder:text-[#52525B] focus:border-[#18b663] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#18b663]/40"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-[10px] font-mono uppercase tracking-widest text-[#8A8A94] mb-2">
                  Password <span className="opacity-50">(8+ characters)</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-[#1C2420] bg-[#070908] px-3 py-2.5 text-sm text-[#F2EFE9] placeholder:text-[#52525B] focus:border-[#18b663] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#18b663]/40"
                />
              </div>
              <button
                type="submit"
                style={{ background: ACCENT }}
                className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-[#04130c] hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0d0c] transition-all"
              >
                Create account & start →
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[#9C9CA6]">
              Already have an account?{' '}
              <Link
                href="/login?audience=academy&next=/academy/dashboard"
                style={{ color: ACCENT }}
                className="hover:brightness-125 focus:outline-none rounded-sm"
              >
                Sign in →
              </Link>
            </p>
            <p className="mt-3 text-center text-xs text-[#52525B]">
              <Link href="/academy" className="hover:text-[#9C9CA6]">← Back to the Academy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
