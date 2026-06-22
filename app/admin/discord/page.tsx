import type { ReactNode } from 'react';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { AdminTopbar } from '@/components/admin/topbar';
import { Card, CardContent } from '@/components/portal/ui/card';
import { Badge } from '@/components/portal/ui/badge';
import {
  approveDiscordApplication,
  rejectDiscordApplication,
  reviewDiscordChallengeSubmissionAction,
  reviewDiscordContentDraftAction,
  updateDiscordContentQueueStatus,
} from './actions';

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
  weekly_time_budget: string | null;
  preferred_support: string | null;
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

type DiscordPointsRow = {
  discord_user_id: string;
  discord_username: string | null;
  points: number;
};

type DiscordContentQueueRow = {
  id: string;
  idea: string;
  source: string;
  discord_username: string | null;
  status: string;
  priority: number;
  created_at: string;
};

type DiscordContentDraftRow = {
  id: string;
  draft_type: string;
  target_channel_base_name: string;
  title: string | null;
  body: string;
  status: string;
  quality_score: number;
  created_at: string;
};

type DiscordApplicationRow = {
  id: string;
  discord_user_id: string;
  discord_username: string | null;
  goal: string;
  experience: string;
  intended_build: string;
  path_key: string | null;
  level_key: string | null;
  timezone: string | null;
  weekly_time_budget: string | null;
  preferred_support: string | null;
  status: string;
  submitted_at: string;
};

type DiscordQuizRow = {
  quiz_key: string;
  prompt: string;
  active: boolean;
  created_at: string;
};

type DiscordChallengeRow = {
  challenge_key: string;
  title: string;
  active: boolean;
  points: number;
  created_at: string;
};

type DiscordChallengeSubmissionRow = {
  id: string;
  challenge_key: string;
  discord_user_id: string;
  discord_username: string | null;
  summary: string;
  link: string | null;
  status: string;
  points_awarded: number;
  created_at: string;
};

type DiscordCalendarRow = {
  calendar_date: string;
  theme: string | null;
  daily_prompt: string | null;
  status: string;
};

type DiscordQuestionRow = {
  id: string;
  question: string;
  discord_username: string | null;
  status: string;
  created_at: string;
};

type DiscordAnswerRow = {
  id: string;
  question_id: string;
  answer: string;
  discord_username: string | null;
  helpful: boolean;
  created_at: string;
};

type DiscordGatewayHeartbeatRow = {
  worker_id: string;
  status: string;
  session_id: string | null;
  sequence: number | null;
  last_seen_at: string;
  last_close_code: number | null;
  last_close_reason: string | null;
};

