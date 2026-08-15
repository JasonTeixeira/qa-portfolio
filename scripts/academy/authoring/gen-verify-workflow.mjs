// Generate a per-course ACCURACY-VERIFICATION Workflow (P1). One agent per lesson
// extracts the lesson's technical claims and verifies them against AUTHORITATIVE
// primary sources — context7 (library/framework APIs) + WebSearch/WebFetch (OWASP,
// RFC, MDN, NIST, SWEBOK, cloud docs). Writes the script to /tmp; invoke via
// Workflow({scriptPath}). Reads the course's lesson slugs from its authoring JSON.
//
// Usage: node scripts/academy/authoring/gen-verify-workflow.mjs <courseSlug>

import { readFileSync, writeFileSync } from 'node:fs'

const [courseSlug] = process.argv.slice(2)
if (!courseSlug) { console.error('usage: gen-verify-workflow.mjs <courseSlug>'); process.exit(2) }

const jsonPath = `data/academy/authoring/${courseSlug}.lessons.json`
const lessons = Object.keys(JSON.parse(readFileSync(jsonPath, 'utf8')))
if (!lessons.length) { console.error(`no lessons in ${jsonPath}`); process.exit(1) }

const script = `export const meta = {
  name: 'verify-${courseSlug}',
  description: 'Independently verify ${courseSlug} (${lessons.length} lessons) accuracy vs primary sources',
  phases: [{ title: 'Verify', detail: 'one agent per lesson — context7 + OWASP/RFC/MDN' }],
}
phase('Verify')
const COURSE = ${JSON.stringify(courseSlug)}
const JSON_PATH = ${JSON.stringify(jsonPath)}
const LESSONS = ${JSON.stringify(lessons)}
const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['slug', 'score', 'grounded', 'wrong', 'summary'],
  properties: {
    slug: { type: 'string' },
    score: { type: 'integer', description: 'accuracy 1-100 vs authoritative sources' },
    grounded: { type: 'boolean' },
    wrong: {
      type: 'array',
      description: 'claims that are WRONG or materially IMPRECISE, with the authoritative correction',
      items: {
        type: 'object', additionalProperties: false,
        required: ['claim', 'source', 'verdict', 'fix'],
        properties: {
          claim: { type: 'string' },
          source: { type: 'string', description: 'the authoritative source + what it says' },
          verdict: { type: 'string', enum: ['WRONG', 'IMPRECISE'] },
          fix: { type: 'string', description: 'the exact correction to make in the lesson' },
        },
      },
    },
    summary: { type: 'string' },
  },
}
const promptFor = (slug) => 'You are a harsh, specific senior technical fact-checker. Independently VERIFY the accuracy of ONE academy lesson against AUTHORITATIVE PRIMARY SOURCES.\\n\\n' +
  'STEP 1 — READ the lesson blocks: open ' + JSON_PATH + ' and find the key "' + slug + '". Extract every concrete TECHNICAL claim from its blocks (concept, code-walkthrough code + step notes, callout/standards-grounding, quiz question + correct answer + explanation, diagram edge labels). Include: API/syntax claims, status codes, complexity/big-O, security classifications (OWASP ranks), protocol/spec behavior, and any "always/never/must" statement.\\n\\n' +
  'STEP 2 — VERIFY each claim against the RIGHT authority (load tools via ToolSearch):\\n' +
  '  - Library/framework/API claims (React, Playwright, Postgres, Zod, Express, k8s, dbt, etc.): use context7 (ToolSearch "select:mcp__plugin_context7_context7__resolve-library-id,mcp__plugin_context7_context7__query-docs") for OFFICIAL current docs.\\n' +
  '  - Standards/spec claims (HTTP status/semantics, idempotency, TLS, DNS, CIDR, OWASP Top 10 / API Top 10, WCAG, SOC2, RFCs, SWEBOK, DORA): use WebSearch + WebFetch (ToolSearch "select:WebSearch,WebFetch") against the PRIMARY source (rfc-editor.org, owasp.org, developer.mozilla.org, w3.org/WAI, datatracker.ietf.org, cloud provider docs). Quote the exact spec text.\\n' +
  '  Verify the CODE too: does it run and produce the stated output? Is the syntax current and correct?\\n\\n' +
  'STEP 3 — Judge each claim CONFIRMED / IMPRECISE / WRONG. Only put IMPRECISE + WRONG items in the "wrong" array, each with the authoritative source (name + what it says) and the EXACT fix to apply. Be strict: catch inversions, outdated APIs, wrong status codes, misranked risks, oversimplifications that mislead. Do NOT rubber-stamp; if everything checks out, say so with the sources you checked.\\n\\n' +
  'Return via StructuredOutput: slug="' + slug + '", score (accuracy 1-100; 100 = every claim confirmed against a primary source), grounded (bool), wrong (the array; [] if all confirmed), summary (one line: what you verified + verdict).'
const results = await parallel(LESSONS.map((slug) => () => agent(promptFor(slug), { label: 'verify:' + slug, phase: 'Verify', schema: SCHEMA }).catch(() => null)))
const ok = results.filter(Boolean)
const needFix = ok.filter((r) => r.wrong && r.wrong.length)
return {
  course: COURSE, verified: ok.length,
  avg: ok.length ? Math.round(ok.reduce((s, r) => s + r.score, 0) / ok.length) : 0,
  needFix: needFix.map((r) => ({ slug: r.slug, score: r.score, wrong: r.wrong })),
  all: ok.map((r) => ({ slug: r.slug, score: r.score, wrongCount: (r.wrong || []).length })),
}
`
const outPath = `/tmp/verify-${courseSlug}.wf.js`
writeFileSync(outPath, script)
console.log(JSON.stringify({ scriptPath: outPath, lessons: lessons.length }))
