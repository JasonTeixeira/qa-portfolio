import { permanentRedirect } from 'next/navigation'

/**
 * LEGACY track lessons — RETIRED. Lessons now live under the canonical
 * Course -> Lesson model. Permanently redirect (308) legacy
 * /academy/[track]/learn URLs to the Courses catalog.
 */
export default async function LegacyTrackLearnRedirect() {
  permanentRedirect('/academy/catalog')
}
