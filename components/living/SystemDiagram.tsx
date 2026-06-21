'use client'

import { useState } from 'react'
import styles from './LivingSystemsHome.module.css'

const NODES = [
  { x: 60, label: 'Strategy', desc: 'Find the highest-leverage move — the product, market, and offer that actually compounds.' },
  { x: 220, label: 'Product', desc: 'Full-stack product: schema to interface, auth to billing, shipped to production.' },
  { x: 380, label: 'AI Systems', desc: 'Agents, retrieval, copilots, and automation — AI wired into the real workflow, not bolted on.' },
  { x: 540, label: 'Brand', desc: 'Identity, narrative, and a site that makes the product legible and premium.' },
  { x: 700, label: 'Growth', desc: 'Technical SEO, content systems, and compounding distribution loops.' },
  { x: 860, label: 'Operate', desc: 'Measure, improve, and publish — the machine keeps compounding after launch.' },
] as const

/** Interactive build-pipeline: hover a node to reveal what the studio builds there. */
export function SystemDiagram() {
  const [active, setActive] = useState(0)
  const n = NODES[active]

  return (
    <div className={styles.systemDiagram} data-living-reveal aria-label="What the studio builds — one connected system">
      <span className={styles.systemKicker}>One operator · one connected system · hover to explore</span>
      <svg
        className={styles.systemSvg}
        viewBox="0 0 920 124"
        role="img"
        aria-label="Strategy to Product to AI Systems to Brand to Growth to Operate"
      >
        <defs>
          <linearGradient id="system-flow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3D5AFE" />
            <stop offset="1" stopColor="#BCD2FF" />
          </linearGradient>
        </defs>
        <path className={styles.systemTrack} d="M60 56 H860" />
        <path className={styles.systemFlow} d="M60 56 H860" stroke="url(#system-flow)" />
        {NODES.map((node, i) => (
          <g
            key={node.label}
            className={`${styles.systemNode} ${active === i ? styles.systemNodeOn : ''}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            tabIndex={0}
          >
            <circle cx={node.x} cy={56} r={active === i ? 9 : 6.5} />
            <text x={node.x} y={92} textAnchor="middle">
              {node.label}
            </text>
          </g>
        ))}
      </svg>
      <div className={styles.systemDetail} key={active}>
        <span className={styles.systemDetailNum}>{String(active + 1).padStart(2, '0')} / 06</span>
        <div className={styles.systemDetailBody}>
          <h3 className={styles.systemDetailTitle}>{n.label}</h3>
          <p className={styles.systemDetailDesc}>{n.desc}</p>
        </div>
      </div>
    </div>
  )
}
