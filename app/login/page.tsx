import Link from 'next/link';
import { signInWithMagicLink } from '@/app/auth/actions';
import { BrandPanel, SageLogo } from '@/components/auth/brand-panel';
import { OAuthButtons } from '@/components/auth/oauth-buttons';

export const metadata = {
  title: 'Sign in · Sage Ideas',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{
    sent?: string;
    email?: string;
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const sent = sp.sent === '1';
  const sentEmail = sp.email ?? '';
  const error = sp.error;
  const next = sp.next ?? '/auth/redirect';

  return (
    <div className="min-h-screen flex bg-[#09090B]">
      <BrandPanel />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 text-[#FAFAFA] mb-8">
            <SageLogo />
            <span className="font-semibold">Sage Ideas Studio</span>
          </div>

          <div className="space-y-1.5 mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">
              Sign in to the studio
            </h2>
            <p className="text-sm text-[#A1A1AA]">
              Use the email tied to your engagement, or continue with a connected account.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-[#7F1D1D]/50 bg-[#7F1D1D]/10 px-3 py-2.5 text-sm text-[#FCA5A5]">
              {decodeURIComponent(error)}
            </div>
          )}

          {sent ? (
            <div className="rounded-xl border border-[#06B6D4]/30 bg-[#06B6D4]/5 px-5 py-6 space-y-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#06B6D4]">
                Magic link sent
              </div>
              <p className="text-sm text-[#FAFAFA]">
                Check <span className="font-medium">{sentEmail}</span> for a link from Sage Ideas.
                Click it to finish signing in.
              </p>
              <p className="text-xs text-[#71717A]">
                The link expires in 1 hour. Didn’t get it? Check spam, then{' '}
                <Link href="/login" className="text-[#06B6D4] hover:text-[#22D3EE]">
                  request a new one
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              <form action={signInWithMagicLink} className="space-y-2.5">
                <input type="hidden" name="next" value={next} />
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
                  Send magic link
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-[#27272A]" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#52525B]">
                  or continue with
                </span>
                <div className="flex-1 h-px bg-[#27272A]" />
              </div>

              <OAuthButtons next={next} />
            </>
          )}

          <p className="mt-8 text-xs text-[#71717A] text-center">
            New here?{' '}
            <Link href="/signup" className="text-[#06B6D4] hover:text-[#22D3EE]">
              Request access →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
