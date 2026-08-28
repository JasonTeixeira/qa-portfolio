const RELEASE_ID_RE = /^[a-z0-9][a-z0-9._-]{2,95}$/

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
