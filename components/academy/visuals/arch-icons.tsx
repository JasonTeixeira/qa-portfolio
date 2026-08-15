/**
 * SAGE ARCHITECTURE ICONS — the proprietary schematic glyph BANK.
 *
 * One drawing system: every glyph lives on a 24×24 grid, stroke-only
 * (fill:none, stroke:currentColor, 1.5px, round caps/joins) so it reads as
 * engineering-draft linework and inherits its host node's tone via currentColor.
 * These are NOT generic UI icons — they are the component vocabulary of a system
 * architecture, drawn as schematic symbols. The bank spans compute, data, edge,
 * identity, external/AI, and observability so any diagram we build can name every
 * component in one coherent language. Add kinds with the SAME grid + stroke
 * discipline so the set stays one voice.
 */
import * as React from 'react'

export type ArchIconKind =
  // compute
  | 'service' | 'function' | 'worker' | 'process' | 'container' | 'scheduler'
  // data
  | 'store' | 'cache' | 'objectstore' | 'index' | 'vector' | 'queue' | 'stream' | 'dlq' | 'eventbus'
  // edge / client
  | 'client' | 'mobile' | 'gateway' | 'loadbalancer' | 'cdn' | 'proxy'
  // identity / security
  | 'user' | 'auth' | 'token' | 'role' | 'secret' | 'firewall'
  // external / ai
  | 'external' | 'llm' | 'webhook' | 'payment' | 'email' | 'notification'
  // control / observability
  | 'decision' | 'log' | 'monitor' | 'metric' | 'trace' | 'alert' | 'config'

