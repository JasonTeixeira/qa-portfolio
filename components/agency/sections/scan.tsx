import type { CSSProperties } from 'react'
import Link from 'next/link'

import { Reveal } from '@/components/agency/core'
import { SectionShell } from '@/components/agency/section-shell'
import { DiagGlyph, type GlyphKind } from '@/components/agency/diagrams/glyphs'

interface CapabilityTile {
  title: string
  glyph: GlyphKind
  accent: string
}

/* One tile per system I ship. Depth lives on /services + /capabilities. */
const CAPABILITY_TILES: readonly CapabilityTile[] = [
  { title: 'RELEASE GATES', glyph: 'gate', accent: 'var(--acc-primary)' },
  { title: 'E2E TEST FLEETS', glyph: 'browser', accent: 'var(--acc-browser)' },
  { title: 'AI EVALS & GUARDRAILS', glyph: 'eval', accent: 'var(--acc-ai)' },
  { title: 'OPS AUTOMATION', glyph: 'webhook', accent: 'var(--acc-pass)' },
  { title: 'AGENT / MCP SYSTEMS', glyph: 'terminal', accent: 'var(--acc-log)' },
  { title: 'DATA PIPELINES', glyph: 'pipeline', accent: 'var(--acc-primary-hi)' },
] as const

interface OpenSourceRepo {
  name: string
  proves: string
}

/** Exported so the sitemap footer renders the same repo list — single source of truth. */
export const OPEN_SOURCE_REPOS: readonly OpenSourceRepo[] = [
  { name: 'playwright-sdet-regression-suite', proves: 'Release-style QA evidence, SDET-grade' },
  { name: 'sage-kernel', proves: 'Proof-first engineering OS, 140 MCP tools' },
  { name: 'Nexural_Automation', proves: 'Local-first automation lab, MCP server' },
  { name: 'nexural-automation-starter', proves: 'Paper-money-safe webhook automation starter' },
] as const

/** Section 01 — the 30-second scan: six capability tiles, depth on /services. */
export function ScanSection() {
  return (
    <SectionShell
      id="scan"
      num="01"
      kicker="THE 30-SECOND SCAN"
      annotation="SIX SYSTEMS. PICK YOUR PROBLEM."
      ghost="01"
    >
      <Reveal>
        <div className="ag-grid ag-tile-wall">
          {CAPABILITY_TILES.map((tile) => (
            <article
              key={tile.title}
              className="ag-cell ag-cap-tile"
              style={{ '--tile-acc': tile.accent } as CSSProperties}
            >
              <span className="ag-cap-tile-glyph" aria-hidden="true">
                <DiagGlyph kind={tile.glyph} x={0} y={0} size={44} />
              </span>
              <h3 className="ag-cap-tile-title">{tile.title}</h3>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="ag-scan-below">
          <Link href="/services" className="ag-scan-more-link">
            Full toolbox + engagement model → /services
          </Link>
          <div className="ag-scan-quicklinks ag-scan-quicklinks--row">
            {/* TODO(assembly): point at the real resume PDF once it lands in /public */}
            <a href="/resume.pdf" target="_blank" rel="noopener">↓ RESUME.PDF</a>
            <a href="https://github.com/JasonTeixeira" target="_blank" rel="noopener noreferrer">
              ↗ GITHUB
            </a>
            <a href="mailto:sage@sageideas.dev">✉ EMAIL</a>
          </div>
        </div>
      </Reveal>

      <Reveal delay={180}>
        <div className="ag-repo-strip">
          <span className="ag-repo-strip-label">OPEN SOURCE</span>
          {OPEN_SOURCE_REPOS.map((repo) => (
            <a
              key={repo.name}
              href={`https://github.com/JasonTeixeira/${repo.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ag-chip ag-repo-chip"
            >
              {repo.name} →
            </a>
          ))}
        </div>
      </Reveal>
    </SectionShell>
  )
}
