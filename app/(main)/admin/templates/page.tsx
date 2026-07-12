import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { AdminTopbar } from '@/components/admin/topbar';
import { TemplatesManager, type Template } from '@/components/admin/templates-manager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Templates' };

export default async function TemplatesPage() {
  const { profile } = await requireAdmin();
  const sb = supabaseAdmin();

  const { data } = await sb
    .from('contract_templates')
    .select('id, slug, title, category, body_md, active, version, updated_at')
    .order('updated_at', { ascending: false });

  const items = (data ?? []) as Template[];

  return (
    <>
      <AdminTopbar
        crumbs={[{ label: 'Templates' }]}
        email={profile.email}
        fullName={profile.full_name}
      />
      <div className="px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-[#fafafa]">Templates</h1>
          <p className="text-sm text-[#a1a1aa] mt-1">
            Reusable contract + proposal templates. Markdown for now; rich editor + variables ship in Phase 31.
          </p>
        </div>
        <TemplatesManager initial={items} />
      </div>
    </>
  );
}
