'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, EventInput } from '@fullcalendar/core';
import { X } from 'lucide-react';

export interface AdminCalendarEvent {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  event_type: string;
  location: string | null;
  engagement_id: string | null;
  visible_to_client: boolean;
}

export interface EngagementOption {
  id: string;
  label: string;
}

const TYPE_COLOR: Record<string, string> = {
  meeting: '#06b6d4',
  client_call: '#22d3ee',
  milestone: '#10b981',
  deadline: '#f43f5e',
  review: '#8b5cf6',
  internal: '#71717a',
  other: '#a1a1aa',
};

const EVENT_TYPES = [
  'meeting',
  'client_call',
  'milestone',
  'deadline',
  'review',
  'internal',
  'other',
];

function colorForEvent(e: AdminCalendarEvent, engColor: Map<string, string>) {
  if (e.engagement_id && engColor.has(e.engagement_id)) {
    return engColor.get(e.engagement_id)!;
  }
  return TYPE_COLOR[e.event_type] ?? TYPE_COLOR.meeting;
}

const PALETTE = [
  '#06b6d4',
  '#10b981',
  '#8b5cf6',
  '#f59e0b',
  '#f43f5e',
  '#22d3ee',
  '#a78bfa',
  '#34d399',
  '#fb7185',
  '#fbbf24',
];

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60_000);
  return local.toISOString().slice(0, 16);
}

export function AdminCalendar({
  initial,
  engagements,
}: {
  initial: AdminCalendarEvent[];
  engagements: EngagementOption[];
}) {
  const [events, setEvents] = useState<AdminCalendarEvent[]>(initial);
  const [isMobile, setIsMobile] = useState(false);
  const [editing, setEditing] = useState<AdminCalendarEvent | null>(null);
  const [creating, setCreating] = useState(false);
  const calRef = useRef<FullCalendar | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const engColor = useMemo(() => {
    const m = new Map<string, string>();
    engagements.forEach((e, i) => m.set(e.id, PALETTE[i % PALETTE.length]));
    return m;
  }, [engagements]);

  const eventsById = useMemo(() => {
    const m = new Map<string, AdminCalendarEvent>();
    for (const e of events) m.set(e.id, e);
    return m;
  }, [events]);

  const fcEvents: EventInput[] = useMemo(
    () =>
      events.map((e) => ({
        id: e.id,
        title: e.title,
        start: e.starts_at,
        end: e.ends_at,
        allDay: e.all_day,
        backgroundColor: colorForEvent(e, engColor),
        borderColor: colorForEvent(e, engColor),
        textColor: '#09090b',
      })),
    [events, engColor],
  );

  return (
    <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-3 sm:p-5 sage-calendar">
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setCreating(true)}
          className="rounded-lg bg-[#06b6d4] px-3 py-1.5 text-xs font-semibold text-[#09090B] hover:bg-[#0891B2]"
        >
          + New event
        </button>
      </div>
      <FullCalendar
        ref={calRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView={isMobile ? 'listWeek' : 'dayGridMonth'}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: isMobile
            ? 'listWeek,dayGridMonth'
            : 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        height="auto"
        contentHeight={isMobile ? 'auto' : 700}
        events={fcEvents}
        eventClick={(arg: EventClickArg) => {
          const ev = eventsById.get(arg.event.id);
          if (ev) setEditing(ev);
        }}
        nowIndicator
        firstDay={1}
        dayMaxEventRows={3}
        eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
      />

      {editing && (
        <EventModal
          mode="edit"
          event={editing}
          engagements={engagements}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setEvents((curr) => curr.map((e) => (e.id === updated.id ? updated : e)));
            setEditing(null);
          }}
          onDeleted={(id) => {
            setEvents((curr) => curr.filter((e) => e.id !== id));
            setEditing(null);
          }}
        />
      )}
      {creating && (
        <EventModal
          mode="create"
          event={null}
          engagements={engagements}
          onClose={() => setCreating(false)}
          onSaved={(created) => {
            setEvents((curr) => [...curr, created]);
            setCreating(false);
          }}
          onDeleted={() => setCreating(false)}
        />
      )}
    </div>
  );
}

