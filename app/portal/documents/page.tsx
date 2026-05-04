import Link from 'next/link';
import { getPortalContext } from '@/lib/portal/auth';
import { getDocumentsForOrg } from '@/lib/portal/queries';
import { Topbar } from '@/components/portal/topbar';
import { Card, CardContent } from '@/components/portal/ui/card';
import { Badge } from '@/components/portal/ui/badge';
import { FileSignature } from 'lucide-react';
import { formatRelative } from '@/lib/utils';

export const metadata = { title: 'Documents' };

export default async function DocumentsPage() {
  const ctx = await getPortalContext();
  const docs = ctx.organizationId ? await getDocumentsForOrg(ctx.organizationId) : [];

  return (
    <>
      <Topbar crumbs={[{ label: 'Documents' }]} />
      <div className="px-6 lg:px-8 py-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="text-sm text-[#a1a1aa] mt-1">
            Contracts, SOWs, and amendments. Sign in-app with full audit trail.
          </p>
        </div>
        {docs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#18181b] border border-[#27272a] mx-auto flex items-center justify-center mb-4">
                <FileSignature className="w-5 h-5 text-[#71717a]" />
              </div>
              <h3 className="font-semibold text-[#fafafa]">No documents yet</h3>
              <p className="text-sm text-[#71717a] mt-1.5">
                Contracts will appear here when sent.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {(docs as any[]).map((d) => (
              <Link key={d.id} href={`/documents/${d.id}`}>
                <Card className="hover:bg-[#131316]">
                  <CardContent className="p-4 flex items-center gap-4">
                    <FileSignature className="w-5 h-5 text-[#71717a]" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[#fafafa] truncate">{d.title}</div>
                      <div className="text-xs text-[#71717a] mt-0.5">
                        {d.type} · Updated {formatRelative(d.created_at)}
                      </div>
                    </div>
                    <Badge
                      tone={
                        d.status === 'signed' || d.status === 'countersigned'
                          ? 'emerald'
                          : d.status === 'sent'
                            ? 'amber'
                            : 'neutral'
                      }
                    >
                      {d.status}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
