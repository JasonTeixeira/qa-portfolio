import Link from 'next/link';
import { getPortalContext } from '@/lib/portal/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Topbar } from '@/components/portal/topbar';
import { Card, CardContent } from '@/components/portal/ui/card';
import { Badge } from '@/components/portal/ui/badge';
import { Progress } from '@/components/portal/ui/progress';
import { ArrowRight, Briefcase } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Projects' };

const STAGE_TONE: Record<string, 'cyan' | 'amber' | 'violet' | 'emerald' | 'neutral' | 'rose'> = {
  discovery: 'amber',
  proposal: 'amber',
  contract: 'violet',
  active: 'cyan',
  review: 'violet',
  complete: 'emerald',
  archived: 'neutral',
};

type Engagement = {
  id: string;
  title: string;
  status: string;
  pipeline_stage: string | null;
  service_type: string | null;
  target_date: string | null;
};

type Deliverable = {
  id: string;
  status: string;
  engagement_id: string;
};

type Milestone = {
  engagement_id: string;
  title: string;
  due_date: string | null;
  status: string;
};

export default async function ProjectsListPage() {
  const ctx = await getPortalContext();
  const orgId = ctx.organizationId;
  const sb = supabaseAdmin();

  let engagements: Engagement[] = [];
  if (orgId) {
    const { data } = await sb
      .from('engagements')
      .select('id, title, status, pipeline_stage, service_type, target_date')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });
    engagements = data ?? [];
  }

  const ids = engagements.map((e) => e.id);
  let deliverables: Deliverable[] = [];
  let milestones: Milestone[] = [];

  if (ids.length > 0) {
    const [delivRes, mileRes] = await Promise.all([
      sb.from('deliverables').select('id, status, engagement_id').in('engagement_id', ids),
      sb
        .from('project_milestones')
        .select('engagement_id, title, due_date, status')
        .in('engagement_id', ids)
        .neq('status', 'complete')
        .order('due_date', { ascending: true }),
    ]);
    deliverables = delivRes.data ?? [];
    milestones = mileRes.data ?? [];
  }

  const delivByEngagement = new Map<string, Deliverable[]>();
  for (const d of deliverables) {
    const arr = delivByEngagement.get(d.engagement_id) ?? [];
    arr.push(d);
    delivByEngagement.set(d.engagement_id, arr);
  }

  const nextMilestoneByEngagement = new Map<string, Milestone>();
  for (const m of milestones) {
    if (!nextMilestoneByEngagement.has(m.engagement_id)) {
      nextMilestoneByEngagement.set(m.engagement_id, m);
    }
  }

  return (
    <>
      <Topbar crumbs={[{ label: 'Projects' }]} />
      <div className="px-6 lg:px-8 py-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-[#fafafa]">Projects</h1>
          <p className="text-sm text-[#a1a1aa] mt-1">
            Every engagement, with live progress and what&apos;s due next.
          </p>
        </div>

        {engagements.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#18181b] border border-[#27272a] mx-auto flex items-center justify-center mb-4">
                <Briefcase className="w-5 h-5 text-[#71717a]" />
              </div>
              <h3 className="font-semibold text-[#fafafa]">
                No projects yet — Sage will set up your engagement
              </h3>
              <p className="text-sm text-[#71717a] mt-1.5 max-w-md mx-auto">
                Once a project kicks off you&apos;ll see status, deliverables, and dates here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {engagements.map((e) => {
              const delivs = delivByEngagement.get(e.id) ?? [];
              const total = delivs.length;
              const approved = delivs.filter((d) => d.status === 'approved').length;
              const pct = total > 0 ? (approved / total) * 100 : 0;
              const nextM = nextMilestoneByEngagement.get(e.id);
              const stage = e.pipeline_stage ?? e.status;
              return (
                <Link key={e.id} href={`/portal/projects/${e.id}`}>
                  <Card className="cursor-pointer hover:bg-[#131316]">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-[#fafafa]">{e.title}</h3>
                            <Badge tone={STAGE_TONE[stage] ?? 'neutral'}>{stage}</Badge>
                          </div>
                          <p className="text-xs text-[#71717a]">
                            {e.service_type ?? '—'}
                            {nextM
                              ? ` · Next: ${nextM.title}${
                                  nextM.due_date ? ` (${formatDate(nextM.due_date)})` : ''
                                }`
                              : e.target_date
                                ? ` · Target ${formatDate(e.target_date)}`
                                : ''}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#52525b] mt-1 shrink-0" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#71717a]">
                            {approved} of {total} deliverables approved
                          </span>
                          <span className="text-[#a1a1aa] tabular-nums">
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={pct} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
