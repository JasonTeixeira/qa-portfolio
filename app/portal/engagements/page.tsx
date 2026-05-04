import Link from 'next/link';
import { getPortalContext } from '@/lib/portal/auth';
import { getEngagementsForOrg } from '@/lib/portal/queries';
import { Topbar } from '@/components/portal/topbar';
import { Card, CardContent } from '@/components/portal/ui/card';
import { Badge } from '@/components/portal/ui/badge';
import { Progress } from '@/components/portal/ui/progress';
import { ArrowRight, Briefcase } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export const metadata = { title: 'Engagements' };

const STATUS_TONE: Record<string, any> = {
  discovery: 'amber',
  active: 'cyan',
  review: 'violet',
  delivered: 'emerald',
  paused: 'neutral',
  closed: 'neutral',
};

export default async function EngagementsPage() {
  const ctx = await getPortalContext();
  const engagements = ctx.organizationId ? await getEngagementsForOrg(ctx.organizationId) : [];

  return (
    <>
      <Topbar crumbs={[{ label: 'Engagements' }]} />
      <div className="px-6 lg:px-8 py-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-[#fafafa]">Engagements</h1>
          <p className="text-sm text-[#a1a1aa] mt-1">
            Every project, past and present, with live phase progress.
          </p>
        </div>

        {engagements.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#18181b] border border-[#27272a] mx-auto flex items-center justify-center mb-4">
                <Briefcase className="w-5 h-5 text-[#71717a]" />
              </div>
              <h3 className="font-semibold text-[#fafafa]">No engagements yet</h3>
              <p className="text-sm text-[#71717a] mt-1.5 max-w-md mx-auto">
                Once a project kicks off, you'll see all phases, deliverables, and progress here.
              </p>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-1 text-sm text-[#06b6d4] hover:text-[#22d3ee] mt-4"
              >
                Explore the catalog <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {(engagements as any[]).map((e) => {
              const phases = e.phases ?? [];
              const completed = phases.filter((p: any) => p.status === 'complete').length;
              const total = phases.length || 1;
              const pct = (completed / total) * 100;
              return (
                <Link key={e.id} href={`/engagements/${e.id}`}>
                  <Card className="cursor-pointer hover:bg-[#131316]">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-[#fafafa]">{e.title}</h3>
                            <Badge tone={STATUS_TONE[e.status] ?? 'neutral'}>{e.status}</Badge>
                            {e.health === 'red' && <Badge tone="rose">at risk</Badge>}
                            {e.health === 'yellow' && <Badge tone="amber">watch</Badge>}
                          </div>
                          <p className="text-xs text-[#71717a]">
                            {e.service_type ?? '—'} ·{' '}
                            {e.target_date ? `Target ${formatDate(e.target_date)}` : 'No target'}
                            {e.contract_value
                              ? ` · ${formatCurrency(Number(e.contract_value))}`
                              : ''}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#52525b] mt-1 shrink-0" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#71717a]">
                            Phase {completed} of {total}
                          </span>
                          <span className="text-[#a1a1aa] mono">{pct.toFixed(0)}%</span>
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
