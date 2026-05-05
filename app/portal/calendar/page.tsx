import { getPortalContext } from '@/lib/portal/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Topbar } from '@/components/portal/topbar';
import { Card, CardContent } from '@/components/portal/ui/card';
import { Badge } from '@/components/portal/ui/badge';
import { Calendar as CalendarIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Calendar' };

type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  event_type: string;
  location: string | null;
};

export default async function CalendarPage() {
  const ctx = await getPortalContext();
  const sb = supabaseAdmin();

  let events: CalendarEvent[] = [];
  if (ctx.organizationId) {
    const { data: engs } = await sb
      .from('engagements')
      .select('id')
      .eq('organization_id', ctx.organizationId);
    const ids = (engs ?? []).map((e) => e.id);
    if (ids.length > 0) {
      const { data } = await sb
        .from('calendar_events')
        .select('id, title, description, starts_at, ends_at, event_type, location')
        .in('engagement_id', ids)
        .eq('visible_to_client', true)
        .gte('starts_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('starts_at', { ascending: true });
      events = data ?? [];
    }
  }

  return (
    <>
      <Topbar crumbs={[{ label: 'Calendar' }]} />
      <div className="px-6 lg:px-8 py-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-[#fafafa]">Calendar</h1>
          <p className="text-sm text-[#a1a1aa] mt-1">
            Meetings, milestones, and deadlines for your engagements. Full calendar view
            ships next deploy.
          </p>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#18181b] border border-[#27272a] mx-auto flex items-center justify-center mb-4">
                <CalendarIcon className="w-5 h-5 text-[#71717a]" />
              </div>
              <h3 className="font-semibold text-[#fafafa]">Nothing on the books</h3>
              <p className="text-sm text-[#71717a] mt-1.5">
                Once Sage schedules a meeting or milestone, it lands here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {events.map((ev) => (
              <Card key={ev.id}>
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-medium text-[#fafafa]">{ev.title}</span>
                      <Badge tone="cyan">{ev.event_type}</Badge>
                    </div>
                    <div className="text-xs text-[#71717a]">
                      {new Date(ev.starts_at).toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                      {ev.location ? ` · ${ev.location}` : ''}
                    </div>
                    {ev.description && (
                      <p className="text-xs text-[#a1a1aa] mt-1 line-clamp-2">
                        {ev.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-[#52525b] tabular-nums shrink-0">
                    {formatDate(ev.starts_at)}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
