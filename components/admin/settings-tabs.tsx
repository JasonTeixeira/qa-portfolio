'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export interface StudioSettings {
  org_name: string;
  default_tax_rate: number;
  business_hours: Record<string, string | null>;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
}

export interface IntegrationStatus {
  stripe: boolean;
  resend: boolean;
  google: boolean;
}

export interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  app_role: string;
  approval_status: string;
}

const TABS = ['Org', 'Branding', 'Integrations', 'Team'] as const;
type Tab = (typeof TABS)[number];

export function AdminSettingsTabs({
  settings,
  integrations,
  team,
}: {
  settings: StudioSettings;
  integrations: IntegrationStatus;
  team: TeamMember[];
}) {
  const [tab, setTab] = useState<Tab>('Org');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1 border-b border-[#27272a]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'border-[#06b6d4] text-[#06b6d4]'
                : 'border-transparent text-[#71717a] hover:text-[#fafafa]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Org' && <OrgTab initial={settings} />}
      {tab === 'Branding' && <BrandingTab initial={settings} />}
      {tab === 'Integrations' && <IntegrationsTab status={integrations} />}
      {tab === 'Team' && <TeamTab initial={team} />}
    </div>
  );
}

function SaveBar({
  pending,
  ok,
  error,
}: {
  pending: boolean;
  ok: boolean;
  error: string | null;
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[#06b6d4] px-4 py-2 text-xs font-semibold text-[#09090B] hover:bg-[#0891B2] disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save changes'}
      </button>
      {ok && <span className="text-xs text-emerald-400">Saved.</span>}
      {error && <span className="text-xs text-rose-400 truncate">{error}</span>}
    </div>
  );
}

function OrgTab({ initial }: { initial: StudioSettings }) {
  const [pending, start] = useTransition();
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setOk(false);
        setError(null);
        const fd = new FormData(e.currentTarget);
        const hours: Record<string, string | null> = {};
        for (const day of ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']) {
          const v = String(fd.get(`hours_${day}`) ?? '').trim();
          hours[day] = v || null;
        }
        const payload = {
          org_name: String(fd.get('org_name') ?? '').trim(),
          default_tax_rate: Number(fd.get('default_tax_rate') ?? 0),
          business_hours: hours,
        };
        start(async () => {
          const res = await fetch('/api/admin/settings', {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            setError(await res.text().catch(() => 'Save failed'));
            return;
          }
          setOk(true);
          router.refresh();
        });
      }}
      className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5 space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="space-y-1 block">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
            Studio name
          </span>
          <input
            name="org_name"
            defaultValue={initial.org_name}
            className="w-full rounded-lg border border-[#27272a] bg-[#131316] px-2.5 py-1.5 text-sm text-[#fafafa]"
          />
        </label>
        <label className="space-y-1 block">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
            Default tax rate (%)
          </span>
          <input
            name="default_tax_rate"
            type="number"
            step="0.01"
            defaultValue={initial.default_tax_rate}
            className="w-full rounded-lg border border-[#27272a] bg-[#131316] px-2.5 py-1.5 text-sm text-[#fafafa] tabular-nums"
          />
        </label>
      </div>
      <div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a] block mb-2">
          Business hours
        </span>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
          {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((d) => (
            <label key={d} className="space-y-1 block">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#52525b]">
                {d}
              </span>
              <input
                name={`hours_${d}`}
                placeholder="9-17"
                defaultValue={initial.business_hours?.[d] ?? ''}
                className="w-full rounded-lg border border-[#27272a] bg-[#131316] px-2 py-1 text-xs text-[#fafafa]"
              />
            </label>
          ))}
        </div>
        <p className="text-[10px] text-[#52525b] mt-2">
          24h format. Leave blank for closed.
        </p>
      </div>
      <SaveBar pending={pending} ok={ok} error={error} />
    </form>
  );
}

