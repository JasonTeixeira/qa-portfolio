import { permanentRedirect } from 'next/navigation'

/**
 * /academy/my-courses is FOLDED into the canonical Courses surface — the catalog
 * already shows enrolled/in-progress state (My / Browse), so this separate list is
 * redundant (NAVIGATION_AUDIT.md: "three competing courses entry points").
 * Permanently redirect (308) to /academy/catalog.
 */
export default async function MyCoursesRedirect() {
  permanentRedirect('/academy/catalog')
}
