import { CountUp } from '@/components/agency/islands/count-up'

/**
 * Career numbers strip — a slim full-width instrument band under the marquee.
 * Every value is real and sourced from docs/agency-proof-inventory.md.
 * Server component (values animate via the CountUp island).
 */

interface CareerNumber {
  value: string
  label: string
  accent: string
  href: string
}

const NUMBERS: readonly CareerNumber[] = [
  {
    value: '3,698',
    label: 'TESTS BEHIND RATCHETING GATES',
    accent: 'var(--acc-pass)',
    href: '#case-studies',
  },
  {
    value: '85',
    label: 'RUNNERS IN ONE SIGNED FLEET',
    accent: 'var(--acc-primary)',
    href: '#case-studies',
  },
  {
    value: '257',
    label: 'GENERATED MAESTRO FLOWS',
    accent: 'var(--acc-browser)',
    href: '#case-studies',
  },
  {
    value: '140',
    label: 'MCP TOOLS IN ONE PROOF OS',
    accent: 'var(--acc-ai)',
    href: '#case-studies',
  },
  {
    value: '17,305',
    label: 'CLAIMS AUDITED FOR SOURCES',
    accent: 'var(--acc-log)',
    href: '#ledger',
  },
  {
    value: '0',
    label: 'INVENTED METRICS ON THIS SITE',
    accent: 'var(--acc-fail)',
    href: '#ledger',
  },
]

export function CareerNumbers() {
  return (
    <section
      className="ag-numbers"
      aria-label="Career numbers — every value is real and traceable to an artifact"
    >
      <ul className="ag-numbers-row">
        {NUMBERS.map((item) => (
          <li key={item.label} className="ag-numbers-item">
            <a href={item.href} className="ag-numbers-link">
              <span className="ag-numbers-value" style={{ color: item.accent }}>
                <CountUp value={item.value} />
              </span>
              <span className="ag-numbers-label">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