/** Schematic path geometry per kind (24×24 grid, stroke-only unless noted). */
const ARCH_ICON: Record<ArchIconKind, React.ReactNode> = {
  // ── COMPUTE ──────────────────────────────────────────────────────────────
  service: (<><path d="M12 3 20 7.5V16.5L12 21 4 16.5V7.5Z" /><circle cx="12" cy="12" r="3" /></>),
  function: (<><path d="M6.5 20 13 4M12.5 12.5 17.5 20" /><path d="M8.5 12h6" opacity="0.55" /></>),
  worker: (
    <>
      <circle cx="12" cy="12" r="4.4" /><circle cx="12" cy="12" r="1.5" />
      <path d="M12 3v2.6M12 18.4V21M3 12h2.6M18.4 12H21M5.6 5.6l1.9 1.9M16.5 16.5l1.9 1.9M18.4 5.6l-1.9 1.9M7.5 16.5l-1.9 1.9" />
    </>
  ),
  process: (<><rect x="4" y="5" width="16" height="14" rx="1.5" /><path d="M10 9l5 3-5 3z" /></>),
  container: (<><rect x="4" y="7" width="16" height="12" rx="1.5" /><path d="M4 11h16M9 7v4M14 7v4" /></>),
  scheduler: (<><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3.5 2" /></>),

  // ── DATA ─────────────────────────────────────────────────────────────────
  store: (
    <>
      <path d="M5 6.5C5 5.1 8.1 4 12 4s7 1.1 7 2.5-3.1 2.5-7 2.5S5 7.9 5 6.5Z" />
      <path d="M5 6.5v11c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-11" />
      <path d="M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" />
    </>
  ),
  cache: (<><rect x="4" y="5" width="16" height="14" rx="1.5" /><path d="M13 8l-3.5 5H12l-1.5 4 3.5-5H11.5z" /></>),
  objectstore: (<><ellipse cx="12" cy="7" rx="7" ry="2.2" /><path d="M5 7l1.5 11a1 1 0 0 0 1 .9h9a1 1 0 0 0 1-.9L19 7" /></>),
  index: (<><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5 5" /></>),
  vector: (
    <>
      <rect x="4.5" y="4.5" width="15" height="15" rx="1.5" />
      <circle cx="9" cy="9" r="0.9" fill="currentColor" /><circle cx="15" cy="9" r="0.9" fill="currentColor" />
      <circle cx="9" cy="15" r="0.9" fill="currentColor" /><circle cx="15" cy="15" r="0.9" fill="currentColor" />
      <path d="M9 9 15 15M15 9 9 15" opacity="0.4" />
    </>
  ),
  queue: (<><rect x="3.5" y="7.5" width="17" height="9" rx="1" /><path d="M8 7.5v9M12 7.5v9M16 7.5v9" /></>),
  // refined: three chevrons = ordered records flowing forward.
  stream: (<path d="M5 8l4 4-4 4M11 8l4 4-4 4M17 8l4 4-4 4" />),
  // dead-letter queue: a FIFO frame with the reject/out mark.
  dlq: (<><rect x="3" y="8.5" width="12.5" height="8.5" rx="1" /><path d="M7 8.5v8.5M11.5 8.5v8.5" /><path d="M16 5l5 5M21 5l-5 5" /></>),
  eventbus: (
    <>
      <path d="M3 15.5h18" />
      <path d="M7 15.5V9M12 15.5V9M17 15.5V9" />
      <circle cx="7" cy="8" r="1.4" /><circle cx="12" cy="8" r="1.4" /><circle cx="17" cy="8" r="1.4" />
    </>
  ),

  // ── EDGE / CLIENT ────────────────────────────────────────────────────────
  client: (<><rect x="3.5" y="4.5" width="17" height="11" rx="1.5" /><path d="M9 20h6M12 15.5V20" /></>),
  mobile: (<><rect x="7" y="3" width="10" height="18" rx="2.5" /><path d="M10.5 18h3" /></>),
  gateway: (<><path d="M8.5 5H4.5v14h4M15.5 5h4v14h-4" /><circle cx="12" cy="12" r="1.4" /></>),
  loadbalancer: (
    <>
      <path d="M3 12h5M9 12l9-6M9 12h9M9 12l9 6" />
      <circle cx="8.5" cy="12" r="1.2" /><circle cx="18.5" cy="6" r="1.2" /><circle cx="18.5" cy="12" r="1.2" /><circle cx="18.5" cy="18" r="1.2" />
    </>
  ),
  cdn: (<><circle cx="12" cy="12" r="8" /><path d="M4 12h16" /><ellipse cx="12" cy="12" rx="3.4" ry="8" /></>),
  proxy: (<><path d="M4 9h9l-2.5-2.5M13 9l-2.5 2.5" /><path d="M20 15h-9l2.5-2.5M11 15l2.5 2.5" /></>),

  // ── IDENTITY / SECURITY ──────────────────────────────────────────────────
  user: (<><circle cx="12" cy="8" r="3.6" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>),
  auth: (<><circle cx="8" cy="8" r="3.5" /><path d="M10.5 10.5 19 19M16 16l2-2M18.5 13.5l1.5 1.5" /></>),
  // refined: a segmented credential (header.payload.signature).
  token: (<><rect x="3" y="8" width="18" height="8" rx="2" /><path d="M9 8v8M15 8v8" strokeDasharray="2 2" /></>),
  role: (<><path d="M12 3l7 2.5v5c0 4-3 6-7 8-4-2-7-4-7-8v-5z" /><circle cx="12" cy="10" r="1.9" /><path d="M8.7 15.6a3.4 2.8 0 0 1 6.6 0" /></>),
  secret: (<><rect x="5" y="10" width="14" height="9.5" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><circle cx="12" cy="14.5" r="1.2" /></>),
  firewall: (<><path d="M12 3l7 3v5c0 5-3.2 7.5-7 9.5-3.8-2-7-4.5-7-9.5V6z" /><path d="M5 10.5h14" /></>),

  // ── EXTERNAL / AI ────────────────────────────────────────────────────────
  external: (<><rect x="4" y="4" width="13" height="13" rx="1.5" strokeDasharray="3 2.5" /><path d="M14 10l6-6M16 4h4v4" /></>),
  llm: (
    <>
      <path d="M6 8l6-3 6 3M6 8v8l6 3 6-3V8M6 8l6 3 6-3M12 11v8" opacity="0.5" />
      <circle cx="6" cy="8" r="1.6" /><circle cx="18" cy="8" r="1.6" /><circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="11" r="1.6" /><circle cx="6" cy="16" r="1.6" /><circle cx="18" cy="16" r="1.6" />
    </>
  ),
  webhook: (<><circle cx="9" cy="7" r="3" /><path d="M10.5 9.6 7 16a3 3 0 1 0 2.6 1.5M12 17h4a3 3 0 1 0-3-3" /></>),
  payment: (<><rect x="3.5" y="6" width="17" height="12" rx="2" /><path d="M3.5 10h17M7 14h4" /></>),
  email: (<><rect x="3.5" y="6" width="17" height="12" rx="2" /><path d="M4.5 8l7.5 5 7.5-5" /></>),
  notification: (<><path d="M12 4a5 5 0 0 0-5 5c0 4.5-2 5.5-2 5.5h14s-2-1-2-5.5a5 5 0 0 0-5-5z" /><path d="M10.4 19a2 2 0 0 0 3.2 0" /></>),

  // ── CONTROL / OBSERVABILITY ──────────────────────────────────────────────
  decision: <path d="M12 3 21 12 12 21 3 12Z" />,
  log: (<><rect x="5" y="4" width="14" height="16" rx="1.5" /><path d="M8 8h8M8 12h8M8 16h5" /></>),
  // refined: a live pulse/heartbeat trace.
  monitor: (<path d="M3 12h4l2-5 3.5 11 2.5-6H21" />),
  metric: (<><path d="M4 20h16" /><path d="M7 20v-6M12 20V8M17 20v-9" /></>),
  trace: (
    <>
      <path d="M3 12h18" />
      <circle cx="6" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="18" cy="12" r="1.4" />
      <path d="M6 12V8.5h4M12 12v3.5h4" opacity="0.5" />
    </>
  ),
  alert: (<><path d="M12 4 21 19H3z" /><path d="M12 10v4M12 17h.01" /></>),
  config: (<><path d="M4 8h9M17 8h3M4 16h3M11 16h9" /><circle cx="15" cy="8" r="2.1" /><circle cx="9" cy="16" r="2.1" /></>),
}

export function ArchIcon({
  kind,
  size = 24,
  className,
  strokeWidth = 1.5,
}: {
  kind: ArchIconKind
  size?: number
  className?: string
  strokeWidth?: number
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {ARCH_ICON[kind]}
    </svg>
  )
}

export const ARCH_ICON_KINDS = Object.keys(ARCH_ICON) as ArchIconKind[]

/** Grouped for the design-system gallery (label + members). */
export const ARCH_ICON_GROUPS: { group: string; kinds: ArchIconKind[] }[] = [
  { group: 'Compute', kinds: ['service', 'function', 'worker', 'process', 'container', 'scheduler'] },
  { group: 'Data', kinds: ['store', 'cache', 'objectstore', 'index', 'vector', 'queue', 'stream', 'dlq', 'eventbus'] },
  { group: 'Edge / Client', kinds: ['client', 'mobile', 'gateway', 'loadbalancer', 'cdn', 'proxy'] },
  { group: 'Identity / Security', kinds: ['user', 'auth', 'token', 'role', 'secret', 'firewall'] },
  { group: 'External / AI', kinds: ['external', 'llm', 'webhook', 'payment', 'email', 'notification'] },
  { group: 'Control / Observability', kinds: ['decision', 'log', 'monitor', 'metric', 'trace', 'alert', 'config'] },
]
