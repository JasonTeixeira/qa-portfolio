'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { saveProfile } from '@/app/academy/_actions/profile'
import type { BillingView } from '@/lib/academy/billing'

/**
 * Sage Academy — Settings (interactive layer).
 *
 * Honesty contract enforced here:
 *  - Display name → real (saveProfile server action, academy_profiles).
 *  - Handle → real value, shown read-only (there is no rename-handle backend).
 *  - Avatar → no upload backend; rendered as an initials monogram, no fake upload.
 *  - Billing → real subscription data passed in; change/cancel open the real
 *    Stripe customer portal; invoices are real Stripe invoices. The whole card
 *    is omitted upstream when there is no real subscription.
 *  - Notifications → no preferences backend exists yet, so toggles are disabled
 *    with an honest "coming soon" note. They do NOT pretend to save.
 *  - Language → no locale-switching backend is wired; shown read-only (English).
 *  - Connections → real linked-provider status; connect/disconnect are honest
 *    non-functional affordances (no link/unlink flow is wired).
 *  - Export → real JSON download of the learner's own data.
 *  - Delete account → no deletion endpoint exists; routes to a real support
 *    email request instead of faking a destructive action.
 */

const AC = {
  bg: '#0B0B0E',
  surface: '#111115',
  text: '#F2EFE9',
  muted: '#9598A2',
  faint: '#4A4A54',
  line: '#1E1E24',
  inputBg: '#0F0F13',
  inputBorder: '#2A2A33',
  accent: '#3D5AFE',
  accentSoft: '#8FA0FF',
  green: '#18B663',
  red: '#E5484D',
} as const

const mono = '"JetBrains Mono", ui-monospace, monospace'
const serif = 'Fraunces, Georgia, serif'

const sectionStyle: React.CSSProperties = {
  border: `1px solid ${AC.line}`,
  borderRadius: 16,
  background: AC.surface,
  padding: 26,
  marginBottom: 18,
}

const eyebrowStyle: React.CSSProperties = {
  fontFamily: mono,
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: AC.muted,
  marginBottom: 18,
}

type ProviderStatus = {
  provider: 'github' | 'google'
  connected: boolean
  handle: string | null
}

export type SettingsData = {
  displayName: string
  handle: string
  publicUrl: string
  publicProfilePath: string
  monogram: string
  billing: BillingView
  providers: ProviderStatus[]
  supportMailto: string
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export function SettingsClient({ data }: { data: SettingsData }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(120% 80% at 50% -10%, rgba(255,255,255,0.035) 0%, transparent 55%) ' + AC.bg,
        color: AC.text,
        fontFamily: '"Hanken Grotesk", sans-serif',
        fontSize: 15,
        lineHeight: 1.6,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px 16px',
          padding: '10px clamp(16px, 3vw, 28px)',
          borderBottom: `1px solid ${AC.line}`,
          background: 'rgba(11,11,14,0.9)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <Link
          href="/academy/dashboard"
          style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: 'inherit' }}
        >
          <span
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 24,
              height: 24,
              borderRadius: 7,
              background: AC.accent,
              color: '#fff',
              fontSize: 11,
            }}
          >
            ◆
          </span>
          <span style={{ fontFamily: mono, fontSize: 10.5, color: AC.muted }}>← cockpit</span>
        </Link>
        <span style={{ fontFamily: mono, fontSize: 10.5, color: AC.muted }}>
          Settings · the boring page, done right
        </span>
      </div>

      <main
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: 'clamp(32px, 5vw, 52px) clamp(16px, 3vw, 32px) 88px',
        }}
      >
        <h1
          style={{
            margin: '0 0 26px',
            fontFamily: serif,
            fontWeight: 600,
            fontSize: 'clamp(26px, 3vw, 36px)',
            letterSpacing: '-0.022em',
          }}
        >
          Settings
        </h1>

        <ProfileSection data={data} />
        {data.billing.hasSubscription && <BillingSection data={data} />}
        <NotificationsSection />
        <PreferencesSection data={data} />
        <DangerSection data={data} />
      </main>
    </div>
  )
}

/* ------------------------------ Profile ------------------------------ */

