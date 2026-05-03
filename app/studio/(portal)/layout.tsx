import { getPortalContext } from '@/lib/portal/auth';
import { Sidebar } from '@/components/portal/sidebar';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getPortalContext();
  return (
    <div className="flex min-h-screen bg-[#09090B]">
      <Sidebar isAdmin={ctx.isAdmin} orgName={ctx.organizationName ?? undefined} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
