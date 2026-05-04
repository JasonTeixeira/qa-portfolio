/**
 * Reference / testimonial bank.
 *
 * Sage Ideas is a young studio. Per /trust references section: "rather than
 * ship cherry-picked testimonials, every prospective client gets the option
 * to talk directly to people I've built things with."
 *
 * Until clients give explicit permission to publish quotes with their name +
 * logo, this file holds *honest, anonymous, role-based* references. They do
 * not invent quotes. They describe the relationship + context, and surface
 * an "available for a reference call" CTA.
 *
 * As named, on-the-record testimonials become available, replace items here
 * by setting `attributed: true` and filling in name/role/company/quote.
 */

export type Reference = {
  /** Stable id for keys + linking. */
  id: string
  /** True only when the quote is on the record with name + permission. */
  attributed: boolean
  /** Anonymous role descriptor (always present). */
  role: string
  /** Anonymous industry / context (always present). */
  industry: string
  /**
   * Honest description of the relationship. Shown when `attributed` is false
   * in place of a quote.
   */
  context: string
  /** Optional: case study slug this reference is tied to. */
  caseStudy?: string
  /** Optional: years working together. */
  duration?: string
  /** Reference call availability. */
  callAvailable: boolean

  // Filled in only when attributed === true.
  name?: string
  title?: string
  company?: string
  quote?: string
  /** Optional logo path under /public. Monogram fallback used if absent. */
  logo?: string
  /** Hex monogram color when no logo. Defaults to brand cyan. */
  monogramColor?: string
}

export const references: Reference[] = [
  {
    id: 'fintech-eng-lead',
    attributed: false,
    role: 'Engineering lead',
    industry: 'Fintech',
    context:
      'Worked alongside on production trading systems for 5+ years. Available for technical reference calls — code quality, on-call discipline, incident behavior.',
    duration: '5 years',
    callAvailable: true,
  },
  {
    id: 'studio-founder',
    attributed: false,
    role: 'Founder',
    industry: 'Studio engagement',
    context:
      'Engaged Sage Ideas for a Ship + Operate combination. Willing to talk about scope discipline, timeline accuracy, and what handoff actually looked like.',
    callAvailable: true,
  },
  {
    id: 'oss-collaborator',
    attributed: false,
    role: 'Open-source collaborator',
    industry: 'Developer tooling',
    context:
      'Co-shipped a developer-tooling project. Available to discuss code review depth, communication cadence, and how disagreements got resolved.',
    callAvailable: true,
  },
  {
    id: 'ops-lead',
    attributed: false,
    role: 'Operations lead',
    industry: 'B2B SaaS',
    context:
      'Worked with Sage Ideas on internal tooling and integration plumbing. Reference call covers: scope creep, change requests, billing transparency.',
    callAvailable: true,
  },
  {
    id: 'platform-architect',
    attributed: false,
    role: 'Platform architect',
    industry: 'Infrastructure',
    context:
      'Reviewed several Sage Ideas architecture artifacts before client handoff. Available for a third-party perspective on technical depth and trade-off reasoning.',
    callAvailable: true,
  },
] as const

/**
 * Pick references for a specific case study slug. Falls back to the first N
 * generic references if no case-study-specific ones exist.
 */
export function referencesForCaseStudy(slug: string, max = 2): Reference[] {
  const tied = references.filter((r) => r.caseStudy === slug)
  if (tied.length >= max) return tied.slice(0, max)
  const generic = references.filter((r) => !r.caseStudy).slice(0, max - tied.length)
  return [...tied, ...generic]
}

/**
 * Logo strip entries. Most clients don't have public-disclosure permission
 * yet — these render as monograms (initials in a styled tile) instead of
 * real logos. Replace `logo` with a path under /public/logos/ once permission
 * is granted.
 */
export type LogoEntry = {
  id: string
  /** Display name or anonymized descriptor. */
  label: string
  /** Industry tag shown under the monogram. */
  industry: string
  /** Optional path to a real SVG/PNG under /public. */
  logo?: string
  /** When true, the company hasn't given disclosure permission yet — render as
   *  monogram with anonymized label like "Fintech client (under NDA)". */
  anonymous: boolean
  /** Two-letter monogram. Auto-derived from label if absent. */
  monogram?: string
  /** Tailwind text-color class for the monogram tile. */
  accent?: string
}

export const trustedBy: LogoEntry[] = [
  {
    id: 'fintech-trading',
    label: 'Fintech (NDA)',
    industry: 'Trading platform',
    anonymous: true,
    monogram: 'FT',
    accent: 'text-[#06B6D4]',
  },
  {
    id: 'b2b-saas',
    label: 'B2B SaaS (NDA)',
    industry: 'Internal tooling',
    anonymous: true,
    monogram: 'BS',
    accent: 'text-[#A78BFA]',
  },
  {
    id: 'devtools',
    label: 'Developer tooling',
    industry: 'Open source',
    anonymous: true,
    monogram: 'DT',
    accent: 'text-[#06B6D4]',
  },
  {
    id: 'ai-platform',
    label: 'AI platform (NDA)',
    industry: 'LLM tooling',
    anonymous: true,
    monogram: 'AI',
    accent: 'text-[#A78BFA]',
  },
  {
    id: 'infra-startup',
    label: 'Infrastructure startup',
    industry: 'Cloud platform',
    anonymous: true,
    monogram: 'IS',
    accent: 'text-[#06B6D4]',
  },
  {
    id: 'studio-internal',
    label: 'Sage Ideas (internal)',
    industry: 'Nexural / Vesper / Stellaris',
    anonymous: false,
    monogram: 'SI',
    accent: 'text-[#06B6D4]',
  },
] as const
