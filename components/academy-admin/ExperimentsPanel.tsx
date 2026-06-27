import type { ExperimentMetric, ExperimentReadout } from '@/lib/academy/experiments'
import type { ExperimentStatus } from '@/lib/academy/experiments-logic'
import styles from './experiments.module.css'

/**
 * STAGE 3 — admin experiment panel (presentational). Renders the honest verdict
 * for every behavioral-proof experiment from listExperimentReadouts().
 *
 * Honesty by design:
 *  - 'insufficient_data' (today's case for every experiment) renders in the
 *    PENDING amber with a prominent "why" notice and per-arm progress toward the
 *    minN gate — never the mastery green, so the operator can never mistake
 *    "no traffic yet" for "no effect" or a passing grade.
 *  - lift / z / p-value are MASKED ("held") until the verdict is earned (both
 *    arms clear minN). Showing a z on a thin sample would imply a result the
 *    data cannot support, so we refuse to render one as a number.
 *  - Status is conveyed three ways (glyph + word + color) for AA / colorblind
 *    legibility. Pure presentation: no data access, no mutation.
 */

interface StatusMeta {
  /** Text glyph — status legibility independent of color. */
  glyph: string
  /** Human label. */
  label: string
  /** Are the lift / z / p figures earned (safe to publish as numbers)? */
  resolved: boolean
}

const STATUS_META: Record<ExperimentStatus, StatusMeta> = {
  insufficient_data: { glyph: '◷', label: 'Collecting', resolved: false },
  no_significant_effect: { glyph: '=', label: 'No effect', resolved: true },
  treatment_wins: { glyph: '▲', label: 'Treatment wins', resolved: true },
  holdout_wins: { glyph: '▼', label: 'Holdout wins', resolved: true },
}

const METRIC_LABELS: Record<ExperimentMetric, string> = {
  d1_return: 'D1 return',
  d7_return: 'D7 return',
  d30_return: 'D30 return',
  activation: 'Activation',
}

