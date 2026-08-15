import type { ReactNode } from 'react'

/**
 * The depth primitive. Institutional Editorial gets depth from surfaces +
 * hairline rules + restrained shadow — never glow. `raised` lifts a panel onto
 * the recessed surface with the soft shadow; default is flush with a hairline
 * rule. Token-driven (--ac-surface / --ac-rule / --ac-shadow / --ac-radius).
 */
export function Surface({
  children,
  raised = false,
  className = '',
}: {
  children: ReactNode
  raised?: boolean
  className?: string
}) {
  return (
    <div
      className={`rounded-[var(--ac-radius)] border ${className}`}
      style={{
        borderColor: 'var(--ac-rule)',
        background: raised ? 'var(--ac-surface-2)' : 'var(--ac-surface)',
        boxShadow: raised ? 'var(--ac-shadow)' : 'none',
      }}
    >
      {children}
    </div>
  )
}
