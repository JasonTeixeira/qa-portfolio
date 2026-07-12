import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { AdminTopbar } from '@/components/admin/topbar';
import { InvoiceForm, type InvoiceFormEngagement } from '@/components/admin/invoice-form';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'New invoice' };

export default async function NewInvoicePage() {
  const { profile } = await requireAdmin();
  const sb = supabaseAdmin();

  const { data: engs } = await sb
    .from('engagements')
    .select('id, title, organization_id, organizations(name)')
    .order('updated_at', { ascending: false })
    .limit(200);

  const engagements: InvoiceFormEngagement[] = (
    (engs ?? []) as unknown as {
      id: string;
      title: string;
      organization_id: string | null;
      organizations: { name: string | null } | null;
    }[]
  ).map((e) => ({
    id: e.id,
    organization_id: e.organization_id,
    label: e.organizations?.name ? `${e.title} · ${e.organizations.name}` : e.title,
  }));

  return (
    <>
      <AdminTopbar
        crumbs={[{ label: 'Invoices', href: '/admin/invoices' }, { label: 'New' }]}
        email={profile.email}
        fullName={profile.full_name}
      />
      <div className="px-6 lg:px-8 py-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-[#fafafa]">New invoice</h1>
          <p className="text-sm text-[#a1a1aa] mt-1">
            Saved as draft. Send + payment go through Stripe wired up in Phase 32.
          </p>
        </div>
        <InvoiceForm engagements={engagements} />
        <Link
          href="/admin/invoices"
          className="inline-block mt-6 text-xs font-mono uppercase tracking-widest text-[#71717a] hover:text-[#06b6d4]"
        >
          ← Cancel
        </Link>
      </div>
    </>
  );
}