function EventModal({
  mode,
  event,
  engagements,
  onClose,
  onSaved,
  onDeleted,
}: {
  mode: 'edit' | 'create';
  event: AdminCalendarEvent | null;
  engagements: EngagementOption[];
  onClose: () => void;
  onSaved: (e: AdminCalendarEvent) => void;
  onDeleted: (id: string) => void;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const defaults = event ?? {
    id: '',
    title: '',
    description: '',
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    all_day: false,
    event_type: 'meeting',
    location: '',
    engagement_id: null,
    visible_to_client: true,
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-[#27272a] bg-[#09090B] shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#27272a]">
          <h2 className="text-base font-semibold text-[#fafafa]">
            {mode === 'edit' ? 'Edit event' : 'New event'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-md text-[#71717a] hover:text-[#fafafa] hover:bg-[#18181b]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            const fd = new FormData(e.currentTarget);
            const payload = {
              title: String(fd.get('title') ?? '').trim(),
              description: String(fd.get('description') ?? ''),
              starts_at: new Date(String(fd.get('starts_at'))).toISOString(),
              ends_at: new Date(String(fd.get('ends_at'))).toISOString(),
              all_day: fd.get('all_day') === 'on',
              event_type: String(fd.get('event_type') ?? 'meeting'),
              location: String(fd.get('location') ?? ''),
              engagement_id: (fd.get('engagement_id') as string) || null,
              visible_to_client: fd.get('visible_to_client') === 'on',
            };
            start(async () => {
              const url =
                mode === 'edit'
                  ? `/api/admin/calendar-events/${event!.id}`
                  : '/api/admin/calendar-events';
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
              const data = (await res.json()) as AdminCalendarEvent;
              onSaved(data);
              router.refresh();
            });
          }}
          className="px-5 py-4 space-y-3 max-h-[70vh] overflow-y-auto"
        >
          <Field label="Title">
            <input
              name="title"
              required
              defaultValue={defaults.title}
              className="w-full rounded-lg border border-[#27272a] bg-[#0f0f12] px-2.5 py-1.5 text-sm text-[#fafafa]"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Starts">
              <input
                type="datetime-local"
                name="starts_at"
                required
                defaultValue={toLocalInput(defaults.starts_at)}
                className="w-full rounded-lg border border-[#27272a] bg-[#0f0f12] px-2.5 py-1.5 text-sm text-[#fafafa]"
              />
            </Field>
            <Field label="Ends">
              <input
                type="datetime-local"
                name="ends_at"
                required
                defaultValue={toLocalInput(defaults.ends_at)}
                className="w-full rounded-lg border border-[#27272a] bg-[#0f0f12] px-2.5 py-1.5 text-sm text-[#fafafa]"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Event type">
              <select
                name="event_type"
                defaultValue={defaults.event_type}
                className="w-full rounded-lg border border-[#27272a] bg-[#0f0f12] px-2.5 py-1.5 text-sm text-[#fafafa]"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Engagement">
              <select
                name="engagement_id"
                defaultValue={defaults.engagement_id ?? ''}
                className="w-full rounded-lg border border-[#27272a] bg-[#0f0f12] px-2.5 py-1.5 text-sm text-[#fafafa]"
              >
                <option value="">— None —</option>
                {engagements.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Location">
            <input
              name="location"
              defaultValue={defaults.location ?? ''}
              className="w-full rounded-lg border border-[#27272a] bg-[#0f0f12] px-2.5 py-1.5 text-sm text-[#fafafa]"
            />
          </Field>
          <Field label="Description">
            <textarea
              name="description"
              rows={3}
              defaultValue={defaults.description ?? ''}
              className="w-full rounded-lg border border-[#27272a] bg-[#0f0f12] px-2.5 py-1.5 text-sm text-[#fafafa]"
            />
          </Field>
          <div className="flex items-center gap-4 text-xs text-[#a1a1aa]">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="all_day" defaultChecked={defaults.all_day} />
              All day
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="visible_to_client"
                defaultChecked={defaults.visible_to_client}
              />
              Visible to client
            </label>
          </div>
          {error && <div className="text-xs text-rose-400">{error}</div>}
          <div className="flex items-center justify-between pt-2">
            <div>
              {mode === 'edit' && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm('Delete this event?')) return;
                    start(async () => {
                      const res = await fetch(`/api/admin/calendar-events/${event!.id}`, {
                        method: 'DELETE',
                      });
                      if (res.ok) {
                        onDeleted(event!.id);
                        router.refresh();
                      } else {
                        setError('Delete failed');
                      }
                    });
                  }}
                  className="rounded-lg border border-rose-500/40 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-500/10"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#27272a] px-3 py-1.5 text-xs text-[#a1a1aa]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-[#06b6d4] px-3 py-1.5 text-xs font-semibold text-[#09090B] hover:bg-[#0891B2] disabled:opacity-50"
              >
                {pending ? 'Saving…' : mode === 'edit' ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
        {label}
      </span>
      {children}
    </label>
  );
}
