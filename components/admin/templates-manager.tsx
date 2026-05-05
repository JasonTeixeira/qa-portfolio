'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus } from 'lucide-react';

export interface Template {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  body_md: string | null;
  active: boolean | null;
  version: number | null;
  updated_at: string;
}

const CATEGORIES = [
  'legal',
  'proposal',
  'sow',
  'change_order',
  'msa',
  'nda',
  'ip',
  'contractor',
  'other',
];

export function TemplatesManager({ initial }: { initial: Template[] }) {
  const [items, setItems] = useState(initial);
  const [activeId, setActiveId] = useState<string | null>(initial[0]?.id ?? null);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const active = items.find((t) => t.id === activeId) ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <aside className="lg:col-span-1 rounded-xl border border-[#27272a] bg-[#0f0f12]">
        <div className="p-3 border-b border-[#1f1f23] flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
            Templates
          </span>
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setActiveId(null);
            }}
            className="inline-flex items-center gap-1 text-xs text-[#06b6d4] hover:text-[#22d3ee]"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>
        <ul className="divide-y divide-[#1f1f23]">
          {items.length === 0 && !creating && (
            <li className="px-3 py-4 text-xs text-[#71717a]">
              No templates yet. Click + New to add one.
            </li>
          )}
          {items.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => {
                  setCreating(false);
                  setActiveId(t.id);
                }}
                className={`w-full px-3 py-2.5 text-left flex items-center justify-between gap-2 ${
                  t.id === activeId ? 'bg-[#06b6d4]/5' : 'hover:bg-[#131316]'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-sm text-[#fafafa] truncate">{t.title}</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#52525b] truncate">
                    {t.category ?? 'other'} · v{t.version ?? 1}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono uppercase tracking-widest ${
                    t.active ? 'text-emerald-400' : 'text-[#52525b]'
                  }`}
                >
                  {t.active ? 'on' : 'off'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="lg:col-span-2">
        {creating ? (
          <Editor
            key="new"
            mode="create"
            template={null}
            onSaved={(saved) => {
              setItems((xs) => [saved, ...xs]);
              setActiveId(saved.id);
              setCreating(false);
              router.refresh();
            }}
          />
        ) : active ? (
          <Editor
            key={active.id}
            mode="edit"
            template={active}
            onSaved={(saved) => {
              setItems((xs) => xs.map((x) => (x.id === saved.id ? saved : x)));
              router.refresh();
            }}
            onDeleted={(id) => {
              setItems((xs) => xs.filter((x) => x.id !== id));
              setActiveId(null);
              router.refresh();
            }}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-[#27272a] p-10 text-center text-sm text-[#a1a1aa]">
            Pick a template to edit, or create a new one.
          </div>
        )}
      </section>
    </div>
  );
}

function Editor({
  mode,
  template,
  onSaved,
  onDeleted,
}: {
  mode: 'create' | 'edit';
  template: Template | null;
  onSaved: (t: Template) => void;
  onDeleted?: (id: string) => void;
}) {
  const [title, setTitle] = useState(template?.title ?? '');
  const [slug, setSlug] = useState(template?.slug ?? '');
  const [category, setCategory] = useState(template?.category ?? 'other');
  const [body, setBody] = useState(template?.body_md ?? '');
  const [active, setActive] = useState(template?.active ?? true);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const payload = { title, slug: slug || title.toLowerCase().replace(/\s+/g, '-'), category, body_md: body, active };
        start(async () => {
          const url = mode === 'edit' ? `/api/admin/templates/${template!.id}` : '/api/admin/templates';
          const method = mode === 'edit' ? 'PATCH' : 'POST';
          const res = await fetch(url, {
            method,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            setError(await res.text().catch(() => 'Save failed'));
            return;
          }
          const data = (await res.json()) as Template;
          onSaved(data);
        });
      }}
      className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5 space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="space-y-1 block">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Title</span>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-[#27272a] bg-[#131316] px-2.5 py-1.5 text-sm text-[#fafafa]"
          />
        </label>
        <label className="space-y-1 block">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Slug</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-generated"
            className="w-full rounded-lg border border-[#27272a] bg-[#131316] px-2.5 py-1.5 text-sm text-[#fafafa] font-mono"
          />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="space-y-1 block">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Category</span>
          <select
            value={category ?? 'other'}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-[#27272a] bg-[#131316] px-2.5 py-1.5 text-sm text-[#fafafa]"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            checked={!!active}
            onChange={(e) => setActive(e.target.checked)}
          />
          <span className="text-xs text-[#a1a1aa]">Active</span>
        </label>
      </div>
      <label className="space-y-1 block">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
          Body (markdown — variables editor in Phase 31)
        </span>
        <textarea
          rows={16}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full rounded-lg border border-[#27272a] bg-[#131316] px-3 py-2 text-sm text-[#fafafa] font-mono"
        />
      </label>
      {error && <div className="text-xs text-rose-400">{error}</div>}
      <div className="flex items-center justify-between">
        <div>
          {mode === 'edit' && onDeleted && (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!confirm('Delete this template?')) return;
                start(async () => {
                  const res = await fetch(`/api/admin/templates/${template!.id}`, { method: 'DELETE' });
                  if (res.ok) {
                    onDeleted(template!.id);
                  } else {
                    setError('Delete failed');
                  }
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-500/10"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#06b6d4] px-4 py-2 text-xs font-semibold text-[#09090B] hover:bg-[#0891B2] disabled:opacity-50"
        >
          {pending ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create template'}
        </button>
      </div>
    </form>
  );
}
