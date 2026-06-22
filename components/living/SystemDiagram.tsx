'use client'

import { useState } from 'react'
import styles from './LivingSystemsHome.module.css'

/** Center = the AI core. Five disciplines orbit it, connected by live energy beams. */
const CORE = {
  label: 'AI Systems',
  tag: 'System core',
  desc: 'Agents, retrieval, copilots, and automation — AI wired into the real workflow, not bolted on. The core every other discipline runs through.',
  points: ['Agents & copilots', 'RAG & retrieval', 'Workflow automation'],
}

// Positions on an ellipse around the core at (640, 300), clockwise from top.
const ORBIT = [
  { label: 'Strategy', x: 640, y: 92, lx: 640, ly: 50, anchor: 'middle',
    desc: 'Find the highest-leverage move — the product, market, and offer that actually compounds.',
    points: ['Positioning', 'Offer design', 'Roadmap'] },
  { label: 'Product', x: 1001, y: 235, lx: 1040, ly: 230, anchor: 'start',
    desc: 'Full-stack product: schema to interface, auth to billing, shipped to production.',
    points: ['Full-stack build', 'Auth & billing', 'Production deploy'] },
  { label: 'Brand', x: 863, y: 470, lx: 888, ly: 506, anchor: 'start',
    desc: 'Identity, narrative, and a site that makes the product legible and premium.',
    points: ['Identity', 'Narrative', 'Site & UI'] },
  { label: 'Growth', x: 417, y: 470, lx: 392, ly: 506, anchor: 'end',
    desc: 'Technical SEO, content systems, and compounding distribution loops.',
    points: ['Technical SEO', 'Content systems', 'Distribution loops'] },
  { label: 'Operate', x: 279, y: 235, lx: 240, ly: 230, anchor: 'end',
    desc: 'Measure, improve, and publish — the machine keeps compounding after launch.',
    points: ['Analytics', 'Iteration', 'Publishing'] },
] as const

const CX = 640
const CY = 300

export function SystemDiagram() {
  // active: -1 = core (AI), 0..4 = orbit index
  const [active, setActive] = useState(-1)
  const current = active === -1 ? CORE : ORBIT[active]
  const tag = active === -1 ? CORE.tag : `0${active + 1} / 05 · discipline`

  return (
    <div
      className={styles.systemDiagram}
      data-living-reveal
      onMouseLeave={() => setActive(-1)}
      aria-label="What the studio builds — one connected system with AI at the core"
    >
      <span className={styles.systemKicker}>One operator · one connected system · hover the core or a discipline</span>

      <svg
        className={styles.systemSvg}
        viewBox="0 0 1280 600"
        role="img"
        aria-label="AI Systems core connected to Strategy, Product, Brand, Growth, and Operate"
      >
        <defs>
          <radialGradient id="nx-core-glow">
            <stop offset="0" stopColor="#3D5AFE" stopOpacity="0.5" />
            <stop offset="0.6" stopColor="#3D5AFE" stopOpacity="0.12" />
            <stop offset="1" stopColor="#3D5AFE" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="nx-chip" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5670ff" />
            <stop offset="1" stopColor="#2840d6" />
          </linearGradient>
          <filter id="nx-glow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ambient concentric rings */}
        <g className={styles.systemRings}>
          {[120, 180, 240].map((r) => (
            <circle key={r} cx={CX} cy={CY} r={r} className={styles.systemRingFaint} />
          ))}
        </g>

        {/* faint web connecting the orbit (it's a connected system) */}
        <polygon
          className={styles.systemWeb}
          points={ORBIT.map((n) => `${n.x},${n.y}`).join(' ')}
        />

        {/* energy beams core -> each discipline */}
        {ORBIT.map((n, i) => (
          <path
            key={`beam-${i}`}
            className={`${styles.systemBeam} ${active === i ? styles.systemBeamOn : ''}`}
            d={`M${CX} ${CY} L${n.x} ${n.y}`}
          />
        ))}

        {/* flowing pulses along each beam */}
        {ORBIT.map((n, i) => (
          <circle key={`pulse-${i}`} r={3.5} className={styles.systemPulse}>
            <animateMotion
              dur="2.4s"
              begin={`${-i * 0.45}s`}
              repeatCount="indefinite"
              path={`M${CX} ${CY} L${n.x} ${n.y}`}
            />
          </circle>
        ))}

        {/* orbit nodes */}
        {ORBIT.map((n, i) => {
          const on = active === i
          return (
            <g
              key={n.label}
              className={`${styles.systemNode} ${on ? styles.systemNodeOn : ''}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              tabIndex={0}
              role="button"
              aria-label={`${n.label}: ${n.desc}`}
            >
              <circle className={styles.systemNodeHalo} cx={n.x} cy={n.y} r={26} />
              <circle className={styles.systemPad} cx={n.x} cy={n.y} r={11} />
              <circle className={styles.systemPadDot} cx={n.x} cy={n.y} r={4} />
              <text className={styles.systemLabel} x={n.lx} y={n.ly} textAnchor={n.anchor as 'start' | 'middle' | 'end'}>
                {n.label}
              </text>
            </g>
          )
        })}

        {/* AI core */}
        <g
          className={`${styles.systemCore} ${active === -1 ? styles.systemCoreOn : ''}`}
          onMouseEnter={() => setActive(-1)}
          onFocus={() => setActive(-1)}
          onClick={() => setActive(-1)}
          tabIndex={0}
          role="button"
          aria-label={`${CORE.label}: ${CORE.desc}`}
        >
          <ellipse cx={CX} cy={CY} rx={150} ry={150} fill="url(#nx-core-glow)" className={styles.systemCoreGlow} />
          <circle className={styles.systemScan} cx={CX} cy={CY} r={64} />
          <g className={styles.systemBreathe}>
            <rect
              className={styles.systemChip}
              x={CX - 36}
              y={CY - 36}
              width={72}
              height={72}
              rx={18}
              fill="url(#nx-chip)"
              filter="url(#nx-glow)"
            />
            <text className={styles.systemChipLabel} x={CX} y={CY + 9} textAnchor="middle">AI</text>
          </g>
        </g>
      </svg>

      {/* detail panel — swaps as you explore the system */}
      <div className={styles.systemDetail} key={active} aria-live="polite">
        <span className={styles.systemDetailNum}>{tag}</span>
        <div className={styles.systemDetailBody}>
          <h3 className={styles.systemDetailTitle}>{current.label}</h3>
          <p className={styles.systemDetailDesc}>{current.desc}</p>
          <ul className={styles.systemChips}>
            {current.points.map((p) => (
              <li key={p} className={styles.systemChipItem}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
