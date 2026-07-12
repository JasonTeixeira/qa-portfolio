import { permanentRedirect } from 'next/navigation'

/**
 * LEGACY track enrollment — RETIRED. Enrollment now flows through the canonical
 * Courses model. Permanently redirect (308) legacy /academy/[track]/enroll URLs
 * to the Courses catalog.
 */
export default async function LegacyTrackEnrollRedirect() {
  permanentRedirect('/academy/catalog')
}
