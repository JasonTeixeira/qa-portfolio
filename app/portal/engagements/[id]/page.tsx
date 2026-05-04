import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPortalContext } from '@/lib/portal/auth';
import { getEngagement } from '@/lib/portal/queries';
import { Topbar } from '@/components/portal/topbar';
import { Card, CardContent } from '@/components/portal/ui/card';
import { Badge } from '@/components/portal/ui/badge';
import { Progress } from '@/components/portal/ui/progress';
import { Check, Circle, Clock } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

export default async function EngagementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getPortalContext();
  const e: any = await getEngagement(id);
  if (!e) notFound();

  // Membership check (skip for admins)
  if (!ctx.isAdmin && e.organization_id !== ctx.organizationId) notFound();

  const phases = (e.phases ?? []).sort((a: any, b: any) => a.position - b.position);
  const deliverables = e.deliverables ?? [];
  const completedPhases = phases.filter((p: any) => p.status === 'complete').length;
  const pct = phases.length ? (completedPhases / phases.length) * 100 : 0;

  return (
    <>
      <Topbar
        crumbs={[
          { label: 'Engagements', href: '/engagements' },
          { label: e.title },
        ]}
      />
      <div className="px-6 lg:px-8 py-8 max-w-6xl mx-auto space-y-8">
        <header>
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[#fafafa]">{e.title}</h1>
            <Badge tone="cyan">{e.status}</Badge>
            {e.health === 'red' && <Badge tone="rose">at risk</Badge>}
          </div>
          <p className="text-[#a1a1aa] max-w-2xl">{e.description ?? '—'}</p>
          <div className="flex items-center gap-6 mt-4 text-xs text-[#71717a]">
            {e.contract_value && (
              <span>Contract · {formatCurrency(Number(e.contract_value))}</span>
            )}
            {e.start_date && <span>Start · {formatDate(e.start_date)}</span>}
            {e.target_date && <span>Target · {formatDate(e.target_date)}</span>}
          </div>
        </header>

        {/* Pipeline */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#52525b]">
              Pipeline
            </h2>
            <span className="text-xs text-[#a1a1aa] mono">
              {completedPhases} of {phases.length || 0} phases · {pct.toFixed(0)}%
            </span>
          </div>
          <Card>
            <CardContent className="p-6">
              <Progress value={pct} className="mb-6" />
              <ol className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {phases.map((p: any) => {
                  const Icon =
                    p.status === 'complete'
                      ? Check
                      : p.status === 'in_progress'
                        ? Clock
                        : Circle;
                  const colors: Record<string, string> = {
                    complete: 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/30',
                    in_progress: 'text-[#06b6d4] bg-[#06b6d4]/10 border-[#06b6d4]/30',
                    pending: 'text-[#52525b] bg-[#18181b] border-[#27272a]',
                    blocked: 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/30',
                  };
                  return (
                    <li
                      key={p.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-[#27272a] bg-[#0f0f12]"
                    >
                      <div
                        className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${colors[p.status]}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[#fafafa] truncate">
                          {p.name}
                        </div>
                        <div className="text-xs text-[#71717a] capitalize mt-0.5">
                          {p.status.replace('_', ' ')}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </section>

        {/* Deliverables */}
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wider text-[#52525b] mb-3">
            Deliverables
          </h2>
          <div className="space-y-2">
            {deliverables.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-sm text-[#71717a]">
                  No deliverables yet.
                </CardContent>
              </Card>
            ) : (
              deliverables.map((d: any) => (
                <Card key={d.id} className="hover:bg-[#131316]">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[#fafafa] truncate">{d.title}</div>
                      <div className="text-xs text-[#71717a] mt-0.5 truncate">
                        {d.description ?? ''}
                        {d.due_date && ` · Due ${formatDate(d.due_date)}`}
                      </div>
                    </div>
                    <Badge
                      tone={
                        d.status === 'approved'
                          ? 'emerald'
                          : d.status === 'review'
                            ? 'amber'
                            : d.status === 'submitted'
                              ? 'cyan'
                              : 'neutral'
                      }
                    >
                      {d.status}
                    </Badge>
                    <Link
                      href={`/deliverables/${d.id}`}
                      className="text-xs text-[#06b6d4] hover:text-[#22d3ee]"
                    >
                      View →
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  );
}
