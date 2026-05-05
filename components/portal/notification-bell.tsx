'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';

type Notification = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  created_at: string;
  read_at: string | null;
};

export function NotificationBell({ initialUnread = 0 }: { initialUnread?: number }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(initialUnread);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as { items: Notification[] };
        setItems(data.items ?? []);
        setUnread((data.items ?? []).filter((n) => !n.read_at).length);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const markAllRead = useCallback(async () => {
    const ids = items.filter((n) => !n.read_at).map((n) => n.id);
    if (ids.length === 0) return;
    await fetch('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    setUnread(0);
  }, [items]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-1 rounded-full bg-[#06b6d4] text-[9px] font-bold text-[#0a0a0c] flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-[#27272a] bg-[#0f0f12] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#27272a]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                Notifications
              </span>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-[11px] text-[#06b6d4] hover:text-[#22d3ee]"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading && items.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-[#71717a]">Loading…</div>
              ) : items.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-[#71717a]">
                  No notifications.
                </div>
              ) : (
                items.map((n) => {
                  const inner = (
                    <div
                      className={`px-4 py-3 border-b border-[#1f1f23] last:border-b-0 ${
                        n.read_at ? 'opacity-60' : ''
                      } hover:bg-[#131316]`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-medium text-[#fafafa] truncate">
                          {n.title}
                        </div>
                        {!n.read_at && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] mt-1.5 shrink-0" />
                        )}
                      </div>
                      {n.body && (
                        <p className="text-xs text-[#a1a1aa] mt-0.5 line-clamp-2">{n.body}</p>
                      )}
                    </div>
                  );
                  return n.link ? (
                    <Link key={n.id} href={n.link} onClick={() => setOpen(false)}>
                      {inner}
                    </Link>
                  ) : (
                    <div key={n.id}>{inner}</div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
