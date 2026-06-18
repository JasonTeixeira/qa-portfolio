import type { ReactNode } from 'react';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { AdminTopbar } from '@/components/admin/topbar';
import { Card, CardContent } from '@/components/portal/ui/card';
import { Badge } from '@/components/portal/ui/badge';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Discord', robots: { index: false, follow: false } };

type DiscordEventRow = {
  id: string;
  event_type: string;
  command_name: string | null;
  discord_username: string | null;
  discord_user_id: string | null;
  channel_base_name: string | null;
  created_at: string;
};

type DiscordMemberRow = {
  discord_user_id: string;
  username: string | null;
  path_key: string | null;
  level_key: string | null;
  premium_member: boolean;
  premium_status: string | null;
  last_seen_at: string;
};

type DiscordRunRow = {
  run_key: string;
  kind: string;
  status: string;
  message_id: string | null;
  posted_at: string;
};

export default async function AdminDiscordPage() {
  const { profile } = await requireAdmin();
  const sb = supabaseAdmin();

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [eventsRes, membersRes, runsRes, eventCountRes, premiumCountRes] = await Promise.all([
    sb
      .from('discord_events')
      .select('id, event_type, command_name, discord_username, discord_user_id, channel_base_name, created_at')
      .order('created_at', { ascending: false })
      .limit(80),
    sb
      .from('discord_members')
      .select('discord_user_id, username, path_key, level_key, premium_member, premium_status, last_seen_at')
      .order('last_seen_at', { ascending: false })
      .limit(80),
    sb
      .from('discord_scheduled_runs')
      .select('run_key, kind, status, message_id, posted_at')
      .order('posted_at', { ascending: false })
      .limit(20),
    sb
      .from('discord_events')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since.toISOString()),
    sb
      .from('discord_members')
      .select('discord_user_id', { count: 'exact', head: true })
      .eq('premium_member', true),
  ]);

  const events = (eventsRes.data ?? []) as DiscordEventRow[];
  const members = (membersRes.data ?? []) as DiscordMemberRow[];
  const runs = (runsRes.data ?? []) as DiscordRunRow[];
  const commandInvokes = events.filter((event) => event.event_type === 'command_invoked').length;
  const failedEvents = events.filter((event) => event.event_type.includes('failed')).length;

  return (
    <>
      <AdminTopbar
        crumbs={[{ label: 'Discord' }]}
        email={profile.email}
        fullName={profile.full_name}
      />
      <div className="px-6 lg:px-8 py-8 max-w-6xl mx-auto space-y-6" data-testid="admin-discord">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#fafafa]">Discord</h1>
          <p className="text-sm text-[#a1a1aa] mt-1">
            SageBot commands, onboarding, premium role sync, and scheduled community content.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Stat label="Events, 30d" value={eventCountRes.count ?? 0} />
          <Stat label="Tracked members" value={members.length} />
          <Stat label="Premium members" value={premiumCountRes.count ?? 0} />
          <Stat label="Failures visible" value={failedEvents} tone={failedEvents > 0 ? 'rose' : 'emerald'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-sm font-medium text-[#fafafa]">Recent events</h2>
                <span className="text-xs text-[#71717a]">{commandInvokes} commands in view</span>
              </div>
              <Rows empty="No Discord events recorded yet.">
                {events.map((event) => (
                  <div key={event.id} className="grid grid-cols-12 gap-2 px-3 py-2 text-xs items-center">
                    <div className="col-span-3">
                      <Badge tone={event.event_type.includes('failed') ? 'rose' : 'neutral'}>
                        {event.event_type}
                      </Badge>
                    </div>
                    <div className="col-span-3 text-[#a1a1aa] truncate font-mono">
                      {event.command_name ?? event.channel_base_name ?? 'system'}
                    </div>
                    <div className="col-span-3 text-[#a1a1aa] truncate">
                      {event.discord_username ?? event.discord_user_id ?? '-'}
                    </div>
                    <div className="col-span-3 text-[#71717a] truncate">
                      {new Date(event.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </Rows>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-medium text-[#fafafa] mb-3">Members</h2>
              <Rows empty="No Discord members tracked yet.">
                {members.map((member) => (
                  <div key={member.discord_user_id} className="grid grid-cols-12 gap-2 px-3 py-2 text-xs items-center">
                    <div className="col-span-3 text-[#fafafa] truncate">
                      {member.username ?? member.discord_user_id}
                    </div>
                    <div className="col-span-3 text-[#a1a1aa] truncate">
                      {member.path_key ?? '-'} / {member.level_key ?? '-'}
                    </div>
                    <div className="col-span-3">
                      <Badge tone={member.premium_member ? 'emerald' : 'neutral'}>
                        {member.premium_status ?? (member.premium_member ? 'premium' : 'free')}
                      </Badge>
                    </div>
                    <div className="col-span-3 text-[#71717a] truncate">
                      {new Date(member.last_seen_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </Rows>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-medium text-[#fafafa] mb-3">Scheduled content runs</h2>
            <Rows empty="No scheduled Discord runs recorded yet.">
              {runs.map((run) => (
                <div key={run.run_key} className="grid grid-cols-12 gap-2 px-3 py-2 text-xs items-center">
                  <div className="col-span-4 font-mono text-[#a1a1aa] truncate">{run.run_key}</div>
                  <div className="col-span-2"><Badge tone={run.status === 'failed' ? 'rose' : 'emerald'}>{run.status}</Badge></div>
                  <div className="col-span-3 text-[#a1a1aa] truncate">{run.kind}</div>
                  <div className="col-span-3 text-[#71717a] truncate">{new Date(run.posted_at).toLocaleString()}</div>
                </div>
              ))}
            </Rows>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Stat({ label, value, tone = 'neutral' }: { label: string; value: number; tone?: 'neutral' | 'emerald' | 'rose' }) {
  const color = tone === 'emerald' ? 'text-[#34d399]' : tone === 'rose' ? 'text-[#fb7185]' : 'text-[#fafafa]';
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wider text-[#71717a]">{label}</div>
        <div className={`mt-2 text-2xl font-semibold tabular-nums ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function Rows({ children, empty }: { children: ReactNode[]; empty: string }) {
  if (children.length === 0) {
    return <p className="text-xs text-[#71717a]">{empty}</p>;
  }
  return <div className="rounded-lg border border-[#27272a] divide-y divide-[#1f1f23]">{children}</div>;
}
