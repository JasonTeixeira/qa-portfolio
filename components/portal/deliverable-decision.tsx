'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';

export function DeliverableDecision({ deliverableId }: { deliverableId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function submit(decision: 'approved' | 'rejected') {
    setError(null);
    const res = await fetch(`/api/deliverables/${deliverableId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decision,
        comment: decision === 'rejected' ? reason : null,
      }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? 'Something went wrong.');
      return;
    }
    setShowReject(false);
    setReason('');
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => submit('approved')}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20 disabled:opacity-50"
        >
          <Check className="w-3 h-3" />
          Approve
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setShowReject((v) => !v)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border border-[#f43f5e]/40 bg-[#f43f5e]/10 text-[#f43f5e] hover:bg-[#f43f5e]/20 disabled:opacity-50"
        >
          <X className="w-3 h-3" />
          Reject
        </button>
      </div>
      {showReject && (
        <div className="flex flex-col gap-1.5 mt-1">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="What needs to change? Be specific."
            className="w-full text-xs px-2 py-1.5 rounded-md bg-[#0a0a0c] border border-[#27272a] text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#3f3f46]"
            rows={2}
          />
          <button
            type="button"
            disabled={isPending || reason.trim().length < 3}
            onClick={() => submit('rejected')}
            className="self-start text-xs px-2.5 py-1 rounded-md border border-[#f43f5e]/40 bg-[#f43f5e]/10 text-[#f43f5e] hover:bg-[#f43f5e]/20 disabled:opacity-50"
          >
            Send rejection
          </button>
        </div>
      )}
      {error && <div className="text-xs text-[#f43f5e]">{error}</div>}
    </div>
  );
}
