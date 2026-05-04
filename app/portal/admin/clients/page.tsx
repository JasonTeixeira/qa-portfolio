import Link from 'next/link';
import { requireAdmin } from '@/lib/portal/auth';
import { getAllOrgs } from '@/lib/portal/queries';
import { Topbar } from '@/components/portal/topbar';
import { Card, CardContent } from '@/components/portal/ui/card';
import { Badge } from '@/components/portal/ui/badge';
import { Avatar } from '@/components/portal/ui/avatar';
import { formatCurrency, formatDate } from '@/lib/utils';

export const metadata = { title: 'Clients' };

export default async function AdminClientsPage() {
  await requireAdmin();
  const orgs = await getAllOrgs();

  return (
    <>
      <Topbar crumbs={[{ label: 'Admin' }, { label: 'Clients' }]} />
      <div className="px-6 lg:px-8 py-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight mb-6">Clients</h1>
        <div className="space-y-2">
          {(orgs as any[]).map((o) => {
            const total = (o.engagements ?? []).reduce(
              (s: number, e: any) => s + Number(e.contract_value ?? 0),
              0,
            );
            return (
              <Card key={o.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar src={o.logo_url} name={o.name} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#fafafa] truncate">{o.name}</div>
                    <div className="text-xs text-[#71717a] truncate">
                      {o.industry ?? '—'} · {o.engagements?.length ?? 0} engagement(s) ·
                      {' '}
                      {formatCurrency(total)} lifetime · since {formatDate(o.created_at)}
                    </div>
                  </div>
                  <Badge
                    tone={
                      o.status === 'active'
                        ? 'emerald'
                        : o.status === 'prospect'
                          ? 'amber'
                          : 'neutral'
                    }
                  >
                    {o.status}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
          {orgs.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center text-sm text-[#71717a]">
                No clients yet. As clients sign in, their workspaces will be auto-provisioned here.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