function ProfileSection({ data }: { data: SettingsData }) {
  const [displayName, setDisplayName] = useState(data.displayName)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  function onSave() {
    startTransition(async () => {
      const res = await saveProfile({ displayName: displayName.trim() })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 1800)
      }
    })
  }

  return (
    <section style={sectionStyle}>
      <div style={eyebrowStyle}>Profile</div>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div
          aria-hidden
          style={{
            width: 72,
            height: 72,
            flexShrink: 0,
            borderRadius: '50%',
            border: '1px solid rgba(61,90,254,0.4)',
            background: 'linear-gradient(160deg, rgba(61,90,254,0.28), rgba(61,90,254,0.06))',
            display: 'grid',
            placeItems: 'center',
            fontFamily: serif,
            fontSize: 26,
            color: AC.accentSoft,
          }}
        >
          {data.monogram}
        </div>
        <div style={{ flex: '1 1 0%', minWidth: 240, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 9.5,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: AC.faint,
                marginBottom: 6,
              }}
            >
              Display name
            </div>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={60}
              style={{
                width: '100%',
                background: AC.inputBg,
                border: `1px solid ${AC.inputBorder}`,
                borderRadius: 10,
                padding: '12px 15px',
                fontSize: 14,
                color: AC.text,
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 9.5,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: AC.faint,
                marginBottom: 6,
              }}
            >
              Public profile
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 12.5,
                  color: AC.faint,
                  background: AC.inputBg,
                  border: `1px solid ${AC.inputBorder}`,
                  borderRight: 'none',
                  borderRadius: '10px 0 0 10px',
                  padding: '12px 0 12px 15px',
                }}
              >
                sageideas.dev/@
              </span>
              <input
                value={data.handle}
                readOnly
                aria-label="Public handle (fixed)"
                style={{
                  flex: '1 1 0%',
                  minWidth: 0,
                  background: AC.inputBg,
                  border: `1px solid ${AC.inputBorder}`,
                  borderLeft: 'none',
                  borderRadius: '0 10px 10px 0',
                  padding: '12px 15px 12px 2px',
                  fontSize: 12.5,
                  color: AC.text,
                  fontFamily: mono,
                  outline: 'none',
                }}
              />
              <Link
                href={data.publicProfilePath}
                style={{
                  fontFamily: mono,
                  fontSize: 10.5,
                  color: AC.accentSoft,
                  textDecoration: 'none',
                  marginLeft: 12,
                  whiteSpace: 'nowrap',
                }}
              >
                view →
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <button
          type="button"
          onClick={onSave}
          disabled={pending}
          style={{
            display: 'inline-flex',
            color: saved ? '#04130C' : '#fff',
            background: saved ? AC.green : AC.accent,
            border: `1px solid ${saved ? AC.green : AC.accent}`,
            fontSize: 13.5,
            fontWeight: 600,
            padding: '10px 22px',
            borderRadius: 20,
            cursor: pending ? 'default' : 'pointer',
            opacity: pending ? 0.7 : 1,
            fontFamily: 'inherit',
          }}
        >
          {saved ? '✓ saved' : pending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </section>
  )
}

/* ------------------------------ Billing ------------------------------ */

