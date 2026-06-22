'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './OperatorConsole.module.css'

type SignalType = 'check' | 'bar' | 'wave' | 'spark'
type Station = {
  idx: string
  name: string
  status: string
  state: 'ok' | 'run' | 'live' | 'up'
  desc: string
  chips: string[]
  signal: SignalType
}

const STATIONS: Station[] = [
  {
    idx: '01', name: 'strategy', status: 'scoped', state: 'ok', signal: 'check',
    desc: 'Find the highest-leverage move — the product, market, and offer that actually compounds.',
    chips: ['Positioning', 'Offer design', 'Roadmap'],
  },
  {
    idx: '02', name: 'product', status: 'shipping', state: 'run', signal: 'bar',
    desc: 'Full-stack product: schema to interface, auth to billing, shipped to production.',
    chips: ['Full-stack build', 'Auth & billing', 'Production deploy'],
  },
  {
    idx: '03', name: 'ai.core', status: 'running', state: 'live', signal: 'wave',
    desc: 'Agents, retrieval, copilots, and automation — AI wired into the real workflow, not bolted on. The core every other discipline runs through.',
    chips: ['Agents & copilots', 'RAG & retrieval', 'Workflow automation'],
  },
  {
    idx: '04', name: 'brand', status: 'ready', state: 'ok', signal: 'check',
    desc: 'Identity, narrative, and a site that makes the product legible and premium.',
    chips: ['Identity', 'Narrative', 'Site & UI'],
  },
  {
    idx: '05', name: 'growth', status: '+18.4%', state: 'up', signal: 'spark',
    desc: 'Technical SEO, content systems, and compounding distribution loops.',
    chips: ['Technical SEO', 'Content systems', 'Distribution loops'],
  },
  {
    idx: '06', name: 'operate', status: '247 logs/day', state: 'run', signal: 'spark',
    desc: 'Measure, improve, and publish — the machine keeps compounding after launch.',
    chips: ['Analytics', 'Iteration', 'Publishing'],
  },
]
const CORE = 2

function Spark({ shift }: { shift: number }) {
  // deterministic sparkline that nudges with the live tick
  const pts = Array.from({ length: 18 }, (_, i) => {
    const y = 9 - (Math.sin(i * 0.7 + shift * 0.4) * 3.4 + Math.sin(i * 1.9) * 1.6)
    return `${i * 5},${y.toFixed(1)}`
  })
  return (
    <svg className={styles.spark} viewBox="0 0 85 18" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={pts.join(' ')} />
    </svg>
  )
}

function Signal({ type, active, shift }: { type: SignalType; active: boolean; shift: number }) {
  if (type === 'wave') {
    return (
      <span className={styles.wave} aria-hidden="true">
        {Array.from({ length: 13 }).map((_, i) => (
          <i key={i} style={{ animationDelay: `${i * 90}ms` }} />
        ))}
      </span>
    )
  }
  if (type === 'bar') {
    return (
      <span className={styles.bar} aria-hidden="true">
        <i style={{ width: `${72 + (shift % 4) * 4}%` }} />
      </span>
    )
  }
  if (type === 'spark') return <Spark shift={shift} />
  return <span className={`${styles.ok} ${active ? styles.okOn : ''}`} aria-hidden="true">OK</span>
}

export function OperatorConsole() {
  const [active, setActive] = useState(CORE)
  const [tick, setTick] = useState(0)
  // Clock updates via a DOM ref — no React re-render every second (INP win).
  const clockRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tickId = reduce ? 0 : window.setInterval(() => setTick((t) => t + 1), 1600)
    const setT = () => {
      if (clockRef.current) clockRef.current.textContent = new Date().toLocaleTimeString('en-GB')
    }
    setT()
    const clockId = window.setInterval(setT, 1000)
    return () => {
      if (tickId) clearInterval(tickId)
      clearInterval(clockId)
    }
  }, [])

  const growth = (18.4 + Math.sin(tick * 0.9) * 0.7).toFixed(1)
  const logs = 247 + (tick % 9)

  return (
    <div
      className={styles.console}
      data-living-reveal
      onMouseLeave={() => setActive(CORE)}
      aria-label="The studio operating system — one operator running the whole stack"
    >
      <div className={styles.titlebar}>
        <span className={styles.dots} aria-hidden="true"><i /><i /><i /></span>
        <span className={styles.path}>sage@studio: <span>~/the-stack</span></span>
        <span className={styles.spacer} />
        <span className={styles.live}><i aria-hidden="true" /> LIVE</span>
        <span className={styles.clock} ref={clockRef}>··:··:··</span>
      </div>

      <div className={styles.body}>
        <p className={styles.cmd}>
          <span className={styles.prompt}>$</span> stack --status --watch
          <span className={styles.cursor} aria-hidden="true" />
        </p>

        <div className={styles.head} aria-hidden="true">
          <span>disc</span><span>discipline</span><span>status</span><span>signal</span><span />
        </div>

        <ul className={styles.rows}>
          {STATIONS.map((s, i) => {
            const on = active === i
            const statusText = s.name === 'growth' ? `+${growth}%` : s.name === 'operate' ? `${logs} logs/day` : s.status
            return (
              <li
                key={s.name}
                className={`${styles.row} ${on ? styles.rowOn : ''}`}
                data-state={s.state}
              >
                <div
                  className={styles.rowMain}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={on}
                  aria-label={`${s.name}: ${s.desc}`}
                >
                  <span className={styles.idx}>{s.idx}</span>
                  <span className={styles.name}>{s.name}</span>
                  <span className={styles.status}>
                    <span className={styles.statusDot} data-state={s.state} aria-hidden="true" />
                    {statusText}
                  </span>
                  <span className={styles.signal}><Signal type={s.signal} active={on} shift={tick} /></span>
                  <span className={styles.arrow} aria-hidden="true">{on ? '▾' : '›'}</span>
                </div>
                <div className={styles.detailWrap}>
                  <div className={styles.detail}>
                    <p className={styles.desc}>{s.desc}</p>
                    <ul className={styles.chips}>
                      {s.chips.map((c) => <li key={c}>{c}</li>)}
                    </ul>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <div className={styles.statusbar}>
          <span>6 disciplines</span><i>·</i><span>1 operator</span><i>·</i>
          <span>100% uptime</span><i>·</i><span className={styles.barAccent}>ai.core ▸ running</span>
        </div>
      </div>
    </div>
  )
}
