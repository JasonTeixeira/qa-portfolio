'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type Props = {
  title: string
  subtitle: string
  inputs: ReactNode
  results: { label: string; value: string; emphasis?: boolean }[]
  ctaSlug: string
  ctaLabel?: string
  footnote?: string
}

export function CalculatorShell({
  title,
  subtitle,
  inputs,
  results,
  ctaSlug,
  ctaLabel = 'Talk to Sage',
  footnote,
}: Props) {
  return (
    <div className="border border-[var(--sage-border-strong)] bg-[rgba(20,20,24,0.76)] p-6 sm:p-8">
      <header className="mb-6">
        <h3 className="text-2xl font-bold tracking-tight text-[var(--sage-ink)]">{title}</h3>
        <p className="mt-1 text-sm text-[var(--sage-ink-muted)]">{subtitle}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-5">{inputs}</div>

        {/* Results */}
        <div className="space-y-4">
          <div className="border border-[var(--sage-border)] bg-[rgba(11,11,14,0.76)] p-5">
            <div className="space-y-3">
              {results.map((r) => (
                <div key={r.label} className="flex items-baseline justify-between gap-4">
                  <span
                    className={`text-sm ${
                      r.emphasis ? 'font-medium text-[var(--sage-ink)]' : 'text-[var(--sage-ink-muted)]'
                    }`}
                  >
                    {r.label}
                  </span>
                  <span
                    className={`tabular-nums font-mono ${
                      r.emphasis
                        ? 'text-2xl font-bold text-[var(--sage-accent-readable)]'
                        : 'text-base text-[var(--sage-ink)]'
                    }`}
                  >
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {footnote && (
            <p className="text-xs leading-relaxed text-[var(--sage-ink-faint)]">{footnote}</p>
          )}

          <Link
            href={`/book?context=${ctaSlug}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--sage-accent)] px-5 text-sm font-semibold text-white transition hover:bg-[#5670ff]"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// Reusable input components
type RangeProps = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  format?: (n: number) => string
  onChange: (n: number) => void
}

export function RangeInput({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  format,
  onChange,
}: RangeProps) {
  const display = format ? format(value) : `${value.toLocaleString()}${unit}`
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="text-sm text-[var(--sage-ink-muted)]">{label}</label>
        <span className="font-mono text-sm text-[var(--sage-ink)] tabular-nums">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--sage-accent)]"
      />
    </div>
  )
}
