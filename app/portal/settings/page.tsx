import { getPortalContext } from '@/lib/portal/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Topbar } from '@/components/portal/topbar';
import { Card, CardContent } from '@/components/portal/ui/card';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const ctx = await getPortalContext();
  const sb = supabaseAdmin();
  const { data: profile } = await sb
    .from('profiles')
    .select('email, full_name, app_role, approval_status, created_at')
    .eq('id', ctx.user.clerk_id)
    .maybeSingle();

  return (
    <>
      <Topbar crumbs={[{ label: 'Settings' }]} />
      <div className="px-6 lg:px-8 py-8 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#fafafa]">Settings</h1>
          <p className="text-sm text-[#a1a1aa] mt-1">
            Profile, organization, and notification preferences. Editing ships in the
            next deploy.
          </p>
        </div>

        <section>
          <h2 className="text-sm font-medium uppercase tracking-wider text-[#52525b] mb-3">
            Profile
          </h2>
          <Card>
            <CardContent className="p-5 space-y-3 text-sm">
              <Row label="Name" value={profile?.full_name ?? '—'} />
              <Row label="Email" value={profile?.email ?? ctx.user.email} />
              <Row label="Role" value={profile?.app_role ?? '—'} />
              <Row label="Status" value={profile?.approval_status ?? '—'} />
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-sm font-medium uppercase tracking-wider text-[#52525b] mb-3">
            Organization
          </h2>
          <Card>
            <CardContent className="p-5 space-y-3 text-sm">
              <Row label="Name" value={ctx.organizationName ?? '—'} />
              <Row label="ID" value={ctx.organizationId ?? '—'} />
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-sm font-medium uppercase tracking-wider text-[#52525b] mb-3">
            Notifications
          </h2>
          <Card>
            <CardContent className="p-5 text-sm text-[#a1a1aa]">
              Email and in-app notification preferences ship in the next deploy.
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[#71717a]">{label}</span>
      <span className="text-[#fafafa] truncate">{value}</span>
    </div>
  );
}
