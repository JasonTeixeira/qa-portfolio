/**
 * Artifact-composer logic — pure, shared by the client composer (live preview) and the
 * server `verifyArtifact` action (authoritative check), so both agree exactly (the same
 * discipline as caps-logic / gamification-logic).
 *
 * Judgment/design/leadership lessons don't have a deterministic code `check`; instead each
 * `sprint-contract` block already specifies a real deliverable in its `proof` field (e.g.
 * "scope_decision_packet.md with a constraint table, a selected boundary, one rejected
 * boundary, and an owner map"). This module turns that free-text spec into a checklist of
 * required ELEMENTS and grades a learner's drafted artifact against it: a reasonable-effort
 * gate (substantial length + each named element addressed by name), not an exact match —
 * because there is no single correct artifact, only one that covers what the contract asked for.
 */

/** A single thing the artifact must contain, derived from the contract's `proof` spec. */
export interface ArtifactRequirement {
  /** human-readable element, e.g. "a constraint table" */
  label: string
  /** salient keywords the learner's text should mention to address this element */
  keywords: string[]
}

/** Minimum characters for a draft to count as a real artifact (not a one-liner). */
export const ARTIFACT_MIN_CHARS = 140

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'for', 'with', 'that', 'this', 'one', 'two',
  'your', 'their', 'its', 'in', 'on', 'at', 'by', 'as', 'is', 'are', 'be', 'you', 'it',
  'each', 'per', 'via', 'plus', 'containing', 'showing', 'including', 'listing', 'md', 'txt',
  'file', 'document', 'doc', 'packet', 'table', 'map', 'list', 'note', 'memo', 'entry',
])

/** salient keywords for one requirement label — alpha tokens ≥4 chars, minus stopwords. */
function keywordsFor(label: string): string[] {
  const toks = label.toLowerCase().match(/[a-z][a-z-]{3,}/g) ?? []
  const kept = toks.filter((t) => !STOPWORDS.has(t))
  // de-dup, keep order, cap so a long phrase doesn't demand every word
  return [...new Set(kept)].slice(0, 4)
}

/**
 * Derive the required elements from a contract `proof` spec. Splits off any leading filename
 * and the list of elements after a "with/containing/showing/:" cue, on commas + " and ".
 * Falls back to a single whole-spec requirement when there's no parseable list.
 */
export function deriveRequirements(proof: string): ArtifactRequirement[] {
  if (!proof || !proof.trim()) return []
  let body = proof.trim()
  // drop a leading "filename.ext" and an optional cue word
  body = body.replace(/^[\w./-]+\.\w{1,5}\s*/, '')
  const cue = body.match(/\b(with|containing|contains|showing|shows|including|includes|that has|:)\b/i)
  if (cue && cue.index != null) body = body.slice(cue.index + cue[0].length)
  const parts = body
    .split(/,| and | plus |;|\band\b/i)
    .map((s) => s.replace(/^\s*(a|an|one|the)\s+/i, '').trim())
    .filter((s) => s.length >= 3)
  const reqs = parts.map((label) => ({ label, keywords: keywordsFor(label) })).filter((r) => r.keywords.length > 0)
  if (reqs.length >= 2) return reqs.slice(0, 8)
  // no clean list → one requirement covering the whole spec
  const kws = keywordsFor(proof)
  return kws.length ? [{ label: proof.trim().slice(0, 120), keywords: kws }] : []
}

export interface ArtifactGrade {
  /** per-requirement: is it addressed in the text? */
  results: { label: string; met: boolean }[]
  /** draft length in chars */
  length: number
  /** true when length floor met AND every requirement addressed */
  ok: boolean
}

/** Grade a drafted artifact against derived requirements. A requirement is "met" when the
 *  text mentions one of its DISTINCTIVE keywords — a keyword unique to that requirement within
 *  the set — so two requirements that share a word ("selected boundary" / "rejected boundary")
 *  can't satisfy each other via the shared word. If a requirement has no unique keyword, any of
 *  its keywords counts. */
export function gradeArtifact(text: string, requirements: ArtifactRequirement[]): ArtifactGrade {
  const hay = (text || '').toLowerCase()
  const length = (text || '').trim().length
  // keyword frequency across the requirement set → a keyword in exactly one requirement is distinctive
  const freq = new Map<string, number>()
  for (const r of requirements) for (const k of r.keywords) freq.set(k, (freq.get(k) ?? 0) + 1)
  const results = requirements.map((r) => {
    const distinctive = r.keywords.filter((k) => freq.get(k) === 1)
    const matchSet = distinctive.length ? distinctive : r.keywords
    return { label: r.label, met: matchSet.some((k) => hay.includes(k)) }
  })
  const allMet = results.length > 0 && results.every((r) => r.met)
  return { results, length, ok: allMet && length >= ARTIFACT_MIN_CHARS }
}
