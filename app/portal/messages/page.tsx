import Link from 'next/link';
import { getPortalContext } from '@/lib/portal/auth';
import { getThreadsForOrg } from '@/lib/portal/queries';
import { Topbar } from '@/components/portal/topbar';
import { Card, CardContent } from '@/components/portal/ui/card';
import { MessageSquare } from 'lucide-react';
import { formatRelative } from '@/lib/utils';

export const metadata = { title: 'Messages' };

export default async function MessagesPage() {
  const ctx = await getPortalContext();
  const threads = ctx.organizationId ? await getThreadsForOrg(ctx.organizationId) : [];

  return (
    <>
      <Topbar crumbs={[{ label: 'Messages' }]} />
      <div className="px-6 lg:px-8 py-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
          <p className="text-sm text-[#a1a1aa] mt-1">
            Direct line to the team. No email threads. No Slack channels.
          </p>
        </div>
        {threads.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#18181b] border border-[#27272a] mx-auto flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5 text-[#71717a]" />
              </div>
              <h3 className="font-semibold text-[#fafafa]">No conversations yet</h3>
              <p className="text-sm text-[#71717a] mt-1.5">
                When the team starts a thread, you&apos;ll see it here in real time.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {(threads as any[]).map((t) => (
              <Link key={t.id} href={`/messages/${t.id}`}>
                <Card className="hover:bg-[#131316]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-[#fafafa] truncate">{t.subject}</div>
                      <span className="text-xs text-[#71717a] shrink-0 ml-3">
                        {formatRelative(t.last_message_at)}
                      </span>
                    </div>
                    <div className="text-xs text-[#71717a]">
                      {(t.messages?.length ?? 0)} message
                      {t.messages?.length === 1 ? '' : 's'}
                    </div>
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
