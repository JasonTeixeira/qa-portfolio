import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { AdminTopbar } from '@/components/admin/topbar';
import {
  AdminSettingsTabs,
  type StudioSettings,
  type TeamMember,
} from '@/components/admin/settings-tabs';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings' };

const DEFAULT_SETTINGS: StudioSettings = {
  org_name: 'Sage Ideas',
  default_tax_rate: 0,
  business_hours: {
    mon: '9-17',
    tue: '9-17',
    wed: '9-17',
    thu: '9-17',
    fri: '9-17',
    sat: null,
    sun: null,
  },
  logo_url: null,
  primary_color: '#06B6D4',
  secondary_color: '#0E7490',
};

export default async function AdminSettingsPage() {
  const { profile } = await requireAdmin();
  const sb = supabaseAdmin();

  const [settingsRes, teamRes] = await Promise.all([
    sb
      .from('studio_settings')
      .select('org_name, default_tax_rate, business_hours, logo_url, primary_color, secondary_color')
      .eq('id', 1)
      .maybeSingle(),
    sb
      .from('profiles')
      .select('id, email, full_name, app_role, approval_status')
      .in('app_role', ['admin', 'collaborator'])
      .order('created_at', { ascending: true }),
  ]);

  const raw = settingsRes.data as Partial<StudioSettings> | null;
  const settings: StudioSettings = {
    ...DEFAULT_SETTINGS,
    ...(raw ?? {}),
    business_hours:
      (raw?.business_hours as Record<string, string | null> | undefined) ??
      DEFAULT_SETTINGS.business_hours,
    default_tax_rate: Number(raw?.default_tax_rate ?? 0),
  };

  const team = (teamRes.data ?? []) as TeamMember[];

  const integrations = {
    stripe: !!process.env.STRIPE_SECRET_KEY,
    resend: !!process.env.RESEND_API_KEY,
    google: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
  };

  return (
    <>
      <AdminTopbar
        crumbs={[{ label: 'Settings' }]}
        email={profile.email}
        fullName={profile.full_name}
      />
      <div className="px-6 lg:px-8 py-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-[#fafafa]">Settings</h1>
          <p className="text-sm text-[#a1a1aa] mt-1">Studio defaults, branding, integrations, team.</p>
        </div>
        <AdminSettingsTabs settings={settings} integrations={integrations} team={team} />
      </div>
    </>
  );
}