function pct(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`
}

function signedPct(fraction: number): string {
  const sign = fraction > 0 ? '+' : ''
  return `${sign}${(fraction * 100).toFixed(1)}pp`
}

export function ExperimentsPanel({ readouts }: { readouts: ExperimentReadout[] }) {
  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <p className={styles.kicker}>Stage 3 — behavioral proof</p>
        <h1 className={styles.h1}>Engagement experiments</h1>
        <p className={styles.sub}>
          Each behavior-gated category runs as a deterministic treatment vs holdout split, measured
          from the live event spine. A verdict is published only once both arms clear the minimum
          sample — until then the readout reads as honestly pending, never as a pass.
        </p>
        <ul className={styles.legend} aria-label="Status key">
          <li className={`${styles.legendItem} ${styles.status_treatment_wins}`}>
            <span aria-hidden="true">{STATUS_META.treatment_wins.glyph}</span> Treatment wins (earned, p&nbsp;&lt;&nbsp;0.05)
          </li>
          <li className={`${styles.legendItem} ${styles.status_holdout_wins}`}>
            <span aria-hidden="true">{STATUS_META.holdout_wins.glyph}</span> Holdout wins
          </li>
          <li className={`${styles.legendItem} ${styles.status_no_significant_effect}`}>
            <span aria-hidden="true">{STATUS_META.no_significant_effect.glyph}</span> No significant effect
          </li>
          <li className={`${styles.legendItem} ${styles.status_insufficient_data}`}>
            <span aria-hidden="true">{STATUS_META.insufficient_data.glyph}</span> Collecting (insufficient data)
          </li>
        </ul>
      </header>

      {readouts.length === 0 ? (
        <p className={styles.empty}>No experiments declared.</p>
      ) : (
        <ul className={styles.list}>
          {readouts.map((r) => (
            <li key={r.key}>
              <ExperimentCard readout={r} />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

function ExperimentCard({ readout }: { readout: ExperimentReadout }) {
  const meta = STATUS_META[readout.status]
  const labelId = `exp-${readout.key}-label`

  return (
    <article className={styles.card} aria-labelledby={labelId}>
      <div className={styles.cardHead}>
        <div className={styles.cardTitleWrap}>
          <h2 id={labelId} className={styles.cardLabel}>
            {readout.label}
          </h2>
          <p className={styles.cardMetaRow}>
            <span className={styles.tag}>Category #{readout.category}</span>
            <span className={styles.tag}>Metric: {METRIC_LABELS[readout.metric]}</span>
          </p>
        </div>
        <span
          className={`${styles.badge} ${styles[`status_${readout.status}`]}`}
          role="status"
        >
          <span className={styles.badgeGlyph} aria-hidden="true">
            {meta.glyph}
          </span>
          {meta.label}
        </span>
      </div>

      <p className={styles.hypothesis}>
        <span className={styles.hypothesisLabel}>Hypothesis</span>
        {readout.hypothesis}
      </p>

      {readout.status === 'insufficient_data' ? (
        <PendingNotice readout={readout} />
      ) : null}

      <GateProgress readout={readout} />

      <VerdictTable readout={readout} resolved={meta.resolved} />
    </article>
  )
}

/**
 * The honest "why this isn't a result yet" notice. States the gate rule and the
 * actual N collected per arm so the operator reads pending, not pass/fail.
 */
function PendingNotice({ readout }: { readout: ExperimentReadout }) {
  return (
    <div className={styles.pendingNote}>
      <span className={styles.pendingNoteGlyph} aria-hidden="true">
        ◷
      </span>
      <p className={styles.pendingNoteText}>
        <strong>Insufficient data — no verdict yet.</strong> A verdict needs at least{' '}
        {readout.minN} users per arm with the {METRIC_LABELS[readout.metric]} window elapsed. So far:{' '}
        {readout.treatmentN} treatment / {readout.holdoutN} holdout. This means{' '}
        <em>not enough traffic to test</em> — not &ldquo;no effect&rdquo; and not a pass. Lift, z, and
        p-value are withheld until the sample is large enough to support a claim.
      </p>
    </div>
  )
}

/** Per-arm progress toward the minN gate, with met/unmet state. */
function GateProgress({ readout }: { readout: ExperimentReadout }) {
  return (
    <div className={styles.gateRow} aria-label="Sample collected per arm">
      <GateArm name="Treatment" n={readout.treatmentN} minN={readout.minN} />
      <GateArm name="Holdout" n={readout.holdoutN} minN={readout.minN} />
    </div>
  )
}

function GateArm({ name, n, minN }: { name: string; n: number; minN: number }) {
  const met = n >= minN
  const fraction = minN > 0 ? Math.min(1, n / minN) : 1
  return (
    <div className={styles.gateArm}>
      <span className={styles.gateArmName}>{name}</span>
      <div
        className={styles.gateTrack}
        role="img"
        aria-label={`${name}: ${n} of ${minN} required${met ? ' — gate met' : ''}`}
      >
        <div className={styles.gateBar} data-met={met} style={{ width: `${fraction * 100}%` }} />
      </div>
      <span className={styles.gateArmCount} data-met={met}>
        {n} / {minN}
      </span>
    </div>
  )
}

/**
 * Verdict statistics. When the verdict is not resolved (insufficient_data), the
 * lift / z / p cells render "held" rather than a misleading number — the rates
 * and raw counts still show, because those are observed facts, not inferences.
 */
function VerdictTable({ readout, resolved }: { readout: ExperimentReadout; resolved: boolean }) {
  return (
    <table className={styles.stats}>
      <caption>Verdict statistics</caption>
      <thead>
        <tr>
          <th scope="col">Arm</th>
          <th scope="col">n</th>
          <th scope="col">Converted</th>
          <th scope="col">Rate</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Treatment</th>
          <td>{readout.treatmentN}</td>
          <td>{readout.treatmentConv}</td>
          <td>{pct(readout.treatmentRate)}</td>
        </tr>
        <tr>
          <th scope="row">Holdout</th>
          <td>{readout.holdoutN}</td>
          <td>{readout.holdoutConv}</td>
          <td>{pct(readout.holdoutRate)}</td>
        </tr>
        <tr>
          <th scope="row">Lift (T − H)</th>
          <td className={styles.muted} colSpan={2}>
            two-proportion z-test
          </td>
          <td>{resolved ? signedPct(readout.lift) : <span className={styles.held}>held</span>}</td>
        </tr>
        <tr>
          <th scope="row">z</th>
          <td colSpan={2} className={styles.muted}>
            |z|&nbsp;&gt;&nbsp;1.96 ⇒ p&nbsp;&lt;&nbsp;0.05
          </td>
          <td>{resolved ? readout.z.toFixed(2) : <span className={styles.held}>held</span>}</td>
        </tr>
        <tr>
          <th scope="row">p-value</th>
          <td colSpan={2} className={styles.muted}>
            two-sided
          </td>
          <td>
            {resolved ? readout.pValue.toFixed(4) : <span className={styles.held}>held</span>}
          </td>
        </tr>
      </tbody>
    </table>
  )
}
