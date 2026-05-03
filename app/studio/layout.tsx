import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

// Portal is fully auth-gated and DB-backed. Skip static optimization
// so Clerk has runtime access to env vars and request context.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: {
    default: 'The Studio · Sage Ideas',
    template: '%s · The Studio',
  },
  description:
    'Your private workspace for Sage Ideas engagements. Real-time deliverables, signed contracts, and direct messaging.',
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#06b6d4',
          colorBackground: '#0f0f12',
          colorInputBackground: '#18181b',
          colorInputText: '#fafafa',
          colorText: '#fafafa',
          colorTextSecondary: '#a1a1aa',
          borderRadius: '0.75rem',
        },
        elements: {
          card: 'bg-[#0f0f12] border border-[#27272a]',
          formButtonPrimary:
            'bg-[#06b6d4] hover:bg-[#0891b2] text-[#09090b] font-medium',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
