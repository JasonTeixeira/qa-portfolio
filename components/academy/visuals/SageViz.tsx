'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * SageViz — a zero-dependency, custom-SVG institutional chart.
 *
 * Copied-in (self-contained) from the Sage Design OS `chart` block. The source
 * is custom SVG (not recharts), so the adaptation re-points every hardcoded
 * color to the academy `--ac-*` tokens and reshapes the API to the academy's
 * `viz` LessonBlock contract — a single series of `{ label, value }` rendered as
 * bars / line / area, with an optional unit.
 *
 * Honest data-viz standard: real value axis with ticks + units, real category
 * axis, tabular-nums readouts, NO chartjunk (no 3D, no gratuitous gridlines, no
 * decorative gradients on the data). Motion is compositor-only (bars scale up on
 * their baseline; line/area fade in). prefers-reduced-motion → final state
 * instantly. a11y: <figure>/<svg role="img"> with title + description; the
 * <figcaption> states the latest value as a text fallback.
 */

export type SageVizChartKind = 'bars' | 'line' | 'area'

export type SageVizPoint = {
  label: string
  value: number
}

export type SageVizProps = {
  title: string
  subtitle?: string
  chart: SageVizChartKind
  data: SageVizPoint[]
  unit?: string
  className?: string
  height?: number
}

const VIEW = { width: 1080, height: 520, left: 84, right: 36, top: 44, bottom: 76 }
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

export function SageViz({
  title,
  subtitle,
  chart,
  data,
  unit,
  className,
  height = 460,
}: SageVizProps) {
  const reduce = useReducedMotion()
  const titleId = React.useId()
  const descId = React.useId()
  const clipId = `viz-clip-${React.useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  const points = data.filter((p) => Number.isFinite(p.value))
  const labels = points.map((p) => p.label)
  const values = points.map((p) => p.value)
  const minValue = Math.min(0, ...values)
  const maxValue = Math.max(1, ...values)
  const ticks = buildTicks(minValue, maxValue)

  const plotWidth = VIEW.width - VIEW.left - VIEW.right
  const plotHeight = VIEW.height - VIEW.top - VIEW.bottom
  const xFor = (label: string) => {
    const index = Math.max(0, labels.indexOf(label))
    return (
      VIEW.left +
      (labels.length <= 1
        ? plotWidth / 2
        : (index / (labels.length - 1)) * plotWidth)
    )
  }
  const yFor = (value: number) =>
    VIEW.top +
    plotHeight -
    ((value - minValue) / Math.max(1, maxValue - minValue)) * plotHeight
  const barSlot = labels.length ? plotWidth / labels.length : plotWidth
  const barWidth = Math.max(16, Math.min(64, barSlot * 0.5))

  const fmt = (value: number) => formatValue(value, unit)
  const latest = points.length ? points[points.length - 1] : null

  return (
    <figure
      className={className}
      style={shellStyle}
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div style={headerStyle}>
        <p style={kickerStyle}>Data</p>
        <h2 id={titleId} style={titleStyle}>
          {title}
        </h2>
        {subtitle ? (
          <p id={descId} style={subtitleStyle}>
            {subtitle}
          </p>
        ) : (
          <p id={descId} style={srOnlyStyle}>
            {chart} chart of {points.length} data points.
          </p>
        )}
      </div>
      <svg
        role="img"
        aria-labelledby={titleId}
        aria-describedby={descId}
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        width="100%"
        height={height}
        style={svgStyle}
      >
        <defs>
          <clipPath id={clipId}>
            <rect
              x={VIEW.left}
              y={VIEW.top - 12}
              width={plotWidth}
              height={plotHeight + 24}
            />
          </clipPath>
        </defs>
        <rect
          x="0"
          y="0"
          width={VIEW.width}
          height={VIEW.height}
          rx="20"
          fill="var(--ac-bg)"
          stroke="var(--ac-rule)"
        />

        {/* Value axis: ticks + hairline gridlines + unit-formatted labels. */}
        {ticks.map((tick) => {
          const y = yFor(tick)
          return (
            <g key={tick}>
              <line
                x1={VIEW.left}
                x2={VIEW.width - VIEW.right}
                y1={y}
                y2={y}
                stroke="var(--ac-rule)"
                strokeOpacity={tick === 0 ? 1 : 0.5}
              />
              <text
                x={VIEW.left - 16}
                y={y + 4}
                fill="var(--ac-ink-faint)"
                fontSize="12"
                fontFamily="var(--ac-font-mono, ui-monospace, monospace)"
                style={{ fontVariantNumeric: 'tabular-nums' }}
                textAnchor="end"
              >
                {fmt(tick)}
              </text>
            </g>
          )
        })}

        {/* Category axis labels. */}
        {labels.map((label) => (
          <text
            key={label}
            x={xFor(label)}
            y={VIEW.height - 34}
            fill="var(--ac-ink-faint)"
            fontSize="12"
            fontFamily="var(--ac-font-mono, ui-monospace, monospace)"
            textAnchor="middle"
          >
            {label}
          </text>
        ))}

        <g clipPath={`url(#${clipId})`}>
          {chart === 'bars'
            ? points.map((point, i) => {
                const x = VIEW.left + i * barSlot + barSlot / 2 - barWidth / 2
                const y = yFor(Math.max(0, point.value))
                const baseline = yFor(0)
                const top = Math.min(y, baseline)
                const barHeight = Math.max(2, Math.abs(baseline - y))
                return (
                  <motion.rect
                    key={point.label}
                    x={x}
                    y={top}
                    width={barWidth}
                    height={barHeight}
                    rx="4"
                    fill="var(--ac-accent)"
                    initial={reduce ? false : { scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{
                      duration: reduce ? 0 : 0.6,
                      delay: reduce ? 0 : i * 0.05,
                      ease: EASE_OUT_EXPO,
                    }}
                    style={{
                      transformBox: 'fill-box',
                      transformOrigin: 'bottom',
                    }}
                  />
                )
              })
            : null}

          {chart === 'area' ? (
            <motion.path
              d={areaPath(points, xFor, yFor, yFor(0))}
              fill="var(--ac-accent)"
              fillOpacity="0.16"
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: reduce ? 0 : 0.6, ease: EASE_OUT_EXPO }}
            />
          ) : null}

          {chart === 'line' || chart === 'area' ? (
            <>
              <motion.path
                d={linePath(points, xFor, yFor)}
                fill="none"
                stroke="var(--ac-accent)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduce ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: reduce ? 0 : 0.65, ease: EASE_OUT_EXPO }}
              />
              {points.map((point, i) => (
                <motion.circle
                  key={point.label}
                  cx={xFor(point.label)}
                  cy={yFor(point.value)}
                  r="4.5"
                  fill="var(--ac-bg)"
                  stroke="var(--ac-accent)"
                  strokeWidth="2.5"
                  initial={reduce ? false : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    duration: reduce ? 0 : 0.4,
                    delay: reduce ? 0 : 0.2 + i * 0.04,
                    ease: EASE_OUT_EXPO,
                  }}
                />
              ))}
            </>
          ) : null}
        </g>
      </svg>
      <figcaption style={captionStyle}>
        {latest
          ? `Latest — ${latest.label}: ${fmt(latest.value)}`
          : 'No data provided.'}
      </figcaption>
    </figure>
  )
}

