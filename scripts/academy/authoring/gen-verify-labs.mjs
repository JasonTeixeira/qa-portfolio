// Generate a LAB-verification Workflow (P2 gate). For each authored lab, one agent
// completes the `starter` into a FULL runnable Python solution and returns it verbatim.
// The caller then EXECUTES each returned solution locally with python3 and diffs its
// stdout against the stored `check` — a lab is only real if solution stdout == check
// byte-for-byte. This makes "the lab works" a run result, not an agent's assertion.
//
// Input: a decoded labs-result JSON ({course, labs:[{slug,starter,check,stdin?,solutionNote}]}).
// Usage: node scripts/academy/authoring/gen-verify-labs.mjs <labs-result.json> [chunkSize]

import { readFileSync, writeFileSync } from 'node:fs'

const [inPath, chunkArg] = process.argv.slice(2)
if (!inPath) { console.error('usage: gen-verify-labs.mjs <labs-result.json> [chunkSize]'); process.exit(2) }
const CHUNK = Number(chunkArg) || 5

const r = JSON.parse(readFileSync(inPath, 'utf8'))
const course = r.course
const labs = (r.labs ?? []).map((l) => ({ slug: l.slug, starter: l.starter, stdin: l.stdin ?? null, solutionNote: l.solutionNote ?? '' }))

const script = `export const meta = {
  name: 'verifylab-${course}',
  description: 'Complete + return runnable solutions for ${labs.length} labs (executed locally vs check)',
  phases: [{ title: 'Solve', detail: 'one full solution per lab, throttled' }],
}
phase('Solve')
const LABS = ${JSON.stringify(labs)}
const CHUNK = ${CHUNK}
const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['slug', 'solution'],
  properties: {
    slug: { type: 'string' },
    solution: { type: 'string', description: 'the COMPLETE runnable Python file: the starter with every TODO filled in by a correct implementation. Must run top-to-bottom under plain CPython 3 and print the intended output. Return code only, no markdown fences.' },
  },
}
const promptFor = (lab) => 'Complete this Python lab starter into a FULL, correct, runnable solution. Fill every TODO / NotImplementedError / pass / ellipsis with a correct implementation that satisfies the docstrings and comments. Do NOT change the fixed input data or the pre-written print/main section below the "do not edit" line. The file must run under plain CPython 3 with no external packages.\\n\\n' +
  'INTENDED APPROACH (from the author): ' + (lab.solutionNote || '(none given)') + '\\n\\n' +
  'STARTER:\\n' + lab.starter + '\\n\\n' +
  'Return via StructuredOutput: slug="' + lab.slug + '" and solution = the complete runnable file (code only, no markdown fences).'
const results = []
for (let i = 0; i < LABS.length; i += CHUNK) {
  const wave = LABS.slice(i, i + CHUNK)
  const r = await parallel(wave.map((l) => () => agent(promptFor(l), { label: 'solve:' + l.slug, phase: 'Solve', schema: SCHEMA }).catch(() => null)))
  results.push(...r)
  log('wave ' + (Math.floor(i / CHUNK) + 1) + ': ' + r.filter(Boolean).length + '/' + wave.length + ' solved')
}
return { course: ${JSON.stringify(course)}, solutions: results.filter(Boolean) }
`
const outPath = `/tmp/verifylab-${course}.wf.js`
writeFileSync(outPath, script)
console.log(JSON.stringify({ scriptPath: outPath, course, labs: labs.length }))
