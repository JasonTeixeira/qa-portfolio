'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus } from 'lucide-react';

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface InvoiceFormEngagement {
  id: string;
  label: string;
  organization_id: string | null;
}

export function InvoiceForm({ engagements }: { engagements: InvoiceFormEngagement[] }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [engagementId, setEngagementId] = useState('');
  const [number, setNumber] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taxPct, setTaxPct] = useState(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unit_price: 0 },
  ]);
  const router = useRouter();

  const subtotal = items.reduce(
    (s, it) => s + Number(it.quantity || 0) * Number(it.unit_price || 0),
    0,
  );
  const tax = subtotal * (Number(taxPct) / 100);
  const total = subtotal + tax;

  function updateItem(idx: number, patch: Partial<LineItem>) {
    setItems((xs) => xs.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const eng = engagements.find((x) => x.id === engagementId);
        if (!eng) {
          setError('Pick an engagement.');
          return;
        }
        if (items.length === 0 || !items.some((it) => it.description && it.unit_price)) {
          setError('Add at least one line item with description + price.');
          return;
        }
        start(async () => {
          const res = await fetch('/api/admin/invoices', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              engagement_id: eng.id,
              organization_id: eng.organization_id,
              number: number || null,
              due_date: dueDate || null,
              tax_pct: Number(taxPct) || 0,
              notes: notes || null,
              line_items: items.filter((it) => it.description.trim()),
            }),
          });
          if (!res.ok) {
            setError(await res.text().catch(() => 'Create failed'));
            return;
          }
          const data = (await res.json()) as { id: string };
          router.push(`/admin/invoices/${data.id}`);
        });
      }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="space-y-1 block">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
            Engagement
          </span>
          <select
            required
            value={engagementId}
            onChange={(e) => setEngagementId(e.target.value)}
            className="w-full rounded-lg border border-[#27272a] bg-[#0f0f12] px-2.5 py-1.5 text-sm text-[#fafafa]"
          >
            <option value="">— Choose engagement —</option>
            {engagements.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 block">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
            Invoice number (optional)
          </span>
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="INV-0001"
            className="w-full rounded-lg border border-[#27272a] bg-[#0f0f12] px-2.5 py-1.5 text-sm text-[#fafafa]"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="space-y-1 block">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
            Due date
          </span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-[#27272a] bg-[#0f0f12] px-2.5 py-1.5 text-sm text-[#fafafa]"
          />
        </label>
        <label className="space-y-1 block">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
            Tax %
          </span>
          <input
            type="number"
            step="0.01"
            value={taxPct}
            onChange={(e) => setTaxPct(Number(e.target.value))}
            className="w-full rounded-lg border border-[#27272a] bg-[#0f0f12] px-2.5 py-1.5 text-sm text-[#fafafa] tabular-nums"
          />
        </label>
      </div>

      <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-[#52525b] border-b border-[#1f1f23]">
          <div className="col-span-6">Description</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-2 text-right">Unit price</div>
          <div className="col-span-2 text-right">Total</div>
        </div>
        <div className="divide-y divide-[#1f1f23]">
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 px-4 py-2 items-center">
              <input
                value={it.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
                placeholder="What's this for?"
                className="col-span-6 rounded-lg border border-[#27272a] bg-[#131316] px-2.5 py-1.5 text-sm text-[#fafafa]"
              />
              <input
                type="number"
                step="0.5"
                value={it.quantity}
                onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
                className="col-span-2 rounded-lg border border-[#27272a] bg-[#131316] px-2.5 py-1.5 text-sm text-[#fafafa] text-right tabular-nums"
              />
              <input
                type="number"
                step="0.01"
                value={it.unit_price}
                onChange={(e) => updateItem(i, { unit_price: Number(e.target.value) })}
                className="col-span-2 rounded-lg border border-[#27272a] bg-[#131316] px-2.5 py-1.5 text-sm text-[#fafafa] text-right tabular-nums"
              />
              <div className="col-span-1 text-sm text-[#fafafa] text-right tabular-nums">
                {(it.quantity * it.unit_price).toFixed(2)}
              </div>
              <button
                type="button"
                onClick={() => setItems((xs) => xs.filter((_, j) => j !== i))}
                className="col-span-1 text-[#71717a] hover:text-rose-400"
                aria-label="Remove line item"
              >
                <Trash2 className="w-4 h-4 ml-auto" />
              </button>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-[#1f1f23]">
          <button
            type="button"
            onClick={() =>
              setItems((xs) => [...xs, { description: '', quantity: 1, unit_price: 0 }])
            }
            className="inline-flex items-center gap-1.5 text-xs text-[#06b6d4] hover:text-[#22d3ee]"
          >
            <Plus className="w-3.5 h-3.5" /> Add line item
          </button>
        </div>
      </div>

      <label className="space-y-1 block">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
          Notes (visible to client)
        </span>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-[#27272a] bg-[#0f0f12] px-2.5 py-1.5 text-sm text-[#fafafa]"
        />
      </label>

      <div className="flex items-center justify-between rounded-xl border border-[#27272a] bg-[#0f0f12] px-5 py-3">
        <div className="text-xs text-[#71717a] space-y-0.5">
          <div>Subtotal: <span className="text-[#fafafa] tabular-nums">{subtotal.toFixed(2)}</span></div>
          <div>Tax ({taxPct}%): <span className="text-[#fafafa] tabular-nums">{tax.toFixed(2)}</span></div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Total</div>
          <div className="text-2xl font-semibold text-[#fafafa] tabular-nums">{total.toFixed(2)}</div>
        </div>
      </div>

      {error && <div className="text-xs text-rose-400">{error}</div>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#06b6d4] px-4 py-2 text-xs font-semibold text-[#09090B] hover:bg-[#0891B2] disabled:opacity-50"
        >
          {pending ? 'Creating…' : 'Create invoice'}
        </button>
      </div>
    </form>
  );
}
