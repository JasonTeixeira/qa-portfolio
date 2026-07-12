'use client'

interface AgencyErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/** Agency-branded error boundary — same terminal language as the 404. Minimal by design. */
export default function AgencyError({ error, reset }: AgencyErrorProps) {
  return (
    <main id="main-content" tabIndex={-1} className="ag-404-main">
      <section className="ag-404-panel" aria-labelledby="ag-error-heading">
        <p className="ag-kicker">RUNTIME</p>
        <div className="ag-404-term">
          <p className="ag-404-line ag-404-fail">✗ FAIL unhandled exception</p>
          {error.digest ? <p className="ag-404-line ag-404-dim">digest: {error.digest}</p> : null}
        </div>
        <h1 id="ag-error-heading" className="ag-404-readiness">
          READINESS: <span className="ag-404-lost">DEGRADED</span>
        </h1>
        <div className="ag-404-ctas">
          <button type="button" onClick={reset} className="ag-btn ag-btn--solid">
            RETRY
          </button>
          <a href="mailto:sage@sageideas.dev" className="ag-btn">
            REPORT IT
          </a>
        </div>
      </section>
    </main>
  )
}