function buildTicks(minValue: number, maxValue: number) {
  const steps = 4
  const spread = Math.max(1, maxValue - minValue)
  return Array.from(
    { length: steps + 1 },
    (_, index) => minValue + (spread / steps) * index,
  )
}

function linePath(
  points: SageVizPoint[],
  xFor: (label: string) => number,
  yFor: (value: number) => number,
) {
  return points
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'} ${xFor(point.label)} ${yFor(point.value)}`,
    )
    .join(' ')
}

function areaPath(
  points: SageVizPoint[],
  xFor: (label: string) => number,
  yFor: (value: number) => number,
  baseline: number,
) {
  if (!points.length) return ''
  const line = linePath(points, xFor, yFor)
  const first = points[0]
  const last = points[points.length - 1]
  return `${line} L ${xFor(last.label)} ${baseline} L ${xFor(first.label)} ${baseline} Z`
}

function formatValue(value: number, unit?: string): string {
  const rounded =
    Math.abs(value) >= 1000000
      ? `${Math.round(value / 100000) / 10}m`
      : Math.abs(value) >= 1000
        ? `${Math.round(value / 100) / 10}k`
        : `${Math.round(value * 10) / 10}`
  if (!unit) return rounded
  // Currency-style units prefix; everything else suffixes.
  return unit === '$' || unit === '€' || unit === '£'
    ? `${unit}${rounded}`
    : `${rounded}${unit}`
}

const shellStyle: React.CSSProperties = {
  margin: '2.5rem 0',
  border: '1px solid var(--ac-rule)',
  borderRadius: 'var(--ac-radius-lg)',
  padding: 'var(--ac-space-md)',
  background: 'var(--ac-surface)',
  boxShadow: 'var(--ac-elev-1)',
  color: 'var(--ac-ink)',
}

const headerStyle: React.CSSProperties = {
  padding: '0.25rem 0.25rem 1.1rem',
}

const kickerStyle: React.CSSProperties = {
  margin: 0,
  color: 'var(--ac-accent-text)',
  fontFamily: 'var(--ac-font-mono, ui-monospace, monospace)',
  fontSize: 'var(--ac-step--1, 0.8rem)',
  letterSpacing: 'var(--ac-track-label, 0.12em)',
  textTransform: 'uppercase',
}

const titleStyle: React.CSSProperties = {
  margin: '0.4rem 0 0',
  fontFamily: 'var(--ac-font-display, Georgia, serif)',
  fontSize: 'var(--ac-step-3, 1.85rem)',
  letterSpacing: 'var(--ac-track-display, -0.022em)',
  lineHeight: 'var(--ac-leading-snug, 1.3)',
  color: 'var(--ac-ink)',
}

const subtitleStyle: React.CSSProperties = {
  maxWidth: '60ch',
  margin: '0.55rem 0 0',
  color: 'var(--ac-ink-soft)',
  fontSize: 'var(--ac-step-0, 1rem)',
  lineHeight: 'var(--ac-leading-body, 1.62)',
}

const svgStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
  borderRadius: 'var(--ac-radius)',
  overflow: 'hidden',
}

const captionStyle: React.CSSProperties = {
  margin: '0.9rem 0.25rem 0.25rem',
  color: 'var(--ac-ink-faint)',
  fontFamily: 'var(--ac-font-mono, ui-monospace, monospace)',
  fontSize: 'var(--ac-step--1, 0.8rem)',
  fontVariantNumeric: 'tabular-nums',
}

const srOnlyStyle: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}
