// Extract every STANDARDS CITATION from the authored lessons (the highest-risk
// error class: false "OWASP/RFC/DORA/SWEBOK/NIST/WCAG says X" authority claims).
// Deterministic (no agents). Emits a structured claim list + a deduped-by-sentence
// summary so verification only checks each DISTINCT claim once.
//
// Usage: node scripts/academy/authoring/extract-standards-claims.mjs
// Writes: data/academy/authoring/_standards-claims.json  (+ prints counts)

import { readFileSync, writeFileSync } from 'node:fs'
import { globSync } from 'node:fs'

const STD = /\b(OWASP(?:\s+API)?(?:\s+(?:Top\s*10|A\d{1,2}|API\d{1,2}))?|DORA|SWEBOK|NIST(?:\s+SP\s*\d[\d.-]*)?|WCAG(?:\s*[\d.]+)?|SOC\s*2|ISO\s*\d{3,5}|RFC\s*\d{3,5}|Two Generals|CAP theorem|Enterprise Integration Patterns)\b/i

// pull the sentence(s) around a standards mention out of a text blob
function sentencesWithStd(text) {
  if (typeof text !== 'string') return []
  const parts = text.split(/(?<=[.!?])\s+|\n+/)
  return parts.filter((s) => STD.test(s)).map((s) => s.trim()).filter(Boolean)
}
function walk(node, out) {
  if (typeof node === 'string') { for (const s of sentencesWithStd(node)) out.add(s) }
  else if (Array.isArray(node)) for (const x of node) walk(x, out)
  else if (node && typeof node === 'object') for (const v of Object.values(node)) walk(v, out)
}

const files = globSync('data/academy/authoring/*.lessons.json')
const claims = [] // {course, slug, standard, claim}
for (const f of files) {
  const course = f.split('/').pop().replace('.lessons.json', '')
  const d = JSON.parse(readFileSync(f, 'utf8'))
  for (const [slug, blocks] of Object.entries(d)) {
    const set = new Set()
    walk(blocks, set)
    for (const claim of set) {
      const m = claim.match(STD)
      claims.push({ course, slug, standard: m ? m[0] : '?', claim: claim.slice(0, 400) })
    }
  }
}

// dedupe by normalized claim sentence (same claim reused across lessons → verify once)
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
const distinct = new Map() // normClaim -> {claim, standard, occurrences:[{course,slug}]}
for (const c of claims) {
  const k = norm(c.claim)
  if (!distinct.has(k)) distinct.set(k, { claim: c.claim, standard: c.standard, occurrences: [] })
  distinct.get(k).occurrences.push({ course: c.course, slug: c.slug })
}
const distinctList = [...distinct.values()].sort((a, b) => b.occurrences.length - a.occurrences.length)

writeFileSync('data/academy/authoring/_standards-claims.json', JSON.stringify({ total: claims.length, distinct: distinctList.length, claims: distinctList }, null, 2))

const byStd = {}
for (const c of claims) { const s = c.standard.toUpperCase().split(/\s/)[0]; byStd[s] = (byStd[s] || 0) + 1 }
console.log(JSON.stringify({ totalMentionsExtracted: claims.length, distinctClaims: distinctList.length, byStandard: byStd, topReused: distinctList.slice(0, 5).map((d) => ({ n: d.occurrences.length, standard: d.standard, claim: d.claim.slice(0, 90) })) }, null, 2))
