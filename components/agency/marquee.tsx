const MARQUEE_ITEMS = [
  'EVERY CLAIM ATTACHED TO AN ARTIFACT',
  'NO INVENTED METRICS',
  'TESTED, NOT DESCRIBED',
  'EVALS OVER VIBES',
  'OBSERVABLE · REPEATABLE · RECOVERABLE',
] as const

function MarqueeGroup({ decorative = false }: { decorative?: boolean }) {
  return (
    <div className="ag-marquee-group" aria-hidden={decorative || undefined}>
      {MARQUEE_ITEMS.map((item) => (
        <span key={item} className="ag-marquee-item">
          <span>{item}</span>
          <span className="ag-marquee-diamond" aria-hidden="true">
            ◆
          </span>
        </span>
      ))}
    </div>
  )
}

/**
 * Seamless honesty-principles marquee. Sits at the hero's bottom border.
 * Track content is duplicated (second copy aria-hidden) for the loop.
 */
export function Marquee() {
  return (
    <aside className="ag-marquee" aria-label="Operating principles">
      <div className="ag-marquee-track">
        <MarqueeGroup />
        <MarqueeGroup decorative />
      </div>
    </aside>
  )
}
