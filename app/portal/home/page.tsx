import Link from 'next/link';
import { getPortalContext } from '@/lib/portal/auth';
import {
  getEngagementsForOrg,
  getDocumentsForOrg,
  getInvoicesForOrg,
} from '@/lib/portal/queries';
import { Topbar } from '@/components/portal/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/portal/ui/card';
import { Badge } from '@/components/portal/ui/badge';
import { Button } from '@/components/portal/ui/button';
import { Progress } from '@/components/portal/ui/progress';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  FileSignature,
  ArrowRight,
  Sparkles,
  Receipt,
} from 'lucide-react';
import { formatCurrency, formatRelative } from '@/lib/utils';

const STATUS_TONE: Record<string, 'cyan' | 'emerald' | 'amber' | 'neutral' | 'rose'> = {
  discovery: 'amber',
  active: 'cyan',
  review: 'violet' as any,
  delivered: 'emerald',
  paused: 'neutral',
  closed: 'neutral',
};

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const ctx = await getPortalContext();
  if (ctx.isAdmin) {
    // Admin uses /admin home, but also has access to dashboard. Surface admin shortcut.
  }

  const orgId = ctx.organizationId;
  const [engagements, documents, invoices] = orgId
    ? await Promise.all([
        getEngagementsForOrg(orgId),
        getDocumentsForOrg(orgId),
        getInvoicesForOrg(orgId),
      ])
    : [[], [], []];

  const activeEngagements = (engagements as any[]).filter((e) =>
    ['discovery', 'active', 'review'].includes(e.status),
  );
  const pendingDocs = (documents as any[]).filter((d) => d.status === 'sent');
  const openInvoices = (invoices as any[]).filter((i) => i.status === 'open');

  return (
    <>
      <Topbar
        crumbs={[{ label: 'Dashboard' }]}
        actions={
          ctx.isAdmin && (
            <Link href="/admin">
              <Button variant="secondary" size="sm">
                Admin view <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )
        }
      />

      <div className="px-6 lg:px-8 py-8 max-w-6xl mx-auto space-y-8">
        {/* Greeting */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#fafafa]">
              {greeting()}, {ctx.user.full_name?.split(' ')[0] ?? 'there'}.
            </h1>
            <p className="text-[#a1a1aa] mt-1 text-sm">
              {orgId
                ? `${ctx.organizationName} · workspace`
                : 'Your workspace is ready. Start by exploring the service catalog.'}
            </p>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPI
            icon={Briefcase}
            label="Active engagements"
            value={activeEngagements.length}
            href="/engagements"
          />
          <KPI
            icon={FileSignature}
            label="Awaiting signature"
            value={pendingDocs.length}
            href="/documents"
            tone={pendingDocs.length > 0 ? 'amber' : 'neutral'}
          />
          <KPI
            icon={Receipt}
            label="Open invoices"
            value={openInvoices.length}
            href="/billing"
            tone={openInvoices.length > 0 ? 'cyan' : 'neutral'}
          />
        </div>

        {/* Active engagements list */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#52525b]">
              Active engagements
            </h2>
            {engagements.length > 0 && (
              <Link
                href="/engagements"
                className="text-xs text-[#06b6d4] hover:text-[#22d3ee] inline-flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {activeEngagements.length === 0 ? (
            <EmptyState
              title="No active engagements yet"
              body={
                ctx.isAdmin
                  ? 'You haven\'t created any engagements. Head to admin to add your first one.'
                  : 'When the team kicks off your first project, it will live right here with phases, deliverables, and a live pipeline.'
              }
              cta={
                ctx.isAdmin
                  ? { label: 'Go to admin', href: '/admin' }
                  : { label: 'Browse the catalog', href: '/catalog' }
              }
            />
          ) : (
            <div className="space-y-3">
              {activeEngagements.map((e: any) => {
                const phases = e.phases ?? [];
                const completed = phases.filter((p: any) => p.status === 'complete').length;
                const total = phases.length || 1;
                const pct = (completed / total) * 100;
                const deliverables = e.deliverables ?? [];
                return (
                  <Link key={e.id} href={`/engagements/${e.id}`}>
                    <Card className="cursor-pointer hover:bg-[#131316]">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-[#fafafa] truncate">{e.title}</h3>
                              <Badge tone={STATUS_TONE[e.status] ?? 'neutral'}>{e.status}</Badge>
                            </div>
                            <p className="text-xs text-[#71717a]">
                              {e.service_type ?? '—'} · {deliverables.length} deliverable
                              {deliverables.length === 1 ? '' : 's'}
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
        </section>

        {/* Awaiting your action */}
        {(pendingDocs.length > 0 || openInvoices.length > 0) && (
          <section>
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#52525b] mb-3">
              Awaiting your action
            </h2>
            <div className="space-y-2">
              {pendingDocs.map((d: any) => (
                <Link key={d.id} href={`/documents/${d.id}`}>
                  <Card className="hover:bg-[#131316]">
                    <CardContent className="p-4 flex items-center gap-3">
                      <FileSignature className="w-5 h-5 text-[#f59e0b]" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#fafafa] truncate">
                          Sign · {d.title}
                        </div>
                        <div className="text-xs text-[#71717a]">
                          Sent {formatRelative(d.sent_at ?? d.created_at)}
                        </div>
                      </div>
                      <Badge tone="amber">Action needed</Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {openInvoices.map((i: any) => (
                <Link key={i.id} href="/billing">
                  <Card className="hover:bg-[#131316]">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Receipt className="w-5 h-5 text-[#06b6d4]" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#fafafa] truncate">
                          Pay · Invoice {i.number ?? i.id.slice(0, 8)}
                        </div>
                        <div className="text-xs text-[#71717a]">
                          {formatCurrency(Number(i.amount_due ?? 0))} due
                        </div>
                      </div>
                      <Badge tone="cyan">Pay now</Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Catalog teaser */}
        <Card className="overflow-hidden border-[#06b6d4]/20 bg-gradient-to-br from-[#0f0f12] to-[#0c1418]">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="rounded-xl bg-[#06b6d4]/10 p-3 border border-[#06b6d4]/20">
              <Sparkles className="w-6 h-6 text-[#06b6d4]" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-[#fafafa]">Need another sprint?</div>
              <div className="text-sm text-[#a1a1aa]">
                Browse audits, sprints, and ongoing care plans. Add to your workspace in one click.
              </div>
            </div>
            <Link href="/catalog">
              <Button>
                Catalog <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function KPI({
  icon: Icon,
  label,
  value,
  href,
  tone = 'neutral',
}: {
  icon: any;
  label: string;
  value: number;
  href: string;
  tone?: 'cyan' | 'amber' | 'neutral';
}) {
  const ringColors: Record<string, string> = {
    cyan: 'border-[#06b6d4]/30 bg-[#06b6d4]/5',
    amber: 'border-[#f59e0b]/30 bg-[#f59e0b]/5',
    neutral: 'border-[#27272a] bg-[#0f0f12]',
  };
  const iconColors: Record<string, string> = {
    cyan: 'text-[#06b6d4]',
    amber: 'text-[#f59e0b]',
    neutral: 'text-[#71717a]',
  };
  return (
    <Link href={href}>
      <Card className={`hover:border-[#3f3f46] transition ${ringColors[tone]}`}>
        <CardContent className="p-5 flex items-center gap-4">
          <div className={`p-2.5 rounded-lg bg-[#18181b] ${iconColors[tone]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wider text-[#71717a]">{label}</div>
            <div className="text-2xl font-semibold tracking-tight text-[#fafafa] mono mt-0.5">
              {value}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: { label: string; href: string };
}) {
  return (
    <Card>
      <CardContent className="p-10 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#18181b] border border-[#27272a] mx-auto flex items-center justify-center mb-4">
          <Clock className="w-5 h-5 text-[#71717a]" />
        </div>
        <h3 className="font-semibold text-[#fafafa]">{title}</h3>
        <p className="text-sm text-[#71717a] mt-1.5 max-w-md mx-auto leading-relaxed">{body}</p>
        {cta && (
          <Link href={cta.href} className="inline-block mt-5">
            <Button variant="secondary" size="sm">
              {cta.label} <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
