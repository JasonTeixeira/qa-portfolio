'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function AuditRow({
  row,
  actorLabel,
}: {
  row: {
    id: string;
    created_at: string;
    actor_email: string | null;
    action: string;
    entity_type: string;
    entity_id: string | null;
    before: unknown;
    after: unknown;
  };
  actorLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const hasDiff = row.before || row.after;
  return (
    <div className="px-4 py-2.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full grid grid-cols-12 gap-3 items-center text-left"
      >
        <div className="col-span-3 text-xs text-[#a1a1aa] truncate">
          {new Date(row.created_at).toISOString().replace('T', ' ').slice(0, 19)}
        </div>
        <div className="col-span-3 text-xs text-[#fafafa] truncate">{actorLabel}</div>
        <div className="col-span-2 text-xs text-[#06b6d4] truncate font-mono">{row.action}</div>
        <div className="col-span-3 text-xs text-[#71717a] truncate font-mono">
          {row.entity_type}
          {row.entity_id ? `:${row.entity_id.slice(0, 8)}` : ''}
        </div>
        <div className="col-span-1 text-right">
          {hasDiff ? (
            open ? (
              <ChevronDown className="w-4 h-4 inline text-[#71717a]" />
            ) : (
              <ChevronRight className="w-4 h-4 inline text-[#71717a]" />
            )
          ) : (
            <span className="text-[10px] text-[#3f3f46]">—</span>
          )}
        </div>
      </button>
      {open && Boolean(hasDiff) && (
        <div className="mt-2 grid grid-cols-2 gap-3">
          <pre className="rounded-lg border border-[#27272a] bg-[#131316] p-2 text-[10px] text-[#a1a1aa] overflow-x-auto">
{JSON.stringify(row.before ?? null, null, 2)}
          </pre>
          <pre className="rounded-lg border border-[#27272a] bg-[#131316] p-2 text-[10px] text-[#a1a1aa] overflow-x-auto">
{JSON.stringify(row.after ?? null, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
