import type { ReactNode } from 'react'

/**
 * Shared section scaffold: numbered mono kicker, right-aligned mono annotation,
 * giant outlined ghost numeral. Server component.
 */
export function SectionShell({
  id,
  num,
  kicker,
  annotation,
  ghost,
  children,
  deep = false,
}: {
  id: string
  num: string
  kicker: string
  annotation?: string
  ghost?: string
  children: ReactNode
  deep?: boolean
}) {
  return (
    <section
      id={id}
      className="ag-section"
      style={deep ? { background: 'var(--ag-bg-deep)' } : undefined}
      aria-label={kicker}
    >
      {ghost ? (
        <span className="ag-ghost-num" aria-hidden="true" data-drift>
          {ghost}
        </span>
      ) : null}
      {/* Keeps heading order valid (h1 → h2 → h3): the visible kicker is a <p>. */}
      <h2 className="ag-vh">{kicker}</h2>
      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 12,
          marginBottom: 'clamp(28px, 4vw, 56px)',
        }}
      >
        <p className="ag-kicker">
          {num} — {kicker}
        </p>
        {annotation ? <p className="ag-kicker ag-kicker--dim">{annotation}</p> : null}
      </header>
      {children}
    </section>
  )
}
