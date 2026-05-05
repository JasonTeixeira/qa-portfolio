import { getPortalContext } from '@/lib/portal/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Topbar } from '@/components/portal/topbar';
import { Card, CardContent } from '@/components/portal/ui/card';
import { Badge } from '@/components/portal/ui/badge';
import { Receipt } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Invoices' };

type Invoice = {
  id: string;
  number: string | null;
  status: string;
  amount: number | string | null;
  total: number | string | null;
  due_date: string | null;
  created_at: string;
};

const TONE: Record<string, 'cyan' | 'amber' | 'emerald' | 'rose' | 'neutral'> = {
  draft: 'neutral',
  sent: 'amber',
  open: 'amber',
  paid: 'emerald',
  void: 'neutral',
  overdue: 'rose',
};

export default async function InvoicesPage() {
  const ctx = await getPortalContext();
  const sb = supabaseAdmin();

  let invoices: Invoice[] = [];
  if (ctx.organizationId) {
    const { data } = await sb
      .from('invoices')
      .select('id, number, status, amount, total, due_date, created_at')
      .eq('organization_id', ctx.organizationId)
      .order('created_at', { ascending: false });
    invoices = (data ?? []) as Invoice[];
  }

  return (
    <>
      <Topbar crumbs={[{ label: 'Invoices' }]} />
      <div className="px-6 lg:px-8 py-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-[#fafafa]">Invoices</h1>
          <p className="text-sm text-[#a1a1aa] mt-1">
            All invoices, paid and pending. One-click pay ships in the next deploy.
          </p>
        </div>

        {invoices.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#18181b] border border-[#27272a] mx-auto flex items-center justify-center mb-4">
                <Receipt className="w-5 h-5 text-[#71717a]" />
              </div>
              <h3 className="font-semibold text-[#fafafa]">No invoices yet</h3>
              <p className="text-sm text-[#71717a] mt-1.5">
                Once an engagement bills, you&apos;ll see invoices here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {invoices.map((i) => (
              <Card key={i.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-medium text-[#fafafa]">
                        {i.number ?? i.id.slice(0, 8)}
                      </span>
                      <Badge tone={TONE[i.status] ?? 'neutral'}>{i.status}</Badge>
                    </div>
                    <div className="text-xs text-[#71717a]">
                      {i.due_date ? `Due ${formatDate(i.due_date)}` : 'No due date'} · Issued{' '}
                      {formatDate(i.created_at)}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-[#fafafa] tabular-nums shrink-0">
                    {formatCurrency(Number(i.total ?? i.amount ?? 0))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