function BrandingTab({ initial }: { initial: StudioSettings }) {
  const [pending, start] = useTransition();
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [primary, setPrimary] = useState(initial.primary_color);
  const [secondary, setSecondary] = useState(initial.secondary_color);
  const [logo, setLogo] = useState(initial.logo_url ?? '');
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setOk(false);
        setError(null);
        const payload = {
          primary_color: primary,
          secondary_color: secondary,
          logo_url: logo || null,
        };
        start(async () => {
          const res = await fetch('/api/admin/settings', {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            setError(await res.text().catch(() => 'Save failed'));
            return;
          }
          setOk(true);
          router.refresh();
        });
      }}
      className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5 space-y-4"
    >
      <label className="space-y-1 block">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
          Logo URL (upload arrives Phase 31)
        </span>
        <input
          value={logo}
          onChange={(e) => setLogo(e.target.value)}
          placeholder="https://…"
          className="w-full rounded-lg border border-[#27272a] bg-[#131316] px-2.5 py-1.5 text-sm text-[#fafafa]"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1 block">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
            Primary color
          </span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              className="h-8 w-12 rounded border border-[#27272a] bg-[#131316]"
            />
            <input
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              className="flex-1 rounded-lg border border-[#27272a] bg-[#131316] px-2.5 py-1.5 text-sm text-[#fafafa] font-mono"
            />
          </div>
        </label>
        <label className="space-y-1 block">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
            Secondary color
          </span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={secondary}
              onChange={(e) => setSecondary(e.target.value)}
              className="h-8 w-12 rounded border border-[#27272a] bg-[#131316]"
            />
            <input
              value={secondary}
              onChange={(e) => setSecondary(e.target.value)}
              className="flex-1 rounded-lg border border-[#27272a] bg-[#131316] px-2.5 py-1.5 text-sm text-[#fafafa] font-mono"
            />
          </div>
        </label>
      </div>
      <SaveBar pending={pending} ok={ok} error={error} />
    </form>
  );
}

function IntegrationsTab({ status }: { status: IntegrationStatus }) {
  const items: { name: string; key: keyof IntegrationStatus; desc: string }[] = [
    { name: 'Stripe', key: 'stripe', desc: 'Card payments + invoice send' },
    { name: 'Resend', key: 'resend', desc: 'Transactional email' },
    { name: 'Google Calendar', key: 'google', desc: 'Two-way calendar sync' },
  ];
  return (
    <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5 space-y-2">
      {items.map((i) => (
        <div
          key={i.key}
          className="flex items-center justify-between rounded-lg border border-[#27272a] bg-[#131316] px-4 py-3"
        >
          <div>
            <div className="text-sm font-medium text-[#fafafa]">{i.name}</div>
            <div className="text-xs text-[#71717a]">{i.desc}</div>
          </div>
          <span
            className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest ${
              status[i.key]
                ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
                : 'border-[#3f3f46]/50 text-[#71717a] bg-[#3f3f46]/10'
            }`}
          >
            {status[i.key] ? 'connected' : 'not configured'}
          </span>
        </div>
      ))}
      <p className="text-[10px] text-[#52525b] pt-2">
        Configuration via env vars. Toggling from the cockpit ships in a later phase.
      </p>
    </div>
  );
}

function TeamTab({ initial }: { initial: TeamMember[] }) {
  const members = initial;
  const [email, setEmail] = useState('');
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          setOk(null);
          if (!email) return;
          start(async () => {
            const res = await fetch('/api/admin/team/invite', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ email }),
            });
            if (!res.ok) {
              setError(await res.text().catch(() => 'Invite failed'));
              return;
            }
            setOk(`Invite sent to ${email}.`);
            setEmail('');
            router.refresh();
          });
        }}
        className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-4 flex flex-wrap items-end gap-2"
      >
        <label className="space-y-1 block flex-1 min-w-[220px]">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
            Invite admin (email)
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="someone@studio.com"
            className="w-full rounded-lg border border-[#27272a] bg-[#131316] px-2.5 py-1.5 text-sm text-[#fafafa]"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#06b6d4] px-3 py-1.5 text-xs font-semibold text-[#09090B] hover:bg-[#0891B2] disabled:opacity-50"
        >
          {pending ? 'Sending…' : 'Send invite'}
        </button>
        {ok && <span className="text-xs text-emerald-400">{ok}</span>}
        {error && <span className="text-xs text-rose-400 truncate">{error}</span>}
      </form>

      <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] divide-y divide-[#1f1f23]">
        {members.length === 0 ? (
          <div className="px-4 py-6 text-sm text-[#a1a1aa]">No team members yet.</div>
        ) : (
          members.map((m) => (
            <div
              key={m.id}
              className="px-4 py-3 flex items-center justify-between"
            >
              <div className="min-w-0">
                <div className="text-sm text-[#fafafa] truncate">
                  {m.full_name || m.email}
                </div>
                <div className="text-[11px] text-[#71717a] truncate">{m.email}</div>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#06b6d4]">
                {m.app_role}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
