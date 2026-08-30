import type { CSSProperties } from 'react'

type SageMarkProps = {
  /** Tile edge length in px (square). */
  size?: number
  /** Tile corner radius; defaults to ~30% of size. */
  radius?: number
  /** Blue outer glow; on by default. */
  glow?: boolean
  /** Accessible label; the mark is decorative when embedded next to the wordmark. */
  title?: string
  /** Merged onto the tile — use for animation or a bespoke shadow. */
  style?: CSSProperties
}

/**
 * Sage Academy brand mark — "Cloud Native": a cloud emitting three deploy
 * nodes, set on the brand-blue tile. Replaces the legacy ◆ diamond glyph
 * across every brand surface (nav, footer, splash, auth panel, chat header,
 * pricing). The three nodes read as "deploy / ship" — the academy's whole
 * premise. Kept white-on-blue so it survives favicon sizes and monochrome.
 *
 * For next/og ImageResponse surfaces (favicon, apple-icon, OG cards) inline
 * the same SVG directly — Satori does not render this grid span reliably.
 */
export function SageMark({ size = 26, radius, glow = true, title, style }: SageMarkProps) {
  const tileRadius = radius ?? Math.max(6, Math.round(size * 0.3))
  const inner = Math.round(size * 0.68)
  const stroke = size <= 30 ? 4.5 : 4

  return (
    <span
      role="img"
      aria-label={title ?? 'Sage Academy'}
      style={{
        display: 'inline-grid',
        placeItems: 'center',
        width: size,
        height: size,
        borderRadius: tileRadius,
        background: '#3D5AFE',
        boxShadow: glow ? `0 0 ${Math.round(size * 0.7)}px rgba(61,90,254,0.4)` : undefined,
        flexShrink: 0,
        ...style,
      }}
    >
      <svg width={inner} height={inner} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <g transform="translate(0 -6)">
          <path
            d="M20 44 A10 10 0 0 1 20 24 A13 13 0 0 1 45 21 A9 9 0 0 1 48 44 Z"
            fill="none"
            stroke="#fff"
            strokeWidth={stroke}
            strokeLinejoin="round"
          />
          <circle cx="26" cy="54" r="3.4" fill="#fff" />
          <circle cx="36" cy="54" r="3.4" fill="#fff" opacity="0.85" />
          <circle cx="46" cy="54" r="3.4" fill="#fff" opacity="0.7" />
        </g>
      </svg>
    </span>
  )
}
