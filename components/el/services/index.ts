/**
 * Engineered Luxury service surfaces — the money pages' shared kit.
 * Pricing cards, care cards, the comparison table, the FAQ accordion, the
 * detail template, and the catalog row. All prices flow from
 * `data/services/tiers.ts` (single source of truth).
 */

export { TierCard } from './TierCard'
export type { TierCardProps } from './TierCard'

export { CareCard } from './CareCard'
export type { CareCardProps } from './CareCard'

export { FaqAccordion } from './FaqAccordion'
export type { FaqAccordionProps, FaqItem } from './FaqAccordion'

export { ComparisonTable } from './ComparisonTable'
export type { ComparisonTableProps } from './ComparisonTable'

export { ServiceDetail } from './ServiceDetail'
export type { ServiceDetailProps } from './ServiceDetail'

export { CatalogRow } from './CatalogRow'
export type { CatalogRowProps, CatalogRowItem } from './CatalogRow'

export { TierGrid } from './TierGrid'
export type { TierGridProps } from './TierGrid'
