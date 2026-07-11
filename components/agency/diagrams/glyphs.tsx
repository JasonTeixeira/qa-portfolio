import type { ReactNode } from 'react'

/**
 * AGENCY DIAGRAM GLYPH BANK — the schematic vocabulary of the system diagrams.
 *
 * One drawing system: every glyph lives on a 24×24 grid, stroke-only
 * (fill: none, stroke: currentColor, 1.6px, round caps/joins) so it reads as
 * engineering-draft linework and inherits its host node's accent color.
 * These are system-component symbols, not generic UI icons. Add new kinds with
 * the same grid + stroke discipline so the set stays one voice.
 */

export type GlyphKind =
  | 'webhook'
  | 'schedule'
  | 'model'
  | 'retrieval'
  | 'eval'
  | 'gate'
  | 'human'
  | 'queue'
  | 'log'
  | 'alert'
  | 'browser'
  | 'device'
  | 'pipeline'
  | 'report'
  | 'key'
  | 'repo'
  | 'terminal'
  | 'check'

const GLYPH_PATHS: Record<GlyphKind, ReactNode> = {
  // bolt — inbound trigger / event
  webhook: <path d="M13 3 5.5 13.5H11L9.5 21 18 10h-5.5z" />,
  // clock — cron / scheduled run
  schedule: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5v4.5l3.2 2" />
    </>
  ),
  // sparkle — LLM / model call
  model: (
    <>
      <path d="M12 3l2.2 6.2L20.5 12l-6.3 2.3L12 21l-2.2-6.7L3.5 12l6.3-2.8z" />
      <path d="M18.5 3.5v3M17 5h3" opacity="0.6" />
    </>
  ),
  // database cylinder — retrieval / store
  retrieval: (
    <>
      <path d="M5 6.5C5 5.1 8.1 4 12 4s7 1.1 7 2.5-3.1 2.5-7 2.5S5 7.9 5 6.5Z" />
      <path d="M5 6.5v11c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-11" />
      <path d="M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" />
    </>
  ),
  // gauge — scoring / eval harness
  eval: (
    <>
      <path d="M4 15a8 8 0 0 1 16 0" />
      <path d="M4 15h2M18 15h2M12 7v2" opacity="0.6" />
      <path d="M12 15l4-4.5" />
      <circle cx="12" cy="15" r="1.4" />
    </>
  ),
  // shield — gate / policy check
  gate: (
    <>
      <path d="M12 3l7 2.8v5.2c0 4.4-3 6.8-7 9-4-2.2-7-4.6-7-9V5.8z" />
      <path d="M9 11.8l2.2 2.2L15.5 9.5" />
    </>
  ),
  // person — human-in-the-loop
  human: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  // stacked segments — queue / fleet
  queue: (
    <>
      <rect x="3.5" y="7.5" width="17" height="9" rx="1" />
      <path d="M8 7.5v9M12.5 7.5v9M17 7.5v9" />
    </>
  ),
  // ruled document — structured log
  log: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="1.5" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
  // bell — alert / escalation
  alert: (
    <>
      <path d="M12 4a5 5 0 0 0-5 5c0 4.5-2 5.5-2 5.5h14s-2-1-2-5.5a5 5 0 0 0-5-5z" />
      <path d="M10.4 19a2 2 0 0 0 3.2 0" />
    </>
  ),
  // browser window — headless browser / web surface
  browser: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
      <path d="M3.5 9h17" />
      <path d="M6 6.8h.01M8.5 6.8h.01M11 6.8h.01" strokeWidth="1.9" />
    </>
  ),
  // phone — device / mobile E2E
  device: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2.5" />
      <path d="M10.5 18h3" />
    </>
  ),
  // flow chevrons — pipeline / orchestration
  pipeline: <path d="M4.5 8l4 4-4 4M10.5 8l4 4-4 4M16.5 8l4 4-4 4" />,
  // document with corner fold — report artifact
  report: (
    <>
      <path d="M6 3.5h8.5L19 8v12.5H6z" />
      <path d="M14.5 3.5V8H19" />
      <path d="M9 12h6M9 15.5h4" />
    </>
  ),
  // signing key — signature / credentials
  key: (
    <>
      <circle cx="8.5" cy="8.5" r="4" />
      <path d="M11.3 11.3 20 20M16.5 16.5l2.2-2.2M13.8 13.8l2 2" />
    </>
  ),
  // branch — repo / commit
  repo: (
    <>
      <circle cx="7" cy="6" r="2.2" />
      <circle cx="7" cy="18" r="2.2" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M7 8.2v7.6M17 11.2c0 3.2-3.5 3.6-7.5 4.3" />
    </>
  ),
  // prompt chevron + cursor — terminal
  terminal: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="1.5" />
      <path d="M6.5 9.5l3 2.8-3 2.8M12.5 15.5h5" />
    </>
  ),
  // check — verified pass
  check: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8 12.3l2.8 2.8L16.5 9" />
    </>
  ),
}

/**
 * A single schematic glyph. Inherits color from the surrounding SVG group via
 * currentColor; sized by the caller through width/height on the nested svg.
 */
export function DiagGlyph({
  kind,
  x,
  y,
  size = 24,
}: {
  kind: GlyphKind
  x: number
  y: number
  size?: number
}) {
  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      overflow="visible"
    >
      {GLYPH_PATHS[kind]}
    </svg>
  )
}
