'use client'

/**
 * Academy site chrome — nav + footer implemented exactly from
 * "Sage Academy Download/Sage Home.dc.html" (nav markup) and the
 * <sage-footer> widget in "Sage Academy Download/sage-widgets.js".
 * This is the ONLY chrome on the academy marketing surfaces — the studio
 * MarketingChrome must never wrap these pages.
 *
 * Honesty deltas vs the mock: the footer's "62 notes and counting" counter
 * is dropped (invented number); the Monday-note form posts to the real
 * /api/newsletter/subscribe endpoint instead of localStorage.
 */

import { useState } from 'react'
import Link from 'next/link'
import { SageChat, FunnelTelemetry } from './SageChat'

const INK = '#F2EFE9'
const DIM = '#B6B6C0'
const MUTED = '#9598A2'
const FAINT = '#4A4A54'
const LINE = '#1E1E24'
const BLUE = '#3D5AFE'

const mono = { fontFamily: 'var(--font-mono), monospace' } as const

const NAV_LINKS = [
  { href: '/field-notes', label: 'Field notes' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/academy/catalog', label: 'Courses' },
  { href: '/academy/proof-not-paper', label: 'Why proof' },
  // Gold sub-brand: the Interview Mastery add-on gets its accent in the nav.
  { href: '/interview', label: 'Interview', tint: '#E0A93E' },
  { href: '/academy/pricing', label: 'Pricing' },
  { href: '/login?audience=academy', label: 'Log in' },
] as { href: string; label: string; tint?: string }[]

export function AcademyNav() {
  const [hover, setHover] = useState<string | null>(null)
  const [ctaHover, setCtaHover] = useState(false)
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        padding: '0 clamp(20px, 4vw, 48px)',
        height: 68,
        background: 'rgba(11,11,14,0.85)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${LINE}`,
      }}
    >
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
        <span
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 26,
            height: 26,
            borderRadius: 8,
            background: BLUE,
            color: '#fff',
            fontSize: 12,
            boxShadow: '0 0 18px rgba(61,90,254,0.35)',
          }}
        >
          ◆
        </span>
        <span>
          <span style={{ display: 'block', fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.15, color: INK }}>
            Sage Academy
          </span>
          <span style={{ ...mono, display: 'block', fontSize: 8.5, textTransform: 'uppercase', letterSpacing: '0.18em', color: MUTED }}>
            Judgment · proven
          </span>
        </span>
      </Link>
      <div className="acadNavLinks" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {NAV_LINKS.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            onMouseEnter={() => setHover(l.label)}
            onMouseLeave={() => setHover(null)}
            style={{
              color: hover === l.label ? (l.tint ?? INK) : l.tint ? '#C9A96A' : DIM,
              background: hover === l.label ? 'rgba(255,255,255,0.04)' : 'transparent',
              textDecoration: 'none',
              fontSize: 14,
              padding: '12px 13px',
              borderRadius: 10,
              whiteSpace: 'nowrap',
            }}
          >
            {l.label}
          </Link>
        ))}
        <Link
          href="/academy/signup"
          onMouseEnter={() => setCtaHover(true)}
          onMouseLeave={() => setCtaHover(false)}
          style={{
            marginLeft: 12,
            color: '#fff',
            background: ctaHover ? '#6E83FF' : BLUE,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
            padding: '11px 20px',
            borderRadius: 24,
            whiteSpace: 'nowrap',
            boxShadow: '0 0 22px rgba(61,90,254,0.3)',
          }}
        >
          Start learning
        </Link>
      </div>
      {/* nav-squeeze, from the design helmet CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
@media (max-width: 1120px) { .acadNavLinks a { padding: 12px 8px; font-size: 13px; } }
@media (max-width: 760px) { .acadNavLinks a { display: none; } .acadNavLinks a:last-child { display: inline-flex; } }`,
        }}
      />
    </nav>
  )
}

const FOOTER_COLS: { head: string; links: { href: string; label: string }[] }[] = [
  {
    head: 'Learn',
    links: [
      { href: '/how-it-works', label: 'How it works' },
      { href: '/academy/catalog', label: 'Courses' },
      { href: '/field-notes', label: 'Field notes' },
      { href: '/academy/challenge', label: 'Weekly challenge' },
    ],
  },
  {
    head: 'Product',
    links: [
      { href: '/academy/proof-not-paper', label: 'Why proof' },
      { href: '/academy/pricing', label: 'Pricing' },
      { href: '/interview', label: 'Interview Mastery' },
      { href: '/academy/how-we-audit', label: 'How we audit' },
      { href: '/academy/onboarding', label: 'Placement test' },
      { href: '/academy/help', label: 'Help center' },
    ],
  },
  {
    head: 'Company',
    links: [
      { href: '/academy/about', label: 'About' },
      { href: '/services', label: 'Hire the studio' },
      { href: '/academy/legal', label: 'Legal' },
      { href: 'mailto:hello@sageideas.dev', label: 'hello@sageideas.dev' },
    ],
  },
]

export function AcademyFooter() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')

  async function subscribe() {
    const v = email.trim()
    if (!v || v.indexOf('@') < 1) {
      setState('error')
      setTimeout(() => setState('idle'), 1200)
      return
    }
    setState('busy')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: v, source: 'academy-footer' }),
      })
      setState(res.ok ? 'done' : 'error')
      if (!res.ok) setTimeout(() => setState('idle'), 1600)
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 1600)
    }
  }

  return (
    <footer style={{ borderTop: `1px solid ${LINE}`, background: '#0D0D11', fontFamily: 'var(--font-sans), sans-serif' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: 'clamp(44px, 6vw, 72px) clamp(20px, 4vw, 48px) 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '36px 28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: INK, fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.01em' }}>
              <span
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  background: BLUE,
                  color: '#fff',
                  fontSize: 12,
                  boxShadow: '0 0 18px rgba(61,90,254,0.35)',
                }}
              >
                ◆
              </span>
              Sage Academy
            </div>
            <div style={{ ...mono, marginTop: 14, fontSize: 10.5, color: MUTED, lineHeight: 1.8 }}>
              frame → route → map
              <br />→ decide → <b style={{ color: '#8FA0FF', fontWeight: 500 }}>prove</b>
            </div>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.head}>
              <h4 style={{ ...mono, margin: '0 0 14px', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em', color: FAINT }}>
                {col.head}
              </h4>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith('mailto:') || l.href.startsWith('http') ? (
                      <a href={l.href} style={{ color: '#9C9CA6', textDecoration: 'none', fontSize: 13.5 }}>
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} style={{ color: '#9C9CA6', textDecoration: 'none', fontSize: 13.5 }}>
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 style={{ ...mono, margin: '0 0 14px', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em', color: FAINT }}>
              The Monday note
            </h4>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#9C9CA6', lineHeight: 1.55 }}>
              One real incident, mapped in public — in your inbox every Monday.
            </p>
            {state === 'done' ? (
              <div style={{ ...mono, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: '#18B663', padding: '10px 0' }}>
                ✓ you&apos;re in — see you Monday
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  placeholder="you@work.dev"
                  aria-label="Email for the Monday note"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') subscribe()
                  }}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: '#0F0F13',
                    border: `1px solid ${state === 'error' ? '#E5484D' : '#2A2A33'}`,
                    borderRadius: 10,
                    padding: '10px 13px',
                    fontSize: 13,
                    color: INK,
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={subscribe}
                  disabled={state === 'busy'}
                  style={{
                    background: BLUE,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '0 16px',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                    opacity: state === 'busy' ? 0.7 : 1,
                  }}
                >
                  Subscribe
                </button>
              </div>
            )}
            <div style={{ ...mono, marginTop: 10, fontSize: 9.5, color: FAINT }}>unsubscribe anytime</div>
          </div>
        </div>
        <div
          style={{
            ...mono,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginTop: 'clamp(36px, 5vw, 56px)',
            paddingTop: 22,
            borderTop: `1px solid ${LINE}`,
            fontSize: 10.5,
            color: FAINT,
          }}
        >
          <span style={{ color: MUTED }}>© 2026 Sage Ideas LLC · sageideas.dev</span>
          <span>proof, not vibes</span>
        </div>
      </div>
      {/* Sprout chat dock + funnel telemetry ride with the footer so every
          academy marketing page gets both with zero extra wiring. */}
      <SageChat />
      <FunnelTelemetry />
    </footer>
  )
}
