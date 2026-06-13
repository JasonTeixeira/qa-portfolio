/**
 * TelemetryFooter — a server-rendered mono strip displayed above the main
 * footer. Surfaces build provenance (git SHA + build timestamp) and a live
 * status dot. Reads env vars injected at build time by `next.config.ts`.
 *
 * This is intentionally a pure server component: no JS ships to the client.
 * The "live" dot uses Tailwind's `animate-pulse` (already respects
 * `prefers-reduced-motion` via global CSS overrides in app/globals.css).
 */
export function TelemetryFooter() {
  const sha = process.env.NEXT_PUBLIC_GIT_SHA ?? 'dev'
  const rawTime = process.env.NEXT_PUBLIC_BUILD_TIME
  const buildDate = (() => {
    if (!rawTime) return 'local'
    const d = new Date(rawTime)
    if (Number.isNaN(d.getTime())) return 'local'
    // YYYY-MM-DD · HH:MMZ — fixed format so SSR/CSR match.
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    const hh = String(d.getUTCHours()).padStart(2, '0')
    const mm = String(d.getUTCMinutes()).padStart(2, '0')
    return `${y}-${m}-${day} ${hh}:${mm}Z`
  })()

  return (
    <div
      className="border-t border-[#1F1E1C] bg-[#09090B]"
      role="region"
      aria-label="Build telemetry"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 text-[11px] leading-tight [font-family:var(--font-mono),ui-monospace,monospace] text-[#A8A29E]">
        <div className="flex items-center gap-2 min-w-0">
          <span
            aria-hidden="true"
            className="relative inline-flex h-1.5 w-1.5"
          >
            <span className="absolute inset-0 rounded-full bg-[#A8C633] opacity-75 animate-ping motion-reduce:hidden" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#A8C633]" />
          </span>
          <span className="text-[#A8C633]">live</span>
          <span className="text-[#2A2826]" aria-hidden="true">·</span>
          <span className="truncate">
            build <span className="text-[#B8B0AB]">{sha}</span>
          </span>
          <span className="text-[#2A2826]" aria-hidden="true">·</span>
          <span className="truncate">{buildDate}</span>
        </div>
        <div className="flex items-center gap-2 text-[#857F7B]">
          <span>{`// solo studio`}</span>
          <span className="text-[#2A2826]" aria-hidden="true">·</span>
          <span>{`// no analytics resold`}</span>
          <span className="text-[#2A2826]" aria-hidden="true">·</span>
          <span>{`// every commit human-reviewed`}</span>
        </div>
      </div>
    </div>
  )
}
