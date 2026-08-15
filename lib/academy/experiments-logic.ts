/**
 * STAGE 3 — pure experiment math. NO 'server-only', NO DB, NO Date.now /
 * Math.random. Fully deterministic + total, so the entire behavioral-proof
 * apparatus is unit-testable in isolation.
 *
 * Three honest primitives:
 *   1. assignVariant   — deterministic, balanced treatment/holdout bucketing.
 *   2. twoProportionZTest — pooled two-proportion z-test (treatment vs holdout).
 *   3. experimentVerdict  — the HONEST gate: never claims significance on a
 *      thin sample. Below minN per arm → 'insufficient_data', full stop.
 *
 * Honesty invariant (shared with metrics-logic / efficacy-logic): a small,
 * noisy n is worse than no number. We refuse to publish a verdict — let alone a
 * "treatment wins" — until BOTH arms clear minN. This is the firewall against
 * fabricated significance on near-zero traffic.
 */

/** Deterministic bucket assignment for a user in a named experiment. */
export type Variant = 'treatment' | 'holdout'

/** Default share of the cohort held back as a no-treatment control (percent). */
export const DEFAULT_HOLDOUT_PCT = 50

/** Per-arm minimum sample before any significance claim is permitted. */
export const DEFAULT_MIN_N = 100

/** 95% two-sided critical z. |z| beyond this ⇒ p < 0.05. */
export const Z_CRIT_95 = 1.96

// ---------------------------------------------------------------------------
// 1. Deterministic assignment — FNV-1a hash of `${userId}:${experimentKey}`
// ---------------------------------------------------------------------------

const FNV_OFFSET_BASIS = 0x811c9dc5
const FNV_PRIME = 0x01000193
const UINT32 = 0x100000000 // 2^32

/**
 * FNV-1a 32-bit hash → unsigned 32-bit integer. Deterministic and total over any
 * string. Used only for bucketing (not security). `>>> 0` keeps every step in
 * unsigned 32-bit space so the result is stable across engines.
 */
export function fnv1a32(input: string): number {
  let hash = FNV_OFFSET_BASIS
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    // hash * FNV_PRIME in 32-bit space, via Math.imul to avoid float drift.
    hash = Math.imul(hash, FNV_PRIME) >>> 0
  }
  return hash >>> 0
}

/**
 * xorshift-multiply finalizer (MurmurHash3 fmix32). FNV-1a's HIGH bits are poorly
 * mixed — two near-identical inputs (e.g. `u:exp-a` vs `u:exp-b`) leave the top
 * bits almost unchanged, so a top-bit bucket reduction would be near-independent
 * of the salt and two experiments would share a split. Avalanching the bits fixes
 * that: a one-bit input change now flips ~half the output bits. Deterministic.
 */
export function mix32(h: number): number {
  let x = h >>> 0
  x ^= x >>> 16
  x = Math.imul(x, 0x85ebca6b) >>> 0
  x ^= x >>> 13
  x = Math.imul(x, 0xc2b2ae35) >>> 0
  x ^= x >>> 16
  return x >>> 0
}

/**
 * Deterministically bucket a user into 'treatment' or 'holdout' for a given
 * experiment. Same (userId, experimentKey) → same variant, always. The bucket
 * is the hash mapped to [0, 100); below `holdoutPct` → holdout, else treatment.
 * Because the hash is well-distributed, the split is ~balanced across many users.
 *
 * holdoutPct is clamped to [0, 100]: 0 → everyone treatment, 100 → everyone
 * holdout (a total never throws on a bad caller value).
 */
export function assignVariant(
  userId: string,
  experimentKey: string,
  holdoutPct: number = DEFAULT_HOLDOUT_PCT,
): Variant {
  const pct = clamp(holdoutPct, 0, 100)
  const bucket = (mix32(fnv1a32(`${userId}:${experimentKey}`)) / UINT32) * 100
  return bucket < pct ? 'holdout' : 'treatment'
}

// ---------------------------------------------------------------------------
// 2. Pooled two-proportion z-test
// ---------------------------------------------------------------------------

export interface ZTestResult {
  /** Conversion rate of arm A (treatment), 0–1. */
  rateA: number
  /** Conversion rate of arm B (holdout), 0–1. */
  rateB: number
  /** Absolute lift = rateA − rateB (positive ⇒ treatment converts more). */
  lift: number
  /** Test statistic. 0 when undefined (empty arm or zero pooled variance). */
  z: number
  /** Two-sided p-value from the normal approximation. 1 when z is undefined. */
  pValue: number
}

/**
 * Standard pooled two-proportion z-test. Arm A = treatment, arm B = holdout.
 *
 *   p̂ = (xA + xB) / (nA + nB)            (pooled rate)
 *   se = sqrt( p̂(1−p̂) (1/nA + 1/nB) )    (pooled standard error)
 *   z  = (rateA − rateB) / se
 *
 * Guards (return z = 0, p = 1 — "no detectable effect", never NaN/Infinity):
 *   - either arm has n = 0 (no data to compare), or
 *   - pooled variance is zero (p̂ = 0 or p̂ = 1: every observation identical,
 *     so there is literally no variation to test against).
 *
 * Inputs are defensively clamped: conversions to [0, n], n to ≥ 0. Pure +
 * total — never throws, never mutates.
 */
