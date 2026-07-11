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
 */

const TIER_BADGE_CLASS: Record<LedgerRow['tier'], string> = {
  T1: 'ag-badge--live',
  T2: 'ag-badge--local',
  T3: 'ag-badge--proto',
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
                <span className="ag-ledger-cell" data-th="ARTIFACT">
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
