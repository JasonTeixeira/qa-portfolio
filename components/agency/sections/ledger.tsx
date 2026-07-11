import type { ReactElement } from 'react'

import {
  LEDGER_CLOSING,
  LEDGER_ROWS,
  TIER_LEGEND,
  type LedgerRow,
} from '@/data/agency/ledger'
import { Reveal } from '@/components/agency/core'
import { SectionShell } from '@/components/agency/section-shell'

/**
 * Section 04 — Evidence ledger. Server component.
 * Claim → artifact, line by line. Rows live in data/agency/ledger.ts.
 * Instrument strip above the table is computed from LEDGER_ROWS; artifact
 * cells lead with a glyph picked by keyword (report/json→doc, repo/CI→branch,
 * output/log→terminal).
 */

const TIER_BADGE_CLASS: Record<LedgerRow['tier'], string> = {
  T1: 'ag-badge--live',
  T2: 'ag-badge--local',
  T3: 'ag-badge--proto',
}

type ArtifactGlyphId = 'doc' | 'branch' | 'terminal'

function artifactGlyphId(artifact: string): ArtifactGlyphId {
  const a = artifact.toLowerCase()
  if (/report|json|\.md\b|runbook|diagram/.test(a)) return 'doc'
  if (/repo|\bci\b|\.yml\b|git|deploy/.test(a)) return 'branch'
  if (/output|log|terminal|gate|run/.test(a)) return 'terminal'
  return 'doc'
}

const ARTIFACT_GLYPHS: Record<ArtifactGlyphId, ReactElement> = {
  doc: (
    <>
      <path d="M4 1.5h5.5L13 5v9.5H4z" />
      <path d="M9.5 1.5V5H13M6.5 8h4M6.5 11h3" />
    </>
  ),
  branch: (
    <>
      <circle cx="5" cy="3.5" r="1.8" />
      <circle cx="5" cy="12.5" r="1.8" />
      <circle cx="12" cy="5" r="1.8" />
      <path d="M5 5.3v5.4M12 6.8c0 3-3 3.6-5 4.2" />
    </>
  ),
  terminal: (
    <>
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
      <path d="M4.5 6.5l2.5 2-2.5 2M8.5 11h3" />
    </>
  ),
}

function ArtifactGlyph({ artifact }: { artifact: string }): ReactElement {
  return (
    <svg
      className="ag-ledger-glyph"
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ARTIFACT_GLYPHS[artifactGlyphId(artifact)]}
    </svg>
  )
}

interface TierCounts {
  T1: number
  T2: number
  T3: number
}

function countTiers(rows: readonly LedgerRow[]): TierCounts {
  return rows.reduce<TierCounts>(
    (acc, row) => ({ ...acc, [row.tier]: acc[row.tier] + 1 }),
    { T1: 0, T2: 0, T3: 0 },
  )
}

const TIER_ACCENTS: Record<LedgerRow['tier'], string> = {
  T1: 'var(--acc-pass)',
  T2: 'var(--acc-primary)',
  T3: 'var(--acc-fail)',
}

function InstrumentStrip(): ReactElement {
  const counts = countTiers(LEDGER_ROWS)
  const total = LEDGER_ROWS.length
  const tiers: Array<LedgerRow['tier']> = ['T1', 'T2', 'T3']
  return (
    <div className="ag-ledger-strip">
      <div className="ag-ledger-strip-cells">
        <div className="ag-ledger-strip-cell">
          <span className="ag-ledger-strip-num">{total}</span>
          <span className="ag-ledger-strip-label">TOTAL CLAIMS</span>
        </div>
        {tiers.map((tier) => (
          <div className="ag-ledger-strip-cell" key={tier}>
            <span className="ag-ledger-strip-num" style={{ color: TIER_ACCENTS[tier] }}>
              {counts[tier]}
            </span>
            <span className="ag-ledger-strip-label">{tier}</span>
          </div>
        ))}
      </div>
      <div
        className="ag-ledger-strip-bar"
        role="img"
        aria-label={`Tier mix: ${counts.T1} of ${total} T1, ${counts.T2} T2, ${counts.T3} T3`}
      >
        {tiers.map((tier) => (
          <span
            key={tier}
            className="ag-ledger-strip-seg"
            style={{ flexGrow: counts[tier], background: TIER_ACCENTS[tier] }}
          />
        ))}
      </div>
    </div>
  )
}

export function LedgerSection() {
  return (
    <SectionShell
      id="ledger"
      num="04"
      kicker="EVIDENCE LEDGER"
      annotation="CLAIM → ARTIFACT, LINE BY LINE"
      ghost="04"
    >
      <Reveal>
        <p className="ag-ledger-lede">{LEDGER_CLOSING}</p>
      </Reveal>

      <Reveal as="div">
        <InstrumentStrip />
      </Reveal>

      <Reveal as="div">
        <div className="ag-ledger">
          <div className="ag-ledger-head" aria-hidden="true">
            <span>CLAIM</span>
            <span>ARTIFACT</span>
            <span>TOOLING</span>
            <span>PROOF TYPE</span>
            <span className="ag-ledger-tiercell">TIER</span>
          </div>
          <ul className="ag-ledger-rows">
            {LEDGER_ROWS.map((row) => (
              <li key={row.claim} className="ag-ledger-row">
                <span className="ag-ledger-cell ag-ledger-claim" data-th="CLAIM">
                  {row.claim}
                </span>
                <span className="ag-ledger-cell ag-ledger-artifact" data-th="ARTIFACT">
                  <ArtifactGlyph artifact={row.artifact} />
                  {row.artifact}
                </span>
                <span className="ag-ledger-cell ag-ledger-mono" data-th="TOOLING">
                  {row.tooling}
                </span>
                <span className="ag-ledger-cell" data-th="PROOF TYPE">
                  {row.proofType}
                </span>
                <span className="ag-ledger-cell ag-ledger-tiercell" data-th="TIER">
                  <span className={`ag-badge ${TIER_BADGE_CLASS[row.tier]}`}>{row.tier}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal as="div">
        <ul className="ag-ledger-legend">
          {TIER_LEGEND.map((entry) => (
            <li key={entry.tier}>
              <span className={`ag-ledger-legend-tier ag-ledger-legend-tier--${entry.tier.toLowerCase()}`}>
                {entry.tier}
              </span>{' '}
              {entry.label}
            </li>
          ))}
        </ul>
      </Reveal>
    </SectionShell>
  )
}