export function twoProportionZTest(
  convA: number,
  nA: number,
  convB: number,
  nB: number,
): ZTestResult {
  const safeNA = Math.max(0, Math.floor(nA))
  const safeNB = Math.max(0, Math.floor(nB))
  const xA = clamp(Math.floor(convA), 0, safeNA)
  const xB = clamp(Math.floor(convB), 0, safeNB)

  const rateA = safeNA === 0 ? 0 : xA / safeNA
  const rateB = safeNB === 0 ? 0 : xB / safeNB
  const lift = round4(rateA - rateB)

  if (safeNA === 0 || safeNB === 0) {
    return { rateA: round4(rateA), rateB: round4(rateB), lift, z: 0, pValue: 1 }
  }

  const pooled = (xA + xB) / (safeNA + safeNB)
  const variance = pooled * (1 - pooled) * (1 / safeNA + 1 / safeNB)
  if (variance <= 0) {
    return { rateA: round4(rateA), rateB: round4(rateB), lift, z: 0, pValue: 1 }
  }

  const z = (rateA - rateB) / Math.sqrt(variance)
  const pValue = twoSidedPValue(z)
  return {
    rateA: round4(rateA),
    rateB: round4(rateB),
    lift,
    z: round4(z),
    pValue: round4(pValue),
  }
}

// ---------------------------------------------------------------------------
// 3. The honest verdict
// ---------------------------------------------------------------------------

export type ExperimentStatus =
  | 'insufficient_data'
  | 'no_significant_effect'
  | 'treatment_wins'
  | 'holdout_wins'

export interface ExperimentVerdict {
  status: ExperimentStatus
  /** rateTreatment − rateHoldout. */
  lift: number
  z: number
  pValue: number
  treatmentRate: number
  holdoutRate: number
}

export interface VerdictInput {
  treatmentConv: number
  treatmentN: number
  holdoutConv: number
  holdoutN: number
  /** Per-arm minimum sample before significance may be claimed. */
  minN?: number
}

/**
 * Collapse the two arms into one honest verdict.
 *
 * THE GUARD (mandatory): if EITHER arm has fewer than minN observations, the
 * status is 'insufficient_data' — period. No lift, no z, no p-value is allowed
 * to imply a result on a sample too small to support one. With today's ~0
 * traffic this is what every experiment returns, by construction.
 *
 * Once both arms clear minN:
 *   |z| > 1.96 (p < 0.05) and lift > 0  → 'treatment_wins'
 *   |z| > 1.96 (p < 0.05) and lift < 0  → 'holdout_wins'
 *   otherwise                            → 'no_significant_effect'
 *
 * (A significant result with exactly zero lift is impossible — a nonzero z
 * requires rateA ≠ rateB — so the lift sign is always well-defined when
 * significant.)
 */
export function experimentVerdict(input: VerdictInput): ExperimentVerdict {
  const minN = input.minN ?? DEFAULT_MIN_N
  const test = twoProportionZTest(
    input.treatmentConv,
    input.treatmentN,
    input.holdoutConv,
    input.holdoutN,
  )

  const base = {
    lift: test.lift,
    z: test.z,
    pValue: test.pValue,
    treatmentRate: test.rateA,
    holdoutRate: test.rateB,
  }

  const safeTreatmentN = Math.max(0, Math.floor(input.treatmentN))
  const safeHoldoutN = Math.max(0, Math.floor(input.holdoutN))
  if (safeTreatmentN < minN || safeHoldoutN < minN) {
    return { status: 'insufficient_data', ...base }
  }

  const significant = Math.abs(test.z) > Z_CRIT_95
  if (!significant) return { status: 'no_significant_effect', ...base }
  return { status: test.lift > 0 ? 'treatment_wins' : 'holdout_wins', ...base }
}

// ---------------------------------------------------------------------------
// Numeric helpers
// ---------------------------------------------------------------------------

/**
 * Two-sided p-value for a standard-normal z: P(|Z| ≥ |z|) = 2·(1 − Φ(|z|)).
 * Φ is approximated with the Abramowitz & Stegun 7.1.26 erf approximation
 * (|error| < 1.5e-7) — accurate enough that the p-value matches textbook tables
 * to ~4 dp, with no external dependency. Deterministic and total.
 */
export function twoSidedPValue(z: number): number {
  if (!Number.isFinite(z)) return 1
  const p = 2 * (1 - normalCdf(Math.abs(z)))
  return clamp(p, 0, 1)
}

/** Standard normal CDF Φ(x) via the erf identity Φ(x) = ½(1 + erf(x/√2)). */
export function normalCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2))
}

/**
 * Error function via Abramowitz & Stegun 7.1.26. Odd function (erf(−x) =
 * −erf(x)); we evaluate on |x| and restore the sign. Max abs error ~1.5e-7.
 */
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * ax)
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-ax * ax)
  return sign * y
}

function clamp(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo
  return Math.max(lo, Math.min(hi, n))
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000
}
