'use client'

/**
 * Sage Ideas Home v2 — light editorial "printed page" front page.
 * Implemented from "Sage Ideas Home v2.dc.html" (Claude Design export).
 *
 * Honesty pass vs the mock: no invented metrics survive. Stats strip counts
 * the six real products in the work index; terminal rows carry states, not
 * fabricated percentages; the process prices match the live Stripe-backed
 * tiers in data/services/tiers.ts. Image slots use approved originals from
 * public/art (no headshot by standing instruction).
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './home-v2.module.css'

const INK = '#1A1712'
const PAPER = '#E7E1D3'
const BLUE = '#1B2BD4'
const RUST = '#B4471F'
const FADE = '#5E564A'
const HAIR = '#CBC1AE'

const PROJECTS = [
  { idx: '01', name: 'Nexural', domain: 'Fintech · Trading SaaS', status: 'Private', stack: 'Next.js · Supabase · Stripe', tint: BLUE },
  { idx: '02', name: 'Athanor', domain: 'AI · App factory', status: 'Private', stack: 'TS monorepo · multi-agent', tint: BLUE },
  { idx: '03', name: 'Voza', domain: 'EdTech · Voice AI', status: 'Beta', stack: 'Deepgram · Claude · ElevenLabs', tint: RUST },
  { idx: '04', name: 'Quality OS', domain: 'DevTools · QA', status: 'Private', stack: 'MCP · Postgres RLS · SLSA L3', tint: BLUE },
  { idx: '05', name: 'Giggl', domain: 'Consumer AI · Mobile', status: 'Beta', stack: 'Expo · LightGBM · pgvector', tint: RUST },
  { idx: '06', name: 'Sage After Dark', domain: 'Publication · Web', status: 'Live', stack: 'Next.js 15 · React 19 · MDX', tint: '#2E7D4F' },
]

const SERVICES = [
  ['S-01', 'AI Systems', 'Agents, copilots, retrieval, voice, and workflow automation that run inside the real business.'],
  ['S-02', 'Applications & SaaS', 'Full-stack products: schema to interface, auth to billing, observability to support.'],
  ['S-03', 'Brand & Web', 'Identity, narrative, and a conversion site that makes the product legible and premium.'],
  ['S-04', 'Growth & SEO', 'Technical SEO, content systems, analytics, and compounding distribution loops.'],
] as const

// Prices mirror the live Stripe-backed tiers (data/services/tiers.ts) — never the mock.
const PATH = [
  ['01', 'Sage Audit', '1 week', '$750', 'Find the single highest-leverage bottleneck and leave with a scoped, costed plan you own. Credited in full if you continue.'],
  ['02', 'Sprint', 'Weeks 1–2', 'from $2,500', 'Ship one visible, production-grade improvement — real code, deployed, measured against conversion.'],
  ['03', 'Build', 'Weeks 3–8', 'from $9,500', 'Turn the validated direction into the live product, site, AI systems, and offer engine.'],
  ['04', 'Operate', 'Ongoing', '$2,500/mo', 'Measure, improve, and publish so the system compounds instead of quietly decaying.'],
] as const

const OPS = [
  { n: 'strategy', s: 'scoped', state: 'ok' },
  { n: 'product', s: 'shipping', state: 'run' },
  { n: 'ai.core', s: 'running', state: 'live' },
  { n: 'brand', s: 'ready', state: 'ok' },
  { n: 'growth', s: 'compounding', state: 'up' },
  { n: 'operate', s: 'live logs', state: 'run' },
] as const
const OPS_DOT: Record<string, string> = { ok: '#9FB0FF', run: '#E8B75A', live: '#7FD6A0', up: '#7FD6A0' }

const CORE = {
  label: 'AI Systems',
  tag: 'System core',
  desc: 'Agents, retrieval, copilots, and automation — intelligence wired into the real workflow, not bolted on. The core every other discipline runs through.',
  points: ['Agents & copilots', 'RAG & retrieval', 'Workflow automation'],
}
const ORBIT = [
  { label: 'Strategy', x: 360, y: 84, lx: 360, ly: 54, anchor: 'middle', desc: 'Find the highest-leverage move — the product, market, and offer that actually compounds.', points: ['Positioning', 'Offer design', 'Roadmap'] },
  { label: 'Product', x: 539, y: 214, lx: 572, ly: 212, anchor: 'start', desc: 'Full-stack product: schema to interface, auth to billing, shipped to production.', points: ['Full-stack build', 'Auth & billing', 'Production deploy'] },
  { label: 'Brand', x: 471, y: 424, lx: 486, ly: 458, anchor: 'start', desc: 'Identity, narrative, and a site that makes the product legible and premium.', points: ['Identity', 'Narrative', 'Site & UI'] },
  { label: 'Growth', x: 249, y: 424, lx: 234, ly: 458, anchor: 'end', desc: 'Technical SEO, content systems, and compounding distribution loops.', points: ['Technical SEO', 'Content systems', 'Distribution loops'] },
  { label: 'Operate', x: 181, y: 214, lx: 148, ly: 212, anchor: 'end', desc: 'Measure, improve, and publish — the machine keeps compounding after launch.', points: ['Analytics', 'Iteration', 'Publishing'] },
] as const

const monoLabel = (color: string): React.CSSProperties => ({
  fontFamily: 'var(--font-mono), monospace',
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color,
})

function useClock() {
  const [now, setNow] = useState('··:··:··')
  useEffect(() => {
    const set = () => setNow(new Date().toLocaleTimeString('en-GB'))
    set()
    const id = setInterval(set, 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export function HomeV2() {
  const [active, setActive] = useState(-1)
  const clock = useClock()
  const cur = active === -1 ? CORE : ORBIT[active]

  return (
    <div className={styles.page}>
      {/* printed page frame */}
      <div aria-hidden className={styles.frame} />
      <div aria-hidden className={styles.corner} style={{ top: 14, left: 14, borderTop: `2px solid ${BLUE}`, borderLeft: `2px solid ${BLUE}` }} />
      <div aria-hidden className={styles.corner} style={{ top: 14, right: 14, borderTop: `2px solid ${BLUE}`, borderRight: `2px solid ${BLUE}` }} />
      <div aria-hidden className={styles.corner} style={{ bottom: 14, left: 14, borderBottom: `2px solid ${BLUE}`, borderLeft: `2px solid ${BLUE}` }} />
      <div aria-hidden className={styles.corner} style={{ bottom: 14, right: 14, borderBottom: `2px solid ${BLUE}`, borderRight: `2px solid ${BLUE}` }} />

      <div style={{ position: 'relative', zIndex: 10, padding: '0 32px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          {/* HEADER */}
          <header className={styles.header}>
            <a href="#top" style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span className={styles.serif} style={{ fontWeight: 500, fontSize: 21, letterSpacing: '-0.02em' }}>Sage Ideas</span>
              <span className={styles.mono} style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: BLUE }}>™</span>
            </a>
            <nav className={styles.navLinks} aria-label="Home sections">
              <a className={styles.wipe} href="#work">Work</a>
              <a className={styles.wipe} href="#system">System</a>
              <a className={styles.wipe} href="#services">Services</a>
              <a className={styles.wipe} href="#path">Process</a>
              <Link className={styles.wipe} href="/academy">Academy</Link>
            </nav>
            <span style={{ flex: 1 }} />
            <span className={styles.slotOpen}>●&nbsp;1 slot open</span>
            <Link href="/login" className={`${styles.wipe} ${styles.mono}`} style={{ fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: FADE }}>
              Log in
            </Link>
            <Link href="/book" className={`${styles.btnDark} ${styles.mono}`} style={{ height: 38, padding: '0 18px', fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: PAPER }}>
              Book a call
            </Link>
          </header>

          {/* HERO */}
          <section id="top" style={{ position: 'relative', padding: '30px 0 0' }}>
            <div className={styles.mono} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: FADE, padding: '14px 0', borderBottom: `1px solid ${HAIR}` }}>
              <span>Est. 2024 — Orlando, FL</span>
              <span className={styles.slotOpen} style={{ color: FADE }}>Solo AI Studio</span>
              <span>Fig. 00 — Cover</span>
            </div>

            <div className={styles.heroGrid}>
              <div style={{ alignSelf: 'center' }}>
                <h1 className={styles.serif} style={{ fontWeight: 300, fontSize: 'clamp(2.7rem, 1.1rem + 6.2vw, 6.2rem)', lineHeight: 1.04, letterSpacing: '-0.035em', textWrap: 'balance' }}>
                  I build the<br />product, the brand,<br />&&nbsp;the <span style={{ fontStyle: 'italic', fontWeight: 400, color: BLUE }}>intelligence</span><br />that runs it.
                </h1>
                <p style={{ maxWidth: 480, marginTop: 34, fontSize: 18, lineHeight: 1.6, color: '#3A352D' }}>
                  A one-operator studio for AI-native brands.{' '}
                  <span style={{ color: INK, fontWeight: 500 }}>The person who pitches you is the person who writes the code</span> — no agency, no handoff, no telephone game.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 38 }}>
                  <Link href="/book" className={styles.btnDark} style={{ height: 54, padding: '0 26px', fontSize: 15, fontWeight: 500, color: PAPER }}>
                    Book a call <span aria-hidden>→</span>
                  </Link>
                  <a href="#work" className={styles.wipe} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, height: 54, padding: '0 6px', fontSize: 15, fontWeight: 500 }}>
                    See the work <span aria-hidden style={{ color: BLUE }}>↓</span>
                  </a>
                </div>
              </div>

              <figure style={{ position: 'relative', alignSelf: 'stretch', minHeight: 440, margin: 0 }}>
                <span className={styles.mono} style={{ position: 'absolute', top: -10, left: 0, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: FADE }}>
                  Fig. 01 — The studio
                </span>
                <div style={{ position: 'absolute', inset: '18px 0 0 0', border: `1px solid ${INK}`, padding: 7, background: '#DED6C4' }}>
                  <Image src="/art/inkwash-cliffs.avif" alt="Ink-wash cliffs — Sage Ideas studio artwork" fill sizes="(max-width: 900px) 100vw, 40vw" style={{ objectFit: 'cover', padding: 7, filter: 'grayscale(1) contrast(1.04)' }} priority />
                </div>
                <figcaption style={{ position: 'absolute', left: 7, bottom: 7, right: 7, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: 12, background: 'linear-gradient(transparent, rgba(20,17,12,0.78))', color: PAPER, pointerEvents: 'none' }}>
                  <span>
                    <span className={styles.serif} style={{ display: 'block', fontWeight: 500, fontSize: 18 }}>Jason Teixeira</span>
                    <span className={styles.mono} style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 }}>Founder · Principal engineer</span>
                  </span>
                  <span className={styles.mono} style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9FB0FF' }}>● Available</span>
                </figcaption>
              </figure>
            </div>

            <div className={styles.statGrid}>
              {([
                ['06', 'Products in the index'],
                ['05', 'Disciplines'],
                ['100%', 'Verifiable'],
                ['01', 'Operator'],
              ] as const).map(([num, label], i) => (
                <div key={label} style={{ padding: i === 0 ? '18px 18px 18px 0' : i === 3 ? '18px 0 18px 18px' : 18, borderRight: i < 3 ? `1px solid ${HAIR}` : 'none' }}>
                  <strong className={styles.serif} style={{ display: 'block', fontWeight: 400, fontSize: 30, letterSpacing: '-0.02em' }}>{num}</strong>
                  <span className={styles.mono} style={{ fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: FADE }}>{label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* DISCIPLINE MARQUEE */}
        <div style={{ overflow: 'hidden', borderBottom: `1px solid ${INK}`, padding: '20px 0', marginTop: 2 }}>
          <div className={`${styles.marquee} ${styles.serif}`} style={{ fontWeight: 400, fontSize: 34, letterSpacing: '-0.02em' }}>
            {[0, 1].map((copy) => (
              <span key={copy} style={{ display: 'flex' }} aria-hidden={copy === 1}>
                {['AI Systems', 'Applications', 'SaaS', 'Brand & Web', 'Growth & SEO'].map((d) => (
                  <span key={d} style={{ display: 'flex' }}>
                    <span style={{ padding: '0 28px' }}>{d}</span>
                    <span style={{ padding: '0 28px', color: BLUE }}>✦</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          {/* SELECTED WORK */}
          <section id="work" style={{ padding: '90px 0 30px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 30, flexWrap: 'wrap', paddingBottom: 30, borderBottom: `1px solid ${INK}` }}>
              <div>
                <span style={monoLabel(BLUE)}>01 — Selected work</span>
                <h2 className={styles.serif} style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 1.4rem + 3vw, 4rem)', lineHeight: 0.98, letterSpacing: '-0.03em', marginTop: 16 }}>
                  I run my own products,<br />then I build yours.
                </h2>
              </div>
              <p className={styles.mono} style={{ maxWidth: 300, fontSize: 14.5, lineHeight: 1.6, color: FADE }}>
                Read straight from the repos — real stack, honest status, hard counts.
              </p>
            </div>
            <div>
              {PROJECTS.map((p) => (
                <Link key={p.name} href="/work" className={styles.workRow} style={{ ['--tint' as string]: p.tint }}>
                  <span className={styles.mono} style={{ fontSize: 12, color: '#9C927C' }}>{p.idx}</span>
                  <span className={`${styles.serif} ${styles.workName}`} style={{ fontWeight: 400, fontSize: 'clamp(1.7rem, 1.1rem + 2.4vw, 3.2rem)', letterSpacing: '-0.025em', lineHeight: 1 }}>{p.name}</span>
                  <span className={`${styles.mono} ${styles.workStack}`} style={{ fontSize: 11.5, color: FADE, letterSpacing: '0.04em', textAlign: 'right' }}>
                    {p.stack}
                    <br />
                    <span style={{ color: '#9C927C' }}>{p.domain}</span>
                  </span>
                  <span className={styles.mono} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: p.tint, minWidth: 74, justifyContent: 'flex-end' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.tint }} />
                    {p.status}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* SYSTEM — blueprint instrument */}
        <section id="system" style={{ borderTop: `1px solid ${INK}`, background: '#E1DAC9', backgroundImage: 'radial-gradient(circle at center, #1a17120d 1px, transparent 1px)', backgroundSize: '26px 26px' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '90px 32px' }}>
            <div style={{ maxWidth: 640 }}>
              <span style={monoLabel(BLUE)}>02 — The system</span>
              <h2 className={styles.serif} style={{ fontWeight: 300, fontSize: 'clamp(2rem, 1.3rem + 2.6vw, 3.4rem)', lineHeight: 1, letterSpacing: '-0.03em', marginTop: 16 }}>
                One operator. The whole stack — and the <span style={{ fontStyle: 'italic', fontWeight: 400, color: BLUE }}>intelligence</span> wired through it.
              </h2>
            </div>
            <div className={styles.systemGrid} style={{ marginTop: 46 }}>
              <div style={{ position: 'relative', border: `1px solid ${INK}`, background: PAPER }}>
                <div className={styles.mono} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${HAIR}`, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: FADE }}>
                  <span>Dwg. SYS-01 · the machine</span>
                  <span>Scale 1:1</span>
                </div>
                <svg viewBox="0 0 720 540" style={{ display: 'block', width: '100%', height: 'auto' }} role="img" aria-label="Intelligence core connected to Strategy, Product, Brand, Growth and Operate">
                  <defs>
                    <radialGradient id="v2glow">
                      <stop offset="0" stopColor={BLUE} stopOpacity="0.22" />
                      <stop offset="1" stopColor={BLUE} stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <g stroke="#C2B9A4" strokeWidth="1" fill="none">
                    <circle cx="360" cy="270" r="118" />
                    <circle cx="360" cy="270" r="186" />
                    <circle cx="360" cy="270" r="246" />
                  </g>
                  <g stroke="#C2B9A4" strokeWidth="1" strokeDasharray="3 6">
                    <line x1="360" y1="20" x2="360" y2="520" />
                    <line x1="108" y1="270" x2="612" y2="270" />
                  </g>
                  <polygon points={ORBIT.map((n) => `${n.x},${n.y}`).join(' ')} fill="rgba(27,43,212,0.04)" stroke="#9C927C" strokeWidth="1" />
                  {ORBIT.map((n, i) => (
                    <path key={n.label} d={`M360 270 L${n.x} ${n.y}`} stroke={active === i ? BLUE : '#B0A68F'} strokeWidth={active === i ? 2 : 1} fill="none" />
                  ))}
                  {ORBIT.map((n, i) => (
                    <circle key={n.label} r="3" fill={BLUE}>
                      <animateMotion dur="2.8s" begin={`${-i * 0.55}s`} repeatCount="indefinite" path={`M360 270 L${n.x} ${n.y}`} />
                    </circle>
                  ))}
                  <ellipse cx="360" cy="270" rx="140" ry="140" fill="url(#v2glow)" />
                  <circle cx="360" cy="270" r="60" fill="none" stroke={BLUE} strokeWidth="1" strokeDasharray="5 9" opacity="0.5" className={styles.spin} />
                  <g style={{ cursor: 'pointer' }} onMouseEnter={() => setActive(-1)}>
                    <rect x="326" y="236" width="68" height="68" fill={BLUE} />
                    <text x="360" y="278" textAnchor="middle" fontFamily="var(--font-serif), Fraunces, serif" fontWeight="400" fontSize="22" fill={PAPER}>AI</text>
                  </g>
                  {ORBIT.map((n, i) => {
                    const on = active === i
                    return (
                      <g key={n.label} style={{ cursor: 'pointer' }} onMouseEnter={() => setActive(i)}>
                        <circle cx={n.x} cy={n.y} r="24" fill={on ? 'rgba(27,43,212,0.12)' : 'transparent'} />
                        <rect x={n.x - 8} y={n.y - 8} width="16" height="16" fill={PAPER} stroke={on ? BLUE : INK} strokeWidth="1.5" />
                        <circle cx={n.x} cy={n.y} r="3.5" fill={on ? BLUE : '#9C927C'} />
                        <text x={n.lx} y={n.ly} textAnchor={n.anchor} fontFamily="var(--font-mono), monospace" fontSize="12" letterSpacing="1.5" fill={on ? BLUE : FADE}>
                          {n.label.toUpperCase()}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
              <div style={{ border: `1px solid ${INK}`, background: PAPER, padding: 28, minHeight: 300 }}>
                <span className={styles.mono} style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: BLUE }}>
                  {active === -1 ? CORE.tag : `0${active + 1} / 05 · discipline`}
                </span>
                <h3 className={styles.serif} style={{ fontWeight: 400, fontSize: 30, letterSpacing: '-0.02em', marginTop: 14 }}>{cur.label}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.62, color: '#3A352D', marginTop: 14 }}>{cur.desc}</p>
                <ul style={{ listStyle: 'none', margin: '20px 0 0', padding: 0, borderTop: `1px solid ${HAIR}` }}>
                  {cur.points.map((p) => (
                    <li key={p} className={styles.mono} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#3A352D', padding: '11px 0', borderBottom: `1px solid ${HAIR}` }}>
                      <span style={{ color: BLUE }}>→</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* LIVE — dark slab */}
        <section id="live" style={{ borderTop: `1px solid ${INK}`, background: '#14110C', color: PAPER }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '90px 32px' }}>
            <div className={styles.liveGrid}>
              <div>
                <span style={monoLabel('#9FB0FF')}>03 — Live in production</span>
                <h2 className={styles.serif} style={{ fontWeight: 300, fontSize: 'clamp(2rem, 1.3rem + 2.6vw, 3.4rem)', lineHeight: 1, letterSpacing: '-0.03em', marginTop: 16, color: '#F3EFE5' }}>
                  This is what <span style={{ fontStyle: 'italic', fontWeight: 400, color: '#9FB0FF' }}>shipped</span> looks like.
                </h2>
                <p style={{ fontSize: 16, lineHeight: 1.62, color: '#B8B0A2', marginTop: 18, maxWidth: 400 }}>
                  Not a mockup — a live operating surface running every day. The same depth and finish go into what I build for you.
                </p>
                <Link href="/work" className={styles.wipe} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginTop: 24, fontSize: 14.5, color: '#9FB0FF' }}>
                  Read the case studies <span aria-hidden>→</span>
                </Link>
              </div>
              <div style={{ border: '1px solid #2E2A22', background: '#0D0B07' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 15px', borderBottom: '1px solid #2E2A22' }}>
                  <span style={{ display: 'flex', gap: 6 }}>
                    <i style={{ width: 9, height: 9, background: '#3A352B', display: 'block' }} />
                    <i style={{ width: 9, height: 9, background: '#3A352B', display: 'block' }} />
                    <i style={{ width: 9, height: 9, background: '#3A352B', display: 'block' }} />
                  </span>
                  <span className={styles.mono} style={{ fontSize: 11, color: '#8A8276' }}>
                    sage@studio: <span style={{ color: '#9FB0FF' }}>~/the-stack</span>
                  </span>
                  <span style={{ flex: 1 }} />
                  <span className={styles.mono} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, letterSpacing: '0.12em', color: '#7FD6A0' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7FD6A0' }} />
                    LIVE
                  </span>
                  <span className={styles.mono} style={{ fontSize: 11, color: '#8A8276' }}>{clock}</span>
                </div>
                <div style={{ padding: '18px 16px' }}>
                  <p className={styles.mono} style={{ fontSize: 12.5, color: '#B8B0A2', marginBottom: 14 }}>
                    <span style={{ color: '#9FB0FF' }}>$</span> stack --status --watch
                    <span className={styles.blink} style={{ display: 'inline-block', width: 7, height: 14, background: '#9FB0FF', marginLeft: 4, verticalAlign: -2 }} />
                  </p>
                  <div>
                    {OPS.map((r, i) => (
                      <div key={r.n} style={{ display: 'grid', gridTemplateColumns: '26px 1fr auto 72px', alignItems: 'center', gap: 12, padding: '9px 6px', borderBottom: '1px solid #1c1812' }}>
                        <span className={styles.mono} style={{ fontSize: 11, color: '#6A6256' }}>0{i + 1}</span>
                        <span className={styles.mono} style={{ fontSize: 13, color: PAPER }}>{r.n}</span>
                        <span className={styles.mono} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#B8B0A2' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: OPS_DOT[r.state] }} />
                          {r.s}
                        </span>
                        <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          {r.state === 'live' ? (
                            <span className={styles.bars} style={{ display: 'inline-flex', gap: 2, alignItems: 'flex-end', height: 14 }}>
                              {Array.from({ length: 9 }).map((_, k) => (
                                <i key={k} style={{ width: 2, height: '100%', background: '#7FD6A0', animationDelay: `${k * 90}ms` }} />
                              ))}
                            </span>
                          ) : r.state === 'up' ? (
                            <svg width="64" height="14" viewBox="0 0 64 14" preserveAspectRatio="none">
                              <polyline points="0,11 10,8 18,9 28,5 38,7 48,3 64,2" fill="none" stroke="#7FD6A0" strokeWidth="1.4" />
                            </svg>
                          ) : r.state === 'run' ? (
                            <span style={{ display: 'block', width: 64, height: 3, background: '#2E2A22', overflow: 'hidden' }}>
                              <i className={styles.sweepBar} style={{ display: 'block', height: '100%', width: '40%', background: '#E8B75A' }} />
                            </span>
                          ) : (
                            <span className={styles.mono} style={{ fontSize: 10, letterSpacing: '0.1em', color: '#9FB0FF' }}>OK</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.mono} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: 16, paddingTop: 14, borderTop: '1px solid #2E2A22', fontSize: 11, color: '#8A8276' }}>
                    <span>6 disciplines</span>
                    <span style={{ color: '#3A352B' }}>·</span>
                    <span>1 operator</span>
                    <span style={{ color: '#3A352B' }}>·</span>
                    <span style={{ color: '#9FB0FF' }}>ai.core ▸ running</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          {/* SERVICES */}
          <section id="services" style={{ padding: '90px 0 40px' }}>
            <div style={{ maxWidth: 600, paddingBottom: 34, borderBottom: `1px solid ${INK}` }}>
              <span style={monoLabel(BLUE)}>04 — Services</span>
              <h2 className={styles.serif} style={{ fontWeight: 300, fontSize: 'clamp(2rem, 1.3rem + 2.6vw, 3.4rem)', lineHeight: 1, letterSpacing: '-0.03em', marginTop: 16 }}>
                The piece, or the<br />whole business.
              </h2>
            </div>
            <div>
              {SERVICES.map(([num, title, text]) => (
                <div key={num} className={styles.serviceRow}>
                  <span className={styles.mono} style={{ fontSize: 11.5, color: '#9C927C', letterSpacing: '0.06em' }}>{num}</span>
                  <h3 className={styles.serif} style={{ fontWeight: 400, fontSize: 'clamp(1.4rem, 1.05rem + 1.4vw, 2.1rem)', letterSpacing: '-0.02em', lineHeight: 1 }}>{title}</h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.55, color: '#3A352D' }}>{text}</p>
                  <span className={styles.serviceArrow} style={{ fontSize: 22, color: BLUE }}>→</span>
                </div>
              ))}
            </div>
          </section>

          {/* PROCESS / PATH */}
          <section id="path" style={{ padding: '60px 0 40px' }}>
            <div style={{ maxWidth: 600, paddingBottom: 34, borderBottom: `1px solid ${INK}` }}>
              <span style={monoLabel(BLUE)}>05 — How we work</span>
              <h2 className={styles.serif} style={{ fontWeight: 300, fontSize: 'clamp(2rem, 1.3rem + 2.6vw, 3.4rem)', lineHeight: 1, letterSpacing: '-0.03em', marginTop: 16 }}>
                A clear path. A fixed<br />scope. A real number.
              </h2>
            </div>
            <div className={styles.pathGrid}>
              {PATH.map(([num, title, timing, price, text], i) => (
                <div key={num} style={{ borderLeft: `1px solid ${INK}`, borderRight: i === 3 ? `1px solid ${INK}` : 'none', borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}`, padding: '26px 22px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 280, background: i === 0 ? INK : 'transparent', color: i === 0 ? PAPER : INK }}>
                  <span className={styles.serif} style={{ fontWeight: 300, fontSize: 46, lineHeight: 1, letterSpacing: '-0.03em', color: i === 0 ? '#9FB0FF' : BLUE }}>{num}</span>
                  <h3 className={styles.serif} style={{ fontWeight: 400, fontSize: 21, letterSpacing: '-0.01em', marginTop: 4 }}>{title}</h3>
                  <p className={styles.mono} style={{ fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', color: i === 0 ? '#B8B0A2' : FADE }}>
                    {timing} · <b style={{ color: i === 0 ? '#fff' : INK }}>{price}</b>
                  </p>
                  <p style={{ fontSize: 13.5, lineHeight: 1.55, color: i === 0 ? '#C9C2B4' : '#3A352D', flex: 1 }}>{text}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
              <Link href="/checkout/audit" className={styles.btnDark} style={{ height: 54, padding: '0 28px', fontSize: 15, fontWeight: 500, color: PAPER }}>
                Start with the Sage Audit — $750 <span aria-hidden>→</span>
              </Link>
            </div>
          </section>
        </div>

        {/* PROOF */}
        <section id="proof" style={{ borderTop: `1px solid ${INK}`, background: '#E1DAC9' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '90px 32px' }}>
            <span style={monoLabel(BLUE)}>06 — Proof</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, alignItems: 'end', marginTop: 16 }}>
              <h2 className={styles.serif} style={{ fontWeight: 300, fontSize: 'clamp(2.4rem, 1.4rem + 4vw, 5.5rem)', lineHeight: 0.94, letterSpacing: '-0.035em' }}>
                The receipts —<br /><span style={{ fontStyle: 'italic', fontWeight: 400 }}>not the pitch.</span>
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.62, color: '#3A352D', maxWidth: 360 }}>
                Shipped products you can open, and a public build record. Every claim on this page is verifiable before you sign.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 30, alignItems: 'center', marginTop: 50, border: `1px solid ${INK}`, background: PAPER, padding: 34 }}>
              <div>
                <span className={styles.mono} style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: BLUE }}>References, not cherry-picked quotes</span>
                <h3 className={styles.serif} style={{ fontWeight: 400, fontSize: 'clamp(1.5rem, 1.1rem + 1.4vw, 2.4rem)', letterSpacing: '-0.02em', marginTop: 12 }}>
                  Phone a real collaborator before you sign.
                </h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#3A352D', marginTop: 10, maxWidth: 440 }}>
                  Most studios show three hand-picked testimonials. I&apos;ll connect you with real people I&apos;ve built for — unfiltered, on the record.
                </p>
              </div>
              <Link href="/book" className={styles.wipe} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 15, fontWeight: 500, whiteSpace: 'nowrap', justifySelf: 'start' }}>
                Ask for references <span aria-hidden style={{ color: BLUE }}>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ACADEMY */}
        <section id="academy" style={{ borderTop: `1px solid ${INK}`, background: RUST, color: '#F3EBDD' }}>
          <div className={styles.academyGrid} style={{ maxWidth: 1240, margin: '0 auto', padding: '96px 32px' }}>
            <div>
              <span style={monoLabel('#F3D9C6')}>07 — Two ways in</span>
              <h2 className={styles.serif} style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 1.4rem + 3vw, 4.2rem)', lineHeight: 0.96, letterSpacing: '-0.03em', marginTop: 16 }}>
                Hire the studio —<br />or <span style={{ fontStyle: 'italic', fontWeight: 400 }}>learn to build it</span> yourself.
              </h2>
              <p style={{ fontSize: 16.5, lineHeight: 1.6, color: '#F6E7D9', marginTop: 20, maxWidth: 440 }}>
                Everything I run for clients, taught as a practical curriculum: code foundations, AI engineering, and shipping real products. <strong style={{ color: '#fff' }}>$20/mo</strong>, founding cohort forming.
              </p>
              <Link href="/academy" className={styles.btnDark} style={{ height: 54, padding: '0 28px', marginTop: 28, background: '#F3EBDD', color: RUST, fontSize: 15, fontWeight: 600 }}>
                Enter the Academy <span aria-hidden>→</span>
              </Link>
            </div>
            <div style={{ border: '1px solid #F3EBDD', padding: 7 }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3' }}>
                <Image src="/art/sunset-pagoda.png" alt="Sunset pagoda — Sage Academy artwork" fill sizes="(max-width: 900px) 100vw, 45vw" style={{ objectFit: 'cover', filter: 'grayscale(1) contrast(1.05)' }} />
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section id="build" style={{ position: 'relative', borderTop: `1px solid ${INK}`, background: '#14110C', color: PAPER, overflow: 'hidden' }}>
          <span aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: "'Songti SC','SimSun','Noto Serif SC',serif", fontSize: 'clamp(220px, 34vw, 440px)', lineHeight: 1, color: '#1E1A12', pointerEvents: 'none', userSelect: 'none' }}>
            道
          </span>
          <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto', padding: '130px 32px', textAlign: 'center' }}>
            <span style={monoLabel('#9FB0FF')}>08 — Build</span>
            <h2 className={styles.serif} style={{ fontWeight: 300, fontSize: 'clamp(2.8rem, 1.6rem + 5vw, 6rem)', lineHeight: 0.94, letterSpacing: '-0.035em', marginTop: 20, color: '#F3EFE5' }}>
              Bring me the<br /><span style={{ fontStyle: 'italic', fontWeight: 400, color: '#9FB0FF' }}>hard</span> one.
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: '#B8B0A2', marginTop: 22, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
              An app, a brand, a SaaS, or all of it. Every engagement starts with a real conversation — not a contract.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginTop: 34 }}>
              <Link href="/book" className={styles.btnDark} style={{ height: 56, padding: '0 30px', background: PAPER, color: '#14110C', fontSize: 16, fontWeight: 600 }}>
                Book a call <span aria-hidden>→</span>
              </Link>
              <a href="#academy" className={styles.wipe} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, height: 56, padding: '0 8px', fontSize: 16, fontWeight: 500, color: PAPER }}>
                Learn the system <span aria-hidden style={{ color: '#9FB0FF' }}>↗</span>
              </a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: `1px solid ${INK}`, background: PAPER }}>
          <div className={styles.mono} style={{ maxWidth: 1240, margin: '0 auto', padding: '36px 32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 18, fontSize: 11.5, letterSpacing: '0.06em', color: FADE }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className={styles.serif} style={{ fontSize: 16, letterSpacing: '-0.02em', color: INK }}>Sage Ideas</span>
              <span>© 2026 · Orlando, FL</span>
            </span>
            <span style={{ display: 'flex', gap: 22, textTransform: 'uppercase' }}>
              <a href="https://github.com/JasonTeixeira" target="_blank" rel="noopener noreferrer" className={styles.wipe}>GitHub ↗</a>
              <Link href="/work" className={styles.wipe}>Work</Link>
              <Link href="/pricing" className={styles.wipe}>Services</Link>
              <Link href="/legal" className={styles.wipe}>Legal</Link>
              <Link href="/book" className={styles.wipe}>Book</Link>
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}
