import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPortalContext } from '@/lib/portal/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Topbar } from '@/components/portal/topbar';
import { Card, CardContent } from '@/components/portal/ui/card';
import { Button } from '@/components/portal/ui/button';
import { CreditCard, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pay invoice' };

type Invoice = {
  id: string;
  number: string | null;
  total: number | string | null;
  amount: number | string | null;
  organization_id: string;
};

export default async function PayInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getPortalContext();
  const sb = supabaseAdmin();
  const { data } = await sb
    .from('invoices')
    .select('id, number, total, amount, organization_id')
    .eq('id', id)
    .maybeSingle();
  if (!data) notFound();
  const invoice = data as Invoice;
  if (!ctx.isAdmin && invoice.organization_id !== ctx.organizationId) notFound();

  const total = Number(invoice.total ?? invoice.amount ?? 0);

  return (
    <>
      <Topbar
        crumbs={[
          { label: 'Invoices', href: '/portal/invoices' },
          { label: invoice.number ?? invoice.id.slice(0, 8), href: `/portal/invoices/${invoice.id}` },
          { label: 'Pay' },
        ]}
      />
      <div className="px-6 lg:px-8 py-12 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#18181b] border border-[#27272a] mx-auto flex items-center justify-center mb-5">
              <CreditCard className="w-6 h-6 text-[#22d3ee]" />
            </div>
            <h1 className="text-xl font-semibold text-[#fafafa] mb-1">
              {invoice.number ?? `Invoice ${invoice.id.slice(0, 8)}`}
            </h1>
            <div className="text-3xl font-semibold text-[#fafafa] tabular-nums my-3">
              {formatCurrency(total)}
            </div>
            <p className="text-sm text-[#a1a1aa] mb-6 max-w-md mx-auto">
              Stripe checkout ships in the next deploy. Card payments, ACH, and wire
              instructions will live here. Email sage@sageideas.dev for wire details
              in the meantime.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href={`/portal/invoices/${invoice.id}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to invoice
                </Button>
              </Link>
              <Button size="sm" disabled>
                Pay with card
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
