import type { AcademyMetrics } from '@/lib/academy/metrics'
import { MIN_AGGREGATE_N, gainBand } from '@/lib/academy/efficacy-logic'
import styles from './metrics.module.css'

/**
 * Admin measurement surface: the evidence funnel, aggregate Hake's g, and CURR.
 * Restrained/institutional. Every number is honestly gated — below the aggregate
 * threshold the surface says "collecting", it never invents a figure.
 */

const STAGE_LABELS: Record<string, string> = {
  diagnostic_completed: 'Diagnostic',
  retrieval_attempted: 'Retrieval',
  sprint_artifact_created: 'Artifact',
  lab_verified: 'Lab verified',
  lesson_completed: 'Lesson',
  transfer_attempted: 'Transfer',
}

function pctLabel(fraction: number): string {
  return `${Math.round(fraction * 100)}%`
}

export function MetricsDashboard({ metrics }: { metrics: AcademyMetrics }) {
  const { funnel, funnelTotal, gain, curr } = metrics

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <p className={styles.kicker}>Measurement</p>
        <h1 className={styles.h1}>Efficacy &amp; evidence</h1>
        <p className={styles.sub}>
          Honest aggregate signals across the proof pipeline. Numbers stay hidden until the cohort is
          large enough to mean something — we publish proof, not vanity.
        </p>
      </header>

      <div className={styles.grid}>
        <Gain gain={gain} />
        <Curr curr={curr} />
      </div>

      <section className={styles.panel} aria-labelledby="funnel-heading">
        <div className={styles.panelHead}>
          <h2 id="funnel-heading" className={styles.h2}>
            Evidence funnel
          </h2>
          <span className={styles.meta}>{funnelTotal.toLocaleString()} events</span>
        </div>
        {funnelTotal === 0 ? (
          <p className={styles.collecting}>Collecting — no evidence events yet.</p>
        ) : (
          <ol className={styles.funnel}>
            {funnel.map((s) => (
              <li key={s.stage} className={styles.stage}>
                <div className={styles.stageHead}>
                  <span className={styles.stageName}>{STAGE_LABELS[s.stage] ?? s.stage}</span>
                  <span className={styles.stageCount}>{s.count.toLocaleString()}</span>
                </div>
                <div className={styles.track} role="img" aria-label={`${pctLabel(s.pct)} of entrants`}>
                  <div className={styles.bar} style={{ width: `${Math.round(s.pct * 100)}%` }} />
                </div>
                <span className={styles.stagePct}>{pctLabel(s.pct)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  )
}

function Gain({ gain }: { gain: AcademyMetrics['gain'] }) {
  const ready = gain.meanG !== null
  const band = ready ? gainBand(gain.meanG as number) : null
  return (
    <section className={styles.stat} aria-labelledby="gain-heading">
      <h2 id="gain-heading" className={styles.statLabel}>
        Aggregate normalized gain
      </h2>
      {ready ? (
        <>
          <p className={styles.statValue}>
            <span className={styles.statBig}>{(gain.meanG as number).toFixed(2)}</span>
            <span className={`${styles.statBand} ${styles[`band_${band}`]}`}>{band}</span>
          </p>
          <p className={styles.statFoot}>
            Hake&apos;s g across {gain.n} pre/post pairs
          </p>
        </>
      ) : (
        <Collecting n={gain.n} />
      )}
    </section>
  )
}

function Curr({ curr }: { curr: AcademyMetrics['curr'] }) {
  const ready = curr.rate !== null
  return (
    <section className={styles.stat} aria-labelledby="curr-heading">
      <h2 id="curr-heading" className={styles.statLabel}>
        Current-user retention
      </h2>
      {ready ? (
        <>
          <p className={styles.statValue}>
            <span className={styles.statBig}>{pctLabel(curr.rate as number)}</span>
          </p>
          <p className={styles.statFoot}>
            {curr.retainedN} of {curr.activeN} learners returned
          </p>
        </>
      ) : (
        <Collecting n={curr.activeN} />
      )}
    </section>
  )
}

function Collecting({ n }: { n: number }) {
  return (
    <p className={styles.collecting}>
      Collecting — n too small ({n}/{MIN_AGGREGATE_N})
    </p>
  )
}
