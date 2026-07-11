'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'

/* ---- shared shape with app/api/agency-audit/route.ts ---- */

interface AuditScores {
  performance: number | null
  accessibility: number | null
  bestPractices: number | null
  seo: number | null
}

interface AuditMetrics {
  lcp: string | null
  cls: string | null
  tbt: string | null
  fcp: string | null
}

interface AuditIssue {
  id: string
  title: string
  displayValue?: string
}

interface AuditResponse {
  scores: AuditScores
  metrics: AuditMetrics
  topIssues: AuditIssue[]
  finalUrl: string
}

type Phase = 'idle' | 'running' | 'done' | 'error'

const SCORE_TILES: ReadonlyArray<{ key: keyof AuditScores; label: string }> = [
  { key: 'performance', label: 'PERFORMANCE' },
  { key: 'accessibility', label: 'ACCESSIBILITY' },
  { key: 'bestPractices', label: 'BEST PRACTICES' },
  { key: 'seo', label: 'SEO' },
]

const METRIC_CHIPS: ReadonlyArray<{ key: keyof AuditMetrics; label: string }> = [
  { key: 'lcp', label: 'LCP' },
  { key: 'cls', label: 'CLS' },
  { key: 'tbt', label: 'TBT' },
  { key: 'fcp', label: 'FCP' },
]

function scoreColor(score: number | null): string {
  if (score === null) return 'var(--tx-3)'
  if (score >= 90) return 'var(--acc-pass)'
  if (score >= 50) return 'var(--acc-primary)'
  return 'var(--acc-fail)'
}

/** Mirror of the server-side check — fast feedback, server still decides. */
function clientValidate(raw: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(raw.trim())
  } catch {
    return null
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
  if (!parsed.hostname.includes('.')) return null
  return parsed.toString()
}

export function AuditTool() {
  const [url, setUrl] = useState<string>('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<AuditResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [elapsed, setElapsed] = useState<number>(0)
  const abortRef = useRef<AbortController | null>(null)

  // Elapsed ticker while running.
  useEffect(() => {
    if (phase !== 'running') return
    setElapsed(0)
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [phase])

  // Abort in-flight request on unmount.
  useEffect(() => () => abortRef.current?.abort(), [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (phase === 'running') return

    const target = clientValidate(url)
    if (target === null) {
      setPhase('error')
      setErrorMsg('That doesn’t parse as a public http(s) URL. Try something like https://example.com')
      return
    }

    setPhase('running')
    setResult(null)
    setErrorMsg('')

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch('/api/agency-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
        signal: controller.signal,
      })
      const data = (await response.json()) as AuditResponse & { error?: string }
      if (!response.ok) {
        setPhase('error')
        setErrorMsg(data.error ?? 'The scan failed. Try again in a minute.')
        return
      }
      setResult(data)
      setPhase('done')
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return
      setPhase('error')
      setErrorMsg('Network error — the scan never came back. Try again.')
    }
  }

  return (
    <div className="ag-audit-tool">
      <form className="ag-audit-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="audit-url" className="ag-kicker ag-audit-label">
          SITE URL
        </label>
        <div className="ag-audit-form-row">
          <input
            id="audit-url"
            name="url"
            type="url"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            className="ag-audit-input"
            placeholder="https://your-site.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button type="submit" className="ag-btn ag-btn--solid" disabled={phase === 'running'}>
            {phase === 'running' ? 'RUNNING…' : 'RUN TEARDOWN'}
          </button>
        </div>
      </form>

      {/* Status region — announced to screen readers as it changes. */}
      <div className="ag-audit-status" role="status" aria-live="polite">
        {phase === 'running' ? (
          <div className="ag-audit-terminal">
            <p className="ag-audit-line">→ queued</p>
            <p className="ag-audit-line">→ lighthouse running (~20s)</p>
            <p className="ag-audit-line ag-audit-line--tick">
              <span className="ag-audit-dot ag-pulse" aria-hidden="true" />
              elapsed {elapsed}s
            </p>
          </div>
        ) : null}
        {phase === 'error' ? <p className="ag-audit-error">✕ {errorMsg}</p> : null}
      </div>

      {phase === 'done' && result ? (
        <div className="ag-audit-results">
          <p className="ag-kicker ag-kicker--dim ag-audit-finalurl">
            SCANNED — {result.finalUrl} · MOBILE · LIGHTHOUSE VIA PAGESPEED INSIGHTS
          </p>

          <div className="ag-grid ag-audit-scores">
            {SCORE_TILES.map((tile) => {
              const score = result.scores[tile.key]
              return (
                <div key={tile.key} className="ag-cell ag-audit-score-cell">
                  <span
                    className="ag-audit-score-num"
                    style={{ color: scoreColor(score) }}
                  >
                    {score ?? '—'}
                  </span>
                  <span className="ag-audit-score-label">{tile.label}</span>
                </div>
              )
            })}
          </div>

          <div className="ag-audit-cwv">
            {METRIC_CHIPS.map((chip) => (
              <span key={chip.key} className="ag-chip">
                {chip.label} {result.metrics[chip.key] ?? 'n/a'}
              </span>
            ))}
          </div>

          {result.topIssues.length > 0 ? (
            <div className="ag-audit-findings">
              <h2 className="ag-kicker ag-audit-findings-label">WORST FINDINGS</h2>
              <ul className="ag-audit-findings-list">
                {result.topIssues.map((issue) => (
                  <li key={issue.id} className="ag-audit-finding">
                    <span className="ag-audit-finding-title">{issue.title}</span>
                    {issue.displayValue ? (
                      <span className="ag-audit-finding-value">{issue.displayValue}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="ag-audit-clean">No failing audits above the cut line — solid surface.</p>
          )}

          <p className="ag-audit-honesty">
            Automated surface scan — a real engagement goes far deeper (tests, evals, release
            gates).
          </p>

          <div className="ag-audit-ctas">
            <a
              href="https://sageideas.dev/book"
              target="_blank"
              rel="noopener noreferrer"
              className="ag-btn ag-btn--solid"
            >
              BOOK A CALL
            </a>
            <a href="/#case-studies" className="ag-btn">
              SEE HOW I FIX THESE →
            </a>
          </div>
        </div>
      ) : null}
    </div>
  )
}
