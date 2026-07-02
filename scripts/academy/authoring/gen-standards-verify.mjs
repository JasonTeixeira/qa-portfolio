// Generate a grouped STANDARDS-verification Workflow for ONE standard (P1, targeted).
// Reads _standards-claims.json, filters to claims citing <standard>, batches them
// (~15/agent), and each agent fetches that standard's PRIMARY SOURCE once, then
// verifies its batch of claims against it — few fetches, low drop risk. Writes to /tmp.
//
// Usage: node scripts/academy/authoring/gen-standards-verify.mjs <STANDARD> [batchSize]
//   STANDARD matches the leading token (SWEBOK, DORA, OWASP, WCAG, NIST, SOC, RFC).

import { readFileSync, writeFileSync } from 'node:fs'

const [standard, batchArg] = process.argv.slice(2)
if (!standard) { console.error('usage: gen-standards-verify.mjs <STANDARD> [batchSize]'); process.exit(2) }
const BATCH = Number(batchArg) || 15

const all = JSON.parse(readFileSync('data/academy/authoring/_standards-claims.json', 'utf8')).claims
const claims = all.filter((c) => c.standard.toUpperCase().startsWith(standard.toUpperCase()))
if (!claims.length) { console.error(`no claims for standard ${standard}`); process.exit(1) }

// batch the claims; each claim carries its occurrences so fixes can be applied everywhere
const batches = []
for (let i = 0; i < claims.length; i += BATCH) batches.push(claims.slice(i, i + BATCH))

const SOURCE_HINT = {
  SWEBOK: 'IEEE SWEBOK v4.0 (2024) — computer.org/education/bodies-of-knowledge/software-engineering/v4. Its knowledge areas are broad; it rarely names specific techniques (idempotency, retry-safety, DLQ). Be strict: if a claim says "SWEBOK says/treats X" and SWEBOK has no such passage, it is IMPRECISE/WRONG.',
  DORA: 'DORA (dora.dev) — the four keys: deploy frequency, lead time for changes, change failure rate, failed-deployment recovery time (+ reliability/rework). DORA is a delivery-performance research program; it does NOT prescribe implementation techniques (DLQ, idempotency, specific patterns). Flag any claim that DORA "prescribes/says" a technique.',
  OWASP: 'OWASP API Security Top 10 2023 (owasp.org/API-Security/editions/2023) categories: API1 BOLA, API2 Broken Auth, API3 Broken Object Property Level Authz, API4 Unrestricted Resource Consumption (DoS/cost, NOT idempotency), API5 Broken Function Level Authz, API6 Unrestricted Access to Sensitive Business Flows, API7 SSRF, API8 Security Misconfiguration, API9 Improper Inventory Management (undocumented endpoints/versions), API10 Unsafe Consumption of APIs. Also OWASP Web Top 10 2021 (A01 Broken Access Control … A09 Security Logging/Monitoring Failures). Flag misattributed category names/numbers.',
  WCAG: 'WCAG 2.2 (w3.org/TR/WCAG22) — POUR principles; success criteria at A/AA/AAA. Verify specific SC numbers/levels (e.g. 1.4.3 Contrast AA, 2.1.1 Keyboard A, 4.1.3 Status Messages AA). Flag wrong SC numbers or levels.',
  NIST: 'NIST — verify the exact framework named: AI RMF (GOVERN/MAP/MEASURE/MANAGE), the GenAI Profile, or an SP 800-series doc. Flag claims attributing a technique to NIST that its text does not make.',
  SOC: 'SOC 2 (AICPA Trust Services Criteria) — CC-series common criteria (e.g. CC6.x logical access). Verify any specific control reference (e.g. CC6.3 for deprovisioning).',
  RFC: 'Verify against the exact RFC (rfc-editor.org) — e.g. RFC 9110 HTTP semantics (status codes, idempotent methods). Flag wrong status-code semantics.',
}[standard.toUpperCase().slice(0, 4)] || `the primary source for ${standard}`

const script = `export const meta = {
  name: 'stdverify-${standard.toLowerCase()}',
  description: 'Verify ${claims.length} ${standard} standards-claims vs the primary source',
  phases: [{ title: 'Verify', detail: '${batches.length} batches, source fetched once each' }],
}
phase('Verify')
const STANDARD = ${JSON.stringify(standard)}
const SOURCE_HINT = ${JSON.stringify(SOURCE_HINT)}
const BATCHES = ${JSON.stringify(batches)}
const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['verdicts'],
  properties: { verdicts: { type: 'array', items: {
    type: 'object', additionalProperties: false,
    required: ['claim', 'verdict', 'fix'],
    properties: {
      claim: { type: 'string', description: 'the claim verbatim (to match + locate it)' },
      verdict: { type: 'string', enum: ['CONFIRMED', 'IMPRECISE', 'WRONG'] },
      source: { type: 'string' },
      fix: { type: 'string', description: 'exact corrected wording if IMPRECISE/WRONG, else "none"' },
    },
  } } },
}
const promptFor = (batch, i) => 'You are a harsh senior technical fact-checker verifying claims that cite ' + STANDARD + '.\\n\\n' +
  'AUTHORITY: ' + SOURCE_HINT + '\\nFetch/confirm the primary source (load WebSearch+WebFetch via ToolSearch "select:WebSearch,WebFetch"; for library APIs use context7). Fetch the source ONCE, then judge every claim below against it.\\n\\n' +
  'CLAIMS (verbatim from lessons — verify each):\\n' + batch.map((c, k) => (k + 1) + '. ' + c.claim).join('\\n') + '\\n\\n' +
  'For EACH claim: verdict CONFIRMED (the source genuinely supports it) / IMPRECISE (partly true or overstated) / WRONG (the source does not say this, or says the opposite). For IMPRECISE/WRONG give the EXACT corrected wording to substitute (preserve the sentence intent, remove the false authority). Be strict about "STANDARD says/treats/prescribes X" — that is only CONFIRMED if the primary text actually says it. Return the claim VERBATIM so it can be located + replaced.\\n' +
  'Return via StructuredOutput: verdicts=[{claim, verdict, source, fix}] for all ' + batch.length + ' claims.'
const results = await parallel(BATCHES.map((b, i) => () => agent(promptFor(b, i), { label: STANDARD + ':batch' + (i + 1), phase: 'Verify', schema: SCHEMA }).catch(() => null)))
const verdicts = results.filter(Boolean).flatMap((r) => r.verdicts)
const bad = verdicts.filter((v) => v.verdict !== 'CONFIRMED')
return {
  standard: STANDARD, checked: verdicts.length, confirmed: verdicts.length - bad.length,
  corrections: bad.map((v) => ({ claim: v.claim, verdict: v.verdict, source: v.source, fix: v.fix })),
}
`
const outPath = `/tmp/stdverify-${standard.toLowerCase()}.wf.js`
writeFileSync(outPath, script)
console.log(JSON.stringify({ scriptPath: outPath, standard, claims: claims.length, batches: batches.length }))
