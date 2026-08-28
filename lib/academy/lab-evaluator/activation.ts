import flagshipActivation from '@/data/academy/lab-evaluator/flagship-activation.json'

const RELEASE_ID_RE = /^[a-z0-9][a-z0-9._-]{2,95}$/

export const FLAGSHIP_ACTIVATION_RELEASE_ID = flagshipActivation.releaseId

const FLAGSHIP_LAB_KEYS = new Set(flagshipActivation.labs.map((lab) => lab.labKey))

/** Only labs in the immutable public candidate manifest may reach staging. */
export function isFlagshipLabCandidate(courseSlug: string, lessonSlug: string): boolean {
  return FLAGSHIP_LAB_KEYS.has(`${courseSlug}/${lessonSlug}`)
}

/**
 * Mastery persistence is a two-part, fail-closed operator switch. Both values
 * must match exactly; unset, malformed, or case-varied values remain disabled.
 */
export function masteryPersistenceEnabled(
  env: Record<string, string | undefined>,
  expectedReleaseId: string,
): boolean {
  if (!RELEASE_ID_RE.test(expectedReleaseId)) return false
  return env.ACADEMY_LAB_MASTERY_WRITES_ENABLED === 'true' &&
    env.ACADEMY_LAB_ACTIVATION_RELEASE === expectedReleaseId
}
