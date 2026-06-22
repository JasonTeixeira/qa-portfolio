import type { Metadata } from 'next'
import Link from 'next/link'
import { PrintButton } from './PrintButton'
import styles from './artifact.module.css'

const SITE = 'https://www.sageideas.dev'

export const metadata: Metadata = {
  title: 'Sample AI Reliability Audit (Redacted) — Sage Ideas',
  description:
    'A representative Sage Audit deliverable: scorecard, severity-ranked findings, risk register, and a prioritized remediation plan. Client identifiers redacted.',
  alternates: { canonical: `${SITE}/artifacts/sample-audit` },
  openGraph: {
    title: 'Sample AI Reliability Audit (Redacted)',
    description: 'See exactly what a Sage Audit produces — scorecard, findings, risk register, remediation plan.',
    url: `${SITE}/artifacts/sample-audit`,
    images: [`/og?title=${encodeURIComponent('Sample AI Reliability Audit')}&subtitle=${encodeURIComponent('What a Sage Audit delivers')}`],
  },
}

const SCORECARD = [
  ['Reliability & evals', 'C+', 'No regression suite on the RAG pipeline; quality measured by vibe.'],
  ['Security & secrets', 'B-', 'Keys in env, but one provider key reachable from the client bundle.'],
  ['Cost & latency', 'B', 'p95 latency 4.1s; ~40% spend on an oversized model for classify steps.'],
  ['Data & retrieval', 'C', 'Chunking is naive; retrieval precision unmeasured; no citations stored.'],
  ['Observability', 'D+', 'No tracing on LLM calls; failures are invisible until a user reports them.'],
  ['Architecture & scale', 'B+', 'Clean service boundaries; a single synchronous path will cap throughput.'],
]

const FINDINGS = [
  { sev: 'critical', title: 'Provider API key reachable in the client bundle', body: 'The model provider key is referenced through a NEXT_PUBLIC_* variable and ships in the browser bundle, allowing anyone to spend against the account. Rotate immediately and proxy all model calls server-side.' },
  { sev: 'critical', title: 'No evaluation harness — quality is unmeasured', body: 'There is no offline eval set or scoring. Every prompt or model change is a blind deploy. A 40-case golden set with automated scoring would catch regressions before users do.' },
  { sev: 'high', title: 'Retrieval precision is unknown and likely low', body: 'Fixed 1,000-char chunking splits tables and code mid-structure. No retrieval metric is captured. Estimated 1 in 3 answers cites the wrong passage. Recommend semantic chunking + a retrieval@k measurement.' },
  { sev: 'high', title: 'Oversized model on cheap steps', body: 'The flagship model runs classification and routing that a small model handles at equal accuracy — ~40% of spend and ~1.2s of p95 latency for no quality gain.' },
  { sev: 'medium', title: 'No tracing on LLM calls', body: 'Failures, timeouts, and bad outputs are invisible. A single tracing layer (inputs, outputs, latency, cost per call) turns "a user complained" into a dashboard.' },
  { sev: 'medium', title: 'Synchronous single-path inference caps throughput', body: 'All requests share one synchronous path with no queue or backpressure. Under load, p95 degrades non-linearly. A job queue with graceful shutdown decouples spikes.' },
]

const REMEDIATION = [
  ['Week 1', 'Rotate the exposed key; move all model calls server-side behind a proxy. Stand up basic tracing.'],
  ['Week 2', 'Build a 40-case golden eval set + automated scoring wired into CI. Establish the baseline.'],
  ['Week 3', 'Swap the small-model classify/route steps; re-run evals to prove no quality loss + capture the cost delta.'],
  ['Week 4', 'Semantic chunking + retrieval@k measurement + stored citations. Re-score against the golden set.'],
]

const sevColor: Record<string, string> = { critical: '#c0392b', high: '#d35400', medium: '#b7950b' }

export default function SampleAuditArtifact() {
  return (
    <div className={styles.sheet}>
      <div className={styles.toolbar}>
        <Link href="/services" className={styles.back}>← Services</Link>
        <PrintButton />
      </div>

      <article className={styles.doc}>
        <header className={styles.docHead}>
          <span className={styles.brand}>SAGE IDEAS · SAMPLE DELIVERABLE</span>
          <h1 className={styles.docTitle}>AI Reliability Audit</h1>
          <p className={styles.docSub}>
            A representative Sage Audit, with client identifiers redacted. This is the exact shape of what
            you receive: a scorecard, severity-ranked findings with evidence, a risk register, and a
            prioritized four-week remediation plan you could hand to any engineer.
          </p>
          <p className={styles.redact}>● Client name, repository, and figures redacted / illustrative.</p>
        </header>

        <section className={styles.block}>
          <h2 className={styles.h2}>1 · Scorecard</h2>
          <table className={styles.scoreTable}>
            <thead><tr><th>Dimension</th><th>Grade</th><th>One-line read</th></tr></thead>
            <tbody>
              {SCORECARD.map(([dim, grade, note]) => (
                <tr key={dim}>
                  <td className={styles.dim}>{dim}</td>
                  <td className={styles.grade}>{grade}</td>
                  <td className={styles.note}>{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.block}>
          <h2 className={styles.h2}>2 · Findings</h2>
          <ol className={styles.findings}>
            {FINDINGS.map((f) => (
              <li key={f.title} className={styles.finding}>
                <span className={styles.sev} style={{ color: sevColor[f.sev] }}>{f.sev}</span>
                <div>
                  <h3 className={styles.findTitle}>{f.title}</h3>
                  <p className={styles.findBody}>{f.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.block}>
          <h2 className={styles.h2}>3 · Remediation plan</h2>
          <table className={styles.scoreTable}>
            <tbody>
              {REMEDIATION.map(([when, what]) => (
                <tr key={when}><td className={styles.when}>{when}</td><td className={styles.note}>{what}</td></tr>
              ))}
            </tbody>
          </table>
          <p className={styles.close}>
            Every finding ships with the evidence behind it and a fix specific enough to act on this week —
            not a slide deck of generalities. That is the deliverable.
          </p>
        </section>

        <footer className={styles.docFoot}>
          <span>sageideas.dev · AI Reliability Audit</span>
          <Link href="/book" className={styles.cta}>Book your audit →</Link>
        </footer>
      </article>
    </div>
  )
}
