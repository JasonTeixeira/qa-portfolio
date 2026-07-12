import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { AdminTopbar } from '@/components/admin/topbar';
import {
  AdminCalendar,
  type AdminCalendarEvent,
  type EngagementOption,
} from '@/components/admin/calendar-admin';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Calendar' };

type RawEvent = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  event_type: string | null;
  location: string | null;
  all_day: boolean | null;
  engagement_id: string | null;
  visible_to_client: boolean | null;
};

export default async function AdminCalendarPage() {
  const { profile } = await requireAdmin();
  const sb = supabaseAdmin();

  const horizonStart = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const horizonEnd = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();

  const [eventsRes, engsRes] = await Promise.all([
    sb
      .from('calendar_events')
      .select(
        'id, title, description, starts_at, ends_at, event_type, location, all_day, engagement_id, visible_to_client',
      )
      .gte('starts_at', horizonStart)
      .lte('starts_at', horizonEnd)
      .order('starts_at', { ascending: true }),
    sb
      .from('engagements')
      .select('id, title, organizations(name)')
      .order('updated_at', { ascending: false })
      .limit(200),
  ]);

  const events: AdminCalendarEvent[] = ((eventsRes.data ?? []) as RawEvent[]).map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    starts_at: e.starts_at,
    ends_at: e.ends_at,
    all_day: !!e.all_day,
    event_type: e.event_type ?? 'meeting',
    location: e.location,
    engagement_id: e.engagement_id,
    visible_to_client: e.visible_to_client !== false,
  }));

  const engagements: EngagementOption[] = (
    (engsRes.data ?? []) as unknown as {
      id: string;
      title: string;
      organizations: { name: string | null } | null;
    }[]
  ).map((e) => ({
    id: e.id,
    label: e.organizations?.name ? `${e.title} · ${e.organizations.name}` : e.title,
  }));

  return (
    <>
      <AdminTopbar
        crumbs={[{ label: 'Calendar' }]}
        email={profile.email}
        fullName={profile.full_name}
      />
      <div className="px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-[#fafafa]">Calendar</h1>
          <p className="text-sm text-[#a1a1aa] mt-1">
            All events. Admins see internal and client-visible.
          </p>
        </div>
        <AdminCalendar initial={events} engagements={engagements} />
      </div>
    </>
  );
}
