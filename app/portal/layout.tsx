import { getPortalContext } from '@/lib/portal/auth';
import { Sidebar } from '@/components/portal/sidebar';

// Portal is fully auth-gated and DB-backed. Skip static optimization
// so Clerk has runtime access to env vars and request context.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: { default: 'Portal · Sage Ideas', template: '%s · Sage Ideas Portal' },
  description:
    'Your private workspace for Sage Ideas engagements. Real-time deliverables, signed contracts, and direct messaging.',
  robots: { index: false, follow: false },
};

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getPortalContext();
  return (
    <div className="flex min-h-screen bg-[#09090B]">
      <Sidebar isAdmin={ctx.isAdmin} orgName={ctx.organizationName ?? undefined} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