export default async function AdminDiscordPage() {
  const { profile } = await requireAdmin();
  const sb = supabaseAdmin();

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [
    eventsRes,
    membersRes,
    runsRes,
    eventCountRes,
    premiumCountRes,
    pointsRes,
    contentQueueRes,
    contentDraftsRes,
    applicationsRes,
    quizzesRes,
    challengesRes,
    challengeSubmissionsRes,
    calendarRes,
    questionsRes,
    answersRes,
    gatewayEventCountRes,
    gatewayMessageCountRes,
    gatewayReactionCountRes,
    gatewayHeartbeatsRes,
    gatewayDeadLetterCountRes,
  ] = await Promise.all([
    sb
      .from('discord_events')
      .select('id, event_type, command_name, discord_username, discord_user_id, channel_base_name, created_at')
      .order('created_at', { ascending: false })
      .limit(80),
	    sb
	      .from('discord_members')
	      .select('discord_user_id, username, path_key, level_key, weekly_time_budget, preferred_support, premium_member, premium_status, last_seen_at')
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
    sb
      .from('discord_points_ledger')
      .select('discord_user_id, discord_username, points')
      .order('created_at', { ascending: false })
      .limit(1000),
    sb
      .from('discord_content_queue')
      .select('id, idea, source, discord_username, status, priority, created_at')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20),
    sb
      .from('discord_content_drafts')
      .select('id, draft_type, target_channel_base_name, title, body, status, quality_score, created_at')
      .in('status', ['draft', 'pending_approval'])
      .order('quality_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10),
	    sb
	      .from('discord_member_applications')
	      .select('id, discord_user_id, discord_username, goal, experience, intended_build, path_key, level_key, timezone, weekly_time_budget, preferred_support, status, submitted_at')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true })
      .limit(20),
    sb
      .from('discord_quizzes')
      .select('quiz_key, prompt, active, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    sb
      .from('discord_challenges')
      .select('challenge_key, title, active, points, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    sb
      .from('discord_challenge_submissions')
      .select('id, challenge_key, discord_user_id, discord_username, summary, link, status, points_awarded, created_at')
      .in('status', ['pending', 'approved'])
      .order('created_at', { ascending: false })
      .limit(20),
    sb
      .from('discord_content_calendar')
      .select('calendar_date, theme, daily_prompt, status')
      .order('calendar_date', { ascending: false })
      .limit(7),
    sb
      .from('discord_questions')
      .select('id, question, discord_username, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
    sb
      .from('discord_answers')
      .select('id, question_id, answer, discord_username, helpful, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
    sb
      .from('discord_gateway_events')
      .select('id', { count: 'exact', head: true }),
    sb
      .from('discord_messages')
      .select('discord_message_id', { count: 'exact', head: true }),
    sb
      .from('discord_reactions')
      .select('id', { count: 'exact', head: true }),
    sb
      .from('discord_gateway_heartbeats')
      .select('worker_id, status, session_id, sequence, last_seen_at, last_close_code, last_close_reason')
      .order('last_seen_at', { ascending: false })
      .limit(5),
    sb
      .from('discord_gateway_dead_letters')
      .select('id', { count: 'exact', head: true })
      .is('resolved_at', null),
  ]);

  const events = (eventsRes.data ?? []) as DiscordEventRow[];
  const members = (membersRes.data ?? []) as DiscordMemberRow[];
  const runs = (runsRes.data ?? []) as DiscordRunRow[];
  const pointsRows = (pointsRes.data ?? []) as DiscordPointsRow[];
  const contentQueue = (contentQueueRes.data ?? []) as DiscordContentQueueRow[];
  const contentDrafts = (contentDraftsRes.data ?? []) as DiscordContentDraftRow[];
  const applications = (applicationsRes.data ?? []) as DiscordApplicationRow[];
  const quizzes = (quizzesRes.data ?? []) as DiscordQuizRow[];
  const challenges = (challengesRes.data ?? []) as DiscordChallengeRow[];
  const challengeSubmissions = (challengeSubmissionsRes.data ?? []) as DiscordChallengeSubmissionRow[];
  const calendar = (calendarRes.data ?? []) as DiscordCalendarRow[];
  const questions = (questionsRes.data ?? []) as DiscordQuestionRow[];
  const answers = (answersRes.data ?? []) as DiscordAnswerRow[];
  const gatewayHeartbeats = (gatewayHeartbeatsRes.data ?? []) as DiscordGatewayHeartbeatRow[];
  const commandInvokes = events.filter((event) => event.event_type === 'command_invoked').length;
  const failedEvents = events.filter((event) => event.event_type.includes('failed')).length;
  const leaderboard = [...pointsRows.reduce((map, row) => {
    const current = map.get(row.discord_user_id) ?? {
      discord_user_id: row.discord_user_id,
      username: row.discord_username ?? row.discord_user_id,
      points: 0,
    };
    current.username = row.discord_username ?? current.username;
    current.points += Number(row.points ?? 0);
    map.set(row.discord_user_id, current);
    return map;
  }, new Map<string, { discord_user_id: string; username: string; points: number }>()).values()]
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);

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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat label="Gateway events" value={gatewayEventCountRes.count ?? 0} />
          <Stat label="Captured messages" value={gatewayMessageCountRes.count ?? 0} />
          <Stat label="Open dead letters" value={gatewayDeadLetterCountRes.count ?? 0} tone={(gatewayDeadLetterCountRes.count ?? 0) > 0 ? 'rose' : 'emerald'} />
        </div>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-medium text-[#fafafa]">Gateway worker health</h2>
              <span className="text-xs text-[#71717a]">{gatewayReactionCountRes.count ?? 0} captured reactions</span>
            </div>
            <Rows empty="No gateway worker heartbeat recorded yet.">
              {gatewayHeartbeats.map((heartbeat) => (
                <div key={heartbeat.worker_id} className="grid grid-cols-12 gap-2 px-3 py-2 text-xs items-center">
                  <div className="col-span-3 text-[#fafafa] truncate">{heartbeat.worker_id}</div>
                  <div className="col-span-2">
                    <Badge tone={['ready', 'resumed', 'heartbeat_ack'].includes(heartbeat.status) ? 'emerald' : heartbeat.status === 'failed' ? 'rose' : 'neutral'}>
                      {heartbeat.status}
                    </Badge>
                  </div>
                  <div className="col-span-2 font-mono text-[#71717a] truncate">{heartbeat.sequence ?? '-'}</div>
                  <div className="col-span-3 text-[#a1a1aa] truncate">{new Date(heartbeat.last_seen_at).toLocaleString()}</div>
                  <div className="col-span-2 text-[#71717a] truncate">{heartbeat.last_close_code ?? ''} {heartbeat.last_close_reason ?? ''}</div>
                </div>
              ))}
            </Rows>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-medium text-[#fafafa]">Pending applications</h2>
              <span className="text-xs text-[#71717a]">Review before member access is granted</span>
            </div>
            <Rows empty="No pending member applications.">
              {applications.map((application) => (
	                <div key={application.id} className="grid grid-cols-12 gap-2 px-3 py-2 text-xs items-center">
	                  <div className="col-span-2 text-[#fafafa] truncate">
	                    {application.discord_username ?? application.discord_user_id}
	                  </div>
	                  <div className="col-span-2 text-[#a1a1aa] truncate">{application.goal}</div>
	                  <div className="col-span-2 text-[#a1a1aa] truncate">{application.path_key ?? application.experience}</div>
	                  <div className="col-span-2 text-[#a1a1aa] truncate">{application.level_key ?? application.intended_build}</div>
	                  <div className="col-span-2 text-[#71717a] truncate">{application.preferred_support ?? application.weekly_time_budget ?? application.timezone ?? '-'}</div>
	                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <form action={approveDiscordApplication}>
                      <input type="hidden" name="discord_user_id" value={application.discord_user_id} />
                      <input type="hidden" name="discord_username" value={application.discord_username ?? ''} />
                      <button className="rounded-full bg-[#34d399] px-3 py-1 font-medium text-[#07110d]" type="submit">
                        Approve
                      </button>
                    </form>
                    <form action={rejectDiscordApplication}>
                      <input type="hidden" name="discord_user_id" value={application.discord_user_id} />
                      <input type="hidden" name="discord_username" value={application.discord_username ?? ''} />
                      <button className="rounded-full border border-[#3f3f46] px-3 py-1 font-medium text-[#fafafa]" type="submit">
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </Rows>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-medium text-[#fafafa] mb-3">Quiz bank</h2>
              <Rows empty="No quizzes seeded yet.">
                {quizzes.map((quiz) => (
                  <div key={quiz.quiz_key} className="grid grid-cols-12 gap-2 px-3 py-2 text-xs items-center">
                    <div className="col-span-8 text-[#fafafa] truncate">{quiz.prompt}</div>
                    <div className="col-span-4 text-right">
                      <Badge tone={quiz.active ? 'emerald' : 'neutral'}>{quiz.active ? 'active' : 'off'}</Badge>
                    </div>
                  </div>
                ))}
              </Rows>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-medium text-[#fafafa] mb-3">Challenge bank</h2>
              <Rows empty="No challenges seeded yet.">
                {challenges.map((challenge) => (
                  <div key={challenge.challenge_key} className="grid grid-cols-12 gap-2 px-3 py-2 text-xs items-center">
                    <div className="col-span-8 text-[#fafafa] truncate">{challenge.title}</div>
                    <div className="col-span-2 text-[#34d399] text-right tabular-nums">{challenge.points}</div>
                    <div className="col-span-2 text-right">
                      <Badge tone={challenge.active ? 'emerald' : 'neutral'}>{challenge.active ? 'on' : 'off'}</Badge>
                    </div>
                  </div>
                ))}
              </Rows>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-medium text-[#fafafa] mb-3">Content calendar</h2>
              <Rows empty="No planned content dates yet.">
                {calendar.map((item) => (
                  <div key={item.calendar_date} className="grid grid-cols-12 gap-2 px-3 py-2 text-xs items-center">
                    <div className="col-span-3 font-mono text-[#71717a]">{item.calendar_date}</div>
                    <div className="col-span-6 text-[#fafafa] truncate">{item.theme ?? item.daily_prompt ?? 'planned'}</div>
                    <div className="col-span-3 text-right"><Badge tone="neutral">{item.status}</Badge></div>
                  </div>
                ))}
              </Rows>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-medium text-[#fafafa] mb-3">Questions</h2>
              <Rows empty="No tracked questions yet.">
                {questions.map((question) => (
                  <div key={question.id} className="grid grid-cols-12 gap-2 px-3 py-2 text-xs items-center">
                    <div className="col-span-6 text-[#fafafa] truncate">{question.question}</div>
                    <div className="col-span-2 text-[#a1a1aa] truncate">{question.discord_username ?? '-'}</div>
                    <div className="col-span-2"><Badge tone={question.status === 'open' ? 'emerald' : 'neutral'}>{question.status}</Badge></div>
                    <div className="col-span-2 font-mono text-[#71717a] truncate">{question.id.slice(0, 8)}</div>
                  </div>
                ))}
              </Rows>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-medium text-[#fafafa] mb-3">Answers</h2>
              <Rows empty="No tracked answers yet.">
                {answers.map((answer) => (
                  <div key={answer.id} className="grid grid-cols-12 gap-2 px-3 py-2 text-xs items-center">
                    <div className="col-span-6 text-[#fafafa] truncate">{answer.answer}</div>
                    <div className="col-span-2 text-[#a1a1aa] truncate">{answer.discord_username ?? '-'}</div>
                    <div className="col-span-2"><Badge tone={answer.helpful ? 'emerald' : 'neutral'}>{answer.helpful ? 'helpful' : 'new'}</Badge></div>
                    <div className="col-span-2 font-mono text-[#71717a] truncate">{answer.id.slice(0, 8)}</div>
                  </div>
                ))}
              </Rows>
            </CardContent>
          </Card>
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
	                      {member.path_key ?? '-'} / {member.level_key ?? '-'}{member.preferred_support ? ` / ${member.preferred_support}` : ''}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-medium text-[#fafafa] mb-3">Leaderboard</h2>
              <Rows empty="No points recorded yet.">
                {leaderboard.map((row, index) => (
                  <div key={row.discord_user_id} className="grid grid-cols-12 gap-2 px-3 py-2 text-xs items-center">
                    <div className="col-span-2 text-[#71717a]">#{index + 1}</div>
                    <div className="col-span-7 text-[#fafafa] truncate">{row.username}</div>
                    <div className="col-span-3 text-[#34d399] text-right tabular-nums">{row.points} pts</div>
                  </div>
                ))}
              </Rows>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-medium text-[#fafafa] mb-3">Content queue</h2>
              <Rows empty="No content ideas captured yet.">
                {contentQueue.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 px-3 py-2 text-xs items-center">
                    <div className="col-span-5 text-[#fafafa] truncate">{item.idea}</div>
                    <div className="col-span-2 text-[#a1a1aa] truncate">{item.source}</div>
                    <div className="col-span-2"><Badge tone={item.status === 'captured' ? 'emerald' : 'neutral'}>{item.status}</Badge></div>
                    <div className="col-span-1 text-[#71717a] text-right tabular-nums">{item.priority}</div>
                    <div className="col-span-2 flex justify-end gap-1">
                      {['triaged', 'drafted', 'published'].map((status) => (
                        <form action={updateDiscordContentQueueStatus} key={status}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="status" value={status} />
                          <button className="rounded-full border border-[#3f3f46] px-2 py-1 text-[10px] text-[#fafafa]" type="submit">
                            {status}
                          </button>
                        </form>
                      ))}
                    </div>
                  </div>
                ))}
              </Rows>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-medium text-[#fafafa]">Challenge submissions</h2>
              <span className="text-xs text-[#71717a]">Approve for points or feature in wins-showcase</span>
            </div>
            <Rows empty="No challenge submissions waiting for review.">
              {challengeSubmissions.map((submission) => (
                <div key={submission.id} className="grid grid-cols-12 gap-2 px-3 py-2 text-xs items-center">
                  <div className="col-span-2">
                    <Badge tone={submission.status === 'pending' ? 'emerald' : 'neutral'}>{submission.status}</Badge>
                  </div>
                  <div className="col-span-2 text-[#a1a1aa] truncate">{submission.discord_username ?? submission.discord_user_id}</div>
                  <div className="col-span-2 text-[#71717a] truncate">{submission.challenge_key}</div>
                  <div className="col-span-3 text-[#fafafa] truncate">{submission.summary}</div>
                  <div className="col-span-1 text-[#34d399] text-right tabular-nums">{submission.points_awarded}</div>
                  <div className="col-span-2 flex justify-end gap-1">
                    {['approved', 'featured', 'rejected'].map((status) => (
                      <form action={reviewDiscordChallengeSubmissionAction} key={status}>
                        <input type="hidden" name="id" value={submission.id} />
                        <input type="hidden" name="status" value={status} />
                        <button
                          className={status === 'featured' ? 'rounded-full bg-[#34d399] px-2 py-1 text-[10px] font-medium text-[#07110d]' : 'rounded-full border border-[#3f3f46] px-2 py-1 text-[10px] text-[#fafafa]'}
                          type="submit"
                        >
                          {status}
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
              ))}
            </Rows>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-medium text-[#fafafa]">AI content approval</h2>
              <span className="text-xs text-[#71717a]">Drafts require approval before publishing</span>
            </div>
            <Rows empty="No generated drafts waiting for approval.">
              {contentDrafts.map((draft) => (
                <div key={draft.id} className="grid grid-cols-12 gap-2 px-3 py-2 text-xs items-center">
                  <div className="col-span-2">
                    <Badge tone={draft.status === 'pending_approval' ? 'emerald' : 'neutral'}>{draft.status}</Badge>
                  </div>
                  <div className="col-span-2 text-[#a1a1aa] truncate">{draft.draft_type}</div>
                  <div className="col-span-1 text-[#34d399] text-right tabular-nums">{draft.quality_score}</div>
                  <div className="col-span-4 text-[#fafafa] truncate">{draft.title ?? draft.body}</div>
                  <div className="col-span-1 text-[#71717a] truncate">{draft.target_channel_base_name}</div>
                  <div className="col-span-2 flex justify-end gap-1">
                    <form action={reviewDiscordContentDraftAction}>
                      <input type="hidden" name="id" value={draft.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button className="rounded-full bg-[#34d399] px-2 py-1 text-[10px] font-medium text-[#07110d]" type="submit">
                        Approve
                      </button>
                    </form>
                    <form action={reviewDiscordContentDraftAction}>
                      <input type="hidden" name="id" value={draft.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <button className="rounded-full border border-[#3f3f46] px-2 py-1 text-[10px] text-[#fafafa]" type="submit">
                        Reject
                      </button>
                    </form>
                  </div>
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
