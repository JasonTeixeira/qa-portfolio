import Link from 'next/link';
import { requireAdmin } from '@/lib/portal/auth';
import { getAllEngagements, getAllOrgs } from '@/lib/portal/queries';
import { Topbar } from '@/components/portal/topbar';
import { Card, CardContent } from '@/components/portal/ui/card';
import { Badge } from '@/components/portal/ui/badge';
import { Briefcase, Users, DollarSign, Activity } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const metadata = { title: 'Admin · Pipeline' };

const COLUMNS = ['discovery', 'active', 'review', 'delivered', 'closed'] as const;
const COL_LABELS: Record<string, string> = {
  discovery: 'Discovery',
  active: 'Active',
  review: 'In review',
  delivered: 'Delivered',
  closed: 'Closed',
};

export default async function AdminPipelinePage() {
  await requireAdmin();
  const [engagements, orgs] = await Promise.all([getAllEngagements(), getAllOrgs()]);

  const grouped: Record<string, any[]> = {};
  COLUMNS.forEach((c) => (grouped[c] = []));
  (engagements as any[]).forEach((e) => {
    if (grouped[e.status]) grouped[e.status].push(e);
  });

  const totalContractValue = (engagements as any[]).reduce(
    (s, e) => s + Number(e.contract_value ?? 0),
    0,
  );
  const activeCount = (engagements as any[]).filter((e) =>
    ['discovery', 'active', 'review'].includes(e.status),
  ).length;

  return (
    <>
      <Topbar crumbs={[{ label: 'Admin' }, { label: 'Pipeline' }]} />
      <div className="px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
          <p className="text-sm text-[#a1a1aa] mt-1">
            All engagements at a glance. Drag soon — for now, click through to manage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPI
            icon={Briefcase}
            label="Active"
            value={activeCount}
            sub={`${engagements.length} total`}
          />
          <KPI icon={Users} label="Clients" value={orgs.length} />
          <KPI
            icon={DollarSign}
            label="Pipeline value"
            value={formatCurrency(totalContractValue)}
            isText
          />
          <KPI
            icon={Activity}
            label="Health"
            value={
              (engagements as any[]).filter((e) => e.health === 'red').length
                ? 'Needs attention'
                : 'All green'
            }
            isText
          />
        </div>

        {/* Kanban */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {COLUMNS.map((col) => (
            <div key={col} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="text-xs font-medium uppercase tracking-wider text-[#71717a]">
                  {COL_LABELS[col]}
                </div>
                <div className="text-xs mono text-[#52525b]">{grouped[col].length}</div>
              </div>
              <div className="space-y-2 min-h-[120px]">
                {grouped[col].map((e: any) => (
                  <Link key={e.id} href={`/engagements/${e.id}`}>
                    <Card className="hover:bg-[#131316] cursor-pointer">
                      <CardContent className="p-3">
                        <div className="text-xs text-[#71717a] mb-1 truncate">
                          {e.organizations?.name}
                        </div>
                        <div className="font-medium text-sm text-[#fafafa] mb-2 truncate">
                          {e.title}
                        </div>
                        <div className="flex items-center justify-between">
                          {e.contract_value ? (
                            <span className="text-xs mono text-[#a1a1aa]">
                              {formatCurrency(Number(e.contract_value))}
                            </span>
                          ) : (
                            <span />
                          )}
                          {e.health === 'red' && <Badge tone="rose">red</Badge>}
                          {e.health === 'yellow' && <Badge tone="amber">watch</Badge>}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                {grouped[col].length === 0 && (
                  <div className="text-xs text-[#52525b] px-2 py-3 italic">empty</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
  sub,
  isText,
}: {
  icon: any;
  label: string;
  value: any;
  sub?: string;
  isText?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#18181b] border border-[#27272a] text-[#06b6d4]">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wider text-[#71717a]">{label}</div>
          <div
            className={`font-semibold tracking-tight text-[#fafafa] mt-0.5 ${
              isText ? 'text-sm' : 'text-xl mono'
            }`}
          >
            {value}
          </div>
          {sub && <div className="text-[10px] text-[#52525b] mt-0.5">{sub}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