function BillingSection({ data }: { data: SettingsData }) {
  const b = data.billing
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function openPortal() {
    setBusy(true)
    setErr(null)
    try {
      const res = await fetch('/api/academy/billing/portal', { method: 'POST' })
      const json = (await res.json()) as { url?: string; error?: string }
      if (res.ok && json.url) {
        window.location.href = json.url
        return
      }
      setErr(json.error ?? 'Billing is unavailable right now.')
    } catch {
      setErr('Billing is unavailable right now.')
    } finally {
      setBusy(false)
    }
  }

  const planWord = b.planInterval === 'yearly' ? 'Annual' : 'Monthly'
  const cardLine = b.card?.last4
    ? `${b.card.brand ? b.card.brand[0].toUpperCase() + b.card.brand.slice(1) : 'Card'} ···· ${b.card.last4}`
    : null
  const renewLabel = b.cancelAtPeriodEnd ? 'ends' : 'renews'

  return (
    <section style={sectionStyle}>
      <div style={eyebrowStyle}>Plan &amp; billing</div>
      <div
        style={{
          border: '1px solid rgba(61,90,254,0.35)',
          borderRadius: 12,
          background: 'rgba(61,90,254,0.04)',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: b.invoices.length ? 14 : 0,
        }}
      >
        <div style={{ flex: '1 1 0%', minWidth: 200 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>
            {planWord}
            {b.priceLabel ? ` · ${b.priceLabel}${b.cadenceLabel}` : ''}
          </div>
          <div style={{ fontFamily: mono, fontSize: 10.5, color: AC.muted, marginTop: 2 }}>
            {renewLabel} {fmtDate(b.renewsIso)}
            {cardLine ? ` · ${cardLine}` : ''}
          </div>
        </div>
        <button
          type="button"
          onClick={openPortal}
          disabled={busy}
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: AC.accentSoft,
            background: 'none',
            border: 'none',
            cursor: busy ? 'default' : 'pointer',
            whiteSpace: 'nowrap',
            padding: 0,
          }}
        >
          change plan →
        </button>
        <button
          type="button"
          onClick={openPortal}
          disabled={busy}
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: AC.muted,
            background: 'none',
            border: 'none',
            cursor: busy ? 'default' : 'pointer',
            whiteSpace: 'nowrap',
            padding: 0,
          }}
        >
          cancel
        </button>
      </div>

      {err && (
        <div style={{ fontFamily: mono, fontSize: 10.5, color: AC.red, margin: '4px 0 10px' }}>{err}</div>
      )}

      {b.invoices.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {b.invoices.map((inv) => (
            <div
              key={inv.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '11px 4px',
                borderBottom: `1px solid ${AC.line}`,
                fontSize: 13,
              }}
            >
              <span style={{ fontFamily: mono, fontSize: 11, color: AC.accentSoft }}>{inv.number}</span>
              <span style={{ color: AC.muted, flex: '1 1 0%' }}>
                {fmtDate(inv.createdIso)} · {inv.interval}
              </span>
              <span style={{ fontWeight: 600 }}>{inv.amount}</span>
              {inv.pdfUrl ? (
                <a
                  href={inv.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: mono,
                    fontSize: 10,
                    color: AC.muted,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  PDF ↓
                </a>
              ) : (
                <span style={{ fontFamily: mono, fontSize: 10, color: AC.faint, whiteSpace: 'nowrap' }}>—</span>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/* --------------------------- Notifications --------------------------- */

const NOTIF_DEFS = [
  {
    key: 'recall',
    name: 'Recall due',
    desc: 'One nudge when prompts hit their window — protects retention.',
    defaultOn: true,
  },
  {
    key: 'digest',
    name: "Sprout's weekly read",
    desc: 'Sunday email: your pattern, your one move. No filler.',
    defaultOn: true,
  },
  {
    key: 'streak',
    name: 'Streak at risk',
    desc: 'Only fires the evening before a streak would break.',
    defaultOn: true,
  },
  {
    key: 'league',
    name: 'League updates',
    desc: 'Promotion week and final standings. Off by default — it can wait.',
    defaultOn: false,
  },
] as const

function NotificationsSection() {
  // No notification-preferences backend exists yet. We render the toggles in a
  // read-only, disabled state showing the intended defaults, with an honest note
  // — they do NOT save anything, so we never fake a live control.
  return (
    <section style={sectionStyle}>
      <div style={{ ...eyebrowStyle, marginBottom: 6 }}>Notifications</div>
      <div style={{ fontSize: 12.5, color: AC.faint, marginBottom: 16 }}>
        We send few, on purpose. Each one exists to protect something you built.
      </div>
      {NOTIF_DEFS.map((n) => (
        <div
          key={n.key}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '13px 4px',
            borderBottom: `1px solid ${AC.line}`,
          }}
        >
          <div style={{ flex: '1 1 0%', minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{n.name}</div>
            <div style={{ fontSize: 12.5, color: AC.muted }}>{n.desc}</div>
          </div>
          <span
            aria-disabled
            title="Notification preferences aren't editable yet"
            style={{
              position: 'relative',
              width: 40,
              height: 22,
              borderRadius: 11,
              background: n.defaultOn ? 'rgba(24,182,99,0.14)' : '#1A1A20',
              border: `1px solid ${n.defaultOn ? 'rgba(24,182,99,0.3)' : AC.inputBorder}`,
              flexShrink: 0,
              opacity: 0.55,
              cursor: 'not-allowed',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 2,
                left: n.defaultOn ? 20 : 2,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: n.defaultOn ? AC.green : AC.faint,
              }}
            />
          </span>
        </div>
      ))}
      <div style={{ fontFamily: mono, fontSize: 10, color: AC.faint, marginTop: 14 }}>
        Per-notification controls are coming soon — for now these reflect the defaults everyone gets.
      </div>
    </section>
  )
}

/* ----------------------- Preferences & connections ------------------- */

function PreferencesSection({ data }: { data: SettingsData }) {
  const github = data.providers.find((p) => p.provider === 'github')
  const google = data.providers.find((p) => p.provider === 'google')

  return (
    <section style={sectionStyle}>
      <div style={{ ...eyebrowStyle, marginBottom: 16 }}>Preferences &amp; connections</div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '12px 4px',
          borderBottom: `1px solid ${AC.line}`,
        }}
      >
        <div style={{ flex: '1 1 0%' }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Language</div>
          <div style={{ fontSize: 12.5, color: AC.muted }}>applies across the whole academy</div>
        </div>
        <span
          aria-disabled
          title="Language switching is coming soon"
          style={{
            fontFamily: mono,
            fontSize: 11.5,
            color: AC.muted,
            background: AC.inputBg,
            border: `1px solid ${AC.inputBorder}`,
            borderRadius: 9,
            padding: '8px 12px',
            opacity: 0.7,
            cursor: 'not-allowed',
            flexShrink: 0,
          }}
        >
          EN · soon
        </span>
      </div>

      <ConnectionRow
        label="GitHub"
        connected={!!github?.connected}
        connectedNote={github?.handle ? `connected · ${github.handle}` : 'connected'}
      />
      <ConnectionRow label="Google" connected={!!google?.connected} last />
    </section>
  )
}

function ConnectionRow({
  label,
  connected,
  connectedNote,
  last,
}: {
  label: string
  connected: boolean
  connectedNote?: string
  last?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 4px',
        borderBottom: last ? 'none' : `1px solid ${AC.line}`,
      }}
    >
      <div style={{ flex: '1 1 0%' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: connected ? AC.green : AC.faint,
          }}
        >
          {connected ? connectedNote ?? 'connected' : 'not connected'}
        </div>
      </div>
      {/* Read-only status: no link/unlink flow is wired, so we don't render a
          control that pretends to connect or disconnect. */}
      <span
        aria-disabled
        title="Managing connected accounts is coming soon"
        style={{
          fontFamily: mono,
          fontSize: 10.5,
          color: AC.faint,
          opacity: 0.7,
          cursor: 'not-allowed',
          whiteSpace: 'nowrap',
        }}
      >
        {connected ? 'manage soon' : 'connect soon'}
      </span>
    </div>
  )
}

/* ------------------------------ Danger ------------------------------- */

function DangerSection({ data }: { data: SettingsData }) {
  return (
    <section style={{ ...sectionStyle, border: '1px solid rgba(229,72,77,0.3)', marginBottom: 0 }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: AC.red,
          marginBottom: 16,
        }}
      >
        Danger zone
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '10px 4px',
          borderBottom: `1px solid ${AC.line}`,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 0%', minWidth: 220 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Export everything</div>
          <div style={{ fontSize: 12.5, color: AC.muted }}>
            Your full ledger, artifacts, and recall history — a file, yours forever.
          </div>
        </div>
        <a
          href="/api/academy/export"
          style={{
            display: 'inline-flex',
            border: `1px solid ${AC.inputBorder}`,
            borderRadius: 18,
            padding: '9px 18px',
            fontFamily: mono,
            fontSize: 11,
            color: '#B6B6C0',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          ↓ export ledger
        </a>
      </div>

      <DeleteAccountRow supportMailto={data.supportMailto} />
    </section>
  )
}

function DeleteAccountRow({ supportMailto }: { supportMailto: string }) {
  // There is no self-serve account-deletion endpoint. Rather than fake a
  // destructive button, this opens a real, pre-filled deletion request to
  // support — an honest path that actually does something.
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 4px 4px', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 0%', minWidth: 220 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Delete account</div>
        <div style={{ fontSize: 12.5, color: AC.muted }}>
          Permanent. Export your data above first — deleting shouldn&apos;t cost you your work. Deletion is handled
          by support so we can confirm it&apos;s really you.
        </div>
      </div>
      <a
        href={supportMailto}
        style={{
          display: 'inline-flex',
          border: '1px solid rgba(229,72,77,0.45)',
          borderRadius: 18,
          padding: '9px 18px',
          fontSize: 12.5,
          fontWeight: 600,
          color: AC.red,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Request deletion
      </a>
    </div>
  )
}
