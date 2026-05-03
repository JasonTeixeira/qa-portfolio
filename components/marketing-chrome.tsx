'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { BackToTop } from '@/components/back-to-top';
import { CommandPalette } from '@/components/command-palette';
import { SkipToContent } from '@/components/skip-to-content';

/**
 * Renders the marketing site chrome (nav, footer, command palette) only
 * on non-portal routes. The /studio/* namespace has its own sidebar layout.
 */
export function MarketingChrome({
  position,
  children,
}: {
  position: 'top' | 'bottom' | 'children';
  children?: React.ReactNode;
}) {
  const pathname = usePathname() || '/';
  const isPortal = pathname.startsWith('/studio');

  if (isPortal) {
    if (position === 'children') return <>{children}</>;
    return null;
  }

  if (position === 'top') {
    return (
      <>
        <SkipToContent />
        <CommandPalette />
        <Navigation />
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
      {children}
    </main>
  );
}
