'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

export type Stage =
  | 'discovery'
  | 'proposal'
  | 'contract'
  | 'active'
  | 'review'
  | 'complete'
  | 'archived';

export interface BoardCard {
  id: string;
  title: string;
  org_name: string | null;
  owner_name: string | null;
  contract_value: number | null;
  pipeline_stage: Stage;
  kanban_position: number;
}

const STAGES: Stage[] = [
  'discovery',
  'proposal',
  'contract',
  'active',
  'review',
  'complete',
  'archived',
];

const STAGE_COLOR: Record<Stage, string> = {
  discovery: 'border-[#52525b]/40 text-[#a1a1aa]',
  proposal: 'border-amber-500/40 text-amber-300',
  contract: 'border-[#06b6d4]/40 text-[#06b6d4]',
  active: 'border-emerald-500/40 text-emerald-300',
  review: 'border-violet-500/40 text-violet-300',
  complete: 'border-teal-500/40 text-teal-300',
  archived: 'border-[#3f3f46]/40 text-[#71717a]',
};

export function PipelineBoard({ initial }: { initial: BoardCard[] }) {
  const [cards, setCards] = useState<BoardCard[]>(initial);
  const [error, setError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [hoverStage, setHoverStage] = useState<Stage | null>(null);
  const router = useRouter();

  const grouped = STAGES.reduce<Record<Stage, BoardCard[]>>((acc, s) => {
    acc[s] = cards
      .filter((c) => c.pipeline_stage === s)
      .sort((a, b) => a.kanban_position - b.kanban_position);
    return acc;
  }, {} as Record<Stage, BoardCard[]>);

  async function moveCard(id: string, toStage: Stage) {
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    if (card.pipeline_stage === toStage) return;

    const targetCount = grouped[toStage].length;
    const newPos = targetCount;

    // optimistic
    const prev = cards;
    setCards((cs) =>
      cs.map((c) =>
        c.id === id ? { ...c, pipeline_stage: toStage, kanban_position: newPos } : c,
      ),
    );

    const res = await fetch(`/api/admin/engagements/${id}/move`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pipeline_stage: toStage, kanban_position: newPos }),
    });
    if (!res.ok) {
      setError(`Move failed: ${await res.text().catch(() => 'error')}`);
      setCards(prev);
      return;
    }
    setError(null);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">
          {error}
        </div>
      )}
      <div className="flex gap-3 overflow-x-auto pb-3">
        {STAGES.map((stage) => (
          <div
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              setHoverStage(stage);
            }}
            onDragLeave={() => setHoverStage((s) => (s === stage ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              setHoverStage(null);
              if (dragId) moveCard(dragId, stage);
              setDragId(null);
            }}
            className={`flex-1 min-w-[240px] rounded-xl border bg-[#0f0f12] ${
              hoverStage === stage
                ? 'border-[#06b6d4]/60 bg-[#06b6d4]/5'
                : 'border-[#27272a]'
            }`}
          >
            <div
              className={`px-3 py-2.5 border-b border-[#1f1f23] flex items-center justify-between text-[10px] font-mono uppercase tracking-widest ${STAGE_COLOR[stage]}`}
            >
              <span>{stage}</span>
              <span className="text-[#52525b]">{grouped[stage].length}</span>
            </div>
            <div className="p-2 space-y-2 min-h-[120px]">
              {grouped[stage].length === 0 && (
                <div className="rounded-lg border border-dashed border-[#27272a] p-4 text-center text-[10px] font-mono uppercase tracking-widest text-[#52525b]">
                  Drop here
                </div>
              )}
              {grouped[stage].map((c) => (
                <div
                  key={c.id}
                  draggable
                  onDragStart={() => setDragId(c.id)}
                  onDragEnd={() => setDragId(null)}
                  className={`rounded-lg border border-[#27272a] bg-[#131316] p-3 cursor-grab active:cursor-grabbing ${
                    dragId === c.id ? 'opacity-40' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-[#fafafa] truncate">{c.title}</div>
                  <div className="text-[11px] text-[#71717a] truncate mt-0.5">
                    {c.org_name ?? '—'}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-[#52525b]">
                    <span className="truncate">{c.owner_name ?? 'Unassigned'}</span>
                    <span className="tabular-nums text-[#a1a1aa]">
                      {c.contract_value ? formatCurrency(c.contract_value) : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
