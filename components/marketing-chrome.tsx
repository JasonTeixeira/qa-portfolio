import { headers } from 'next/headers';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { BackToTop } from '@/components/back-to-top';
import { CommandPalette } from '@/components/command-palette';
import { SkipToContent } from '@/components/skip-to-content';
import { PageTransition } from '@/components/motion';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Renders the marketing site chrome (nav, footer, command palette) only
 * on non-portal routes. The /portal/* and /login routes have their own
 * layouts.
 *
 * Detection: middleware sets x-portal: 1 on portal/login routes.
 */
export async function MarketingChrome({
  position,
  children,
}: {
  position: 'top' | 'bottom' | 'children';
  children?: React.ReactNode;
}) {
  const h = await headers();
  const isPortal = h.get('x-portal') === '1';

  if (isPortal) {
    if (position === 'children') return <>{children}</>;
    return null;
  }

  if (position === 'top') {
    let isSignedIn = false;
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      isSignedIn = !!user;
    } catch {
      isSignedIn = false;
    }
    return (
      <>
        <SkipToContent />
        <CommandPalette />
        <Navigation isSignedIn={isSignedIn} />
      </>
    );
  }
  if (position === 'bottom') {
    return (
      <>
        <Footer />
        <BackToTop />
      </>
    );
  }
  // children -> wrap in <main>
  return (
    <main id="main-content" className="flex-1" tabIndex={-1}>
      <PageTransition>{children}</PageTransition>
    </main>
  );
}
