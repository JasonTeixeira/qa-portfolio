import Link from 'next/link'
import { JsonLd } from '@/components/json-ld'
import { buildBreadcrumbList } from '@/lib/seo/jsonld'

const SITE = 'https://www.sageideas.dev'

const HIDE_PREFIXES = ['/api', '/admin', '/portal', '/auth']
const LABELS: Record<string, string> = {
  academy: 'Academy',
  blog: 'Journal',
  book: 'Book',
  capabilities: 'Capabilities',
  changelog: 'Changelog',
  compare: 'Compare',
  contact: 'Contact',
  engineering: 'Engineering',
  'engineering-os': 'Engineering OS',
  founder: 'Founder',
  industries: 'Industries',
  lab: 'Lab',
  legal: 'Legal',
  pricing: 'Pricing',
  process: 'Process',
  reports: 'Reports',
  services: 'Services',
  stack: 'Stack',
  studio: 'Studio',
  topics: 'Topics',
  tools: 'Tools',
  trust: 'Trust',
  work: 'Work',
}

function labelFor(segment: string) {
  return LABELS[segment] ?? segment.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function Breadcrumbs({ pathname }: { pathname: string }) {
  const cleanPath = pathname.split('?')[0] || '/'
  if (cleanPath === '/' || HIDE_PREFIXES.some((prefix) => cleanPath.startsWith(prefix))) {
    return null
  }

  const segments = cleanPath.split('/').filter(Boolean)
  if (segments.length === 0) return null

  const items = [
    { name: 'Home', url: SITE },
    ...segments.map((segment, index) => ({
      name: labelFor(segment),
      url: `${SITE}/${segments.slice(0, index + 1).join('/')}`,
    })),
  ]

  return (
    <>
      <JsonLd data={buildBreadcrumbList(items)} />
      <nav
        aria-label="Breadcrumb"
        className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:left-4 focus-within:top-20 focus-within:z-[80] focus-within:border focus-within:border-[var(--sage-border)] focus-within:bg-[var(--sage-bg)] focus-within:p-3"
      >
        <ol className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sage-ink-muted)]">
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            return (
              <li className="flex items-center gap-2" key={item.url}>
                {index > 0 ? <span aria-hidden>/</span> : null}
                {isLast ? (
                  <span aria-current="page" className="text-[var(--sage-ink)]">
                    {item.name}
                  </span>
                ) : (
                  <Link className="hover:text-[var(--sage-ink)]" href={item.url.replace(SITE, '') || '/'}>
                    {item.name}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
