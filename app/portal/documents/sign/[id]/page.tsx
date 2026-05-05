import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPortalContext } from '@/lib/portal/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Topbar } from '@/components/portal/topbar';
import { Card, CardContent } from '@/components/portal/ui/card';
import { Button } from '@/components/portal/ui/button';
import { FileSignature, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign document' };

export default async function SignDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getPortalContext();
  const sb = supabaseAdmin();
  const { data: doc } = await sb
    .from('documents')
    .select('id, title, status, organization_id')
    .eq('id', id)
    .maybeSingle();

  if (!doc) notFound();
  if (!ctx.isAdmin && doc.organization_id !== ctx.organizationId) notFound();

  return (
    <>
      <Topbar
        crumbs={[
          { label: 'Documents', href: '/portal/documents' },
          { label: 'Sign' },
        ]}
      />
      <div className="px-6 lg:px-8 py-12 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#18181b] border border-[#27272a] mx-auto flex items-center justify-center mb-5">
              <FileSignature className="w-6 h-6 text-[#22d3ee]" />
            </div>
            <h1 className="text-xl font-semibold text-[#fafafa] mb-2">
              {doc.title}
            </h1>
            <p className="text-sm text-[#a1a1aa] mb-6 max-w-md mx-auto">
              Signing flow coming in next deploy. We&apos;re wiring up the audit-trail
              capture and countersignature endpoint. Hold tight.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/portal/documents">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to documents
                </Button>
              </Link>
              <Button size="sm" disabled>
                Sign
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
