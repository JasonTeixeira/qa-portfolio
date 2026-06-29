import { permanentRedirect } from 'next/navigation'

/**
 * LEGACY track system — RETIRED. The canonical content model is now
 * Catalog -> Course -> Lesson -> Lab (see docs/academy/NAVIGATION_AUDIT.md).
 *
 * Track slugs (e.g. ai-native-product-building) do not map 1:1 to course slugs,
 * so every legacy /academy/[track] URL permanently redirects (308) to the
 * canonical Courses surface rather than guessing a course. This collapses the
 * three-competing-entry-points problem while preserving inbound links/SEO.
 */
export default async function LegacyTrackRedirect() {
  permanentRedirect('/academy/catalog')
}
