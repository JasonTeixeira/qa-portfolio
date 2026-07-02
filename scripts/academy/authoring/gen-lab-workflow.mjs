// Generate a per-course LAB-authoring Workflow (P2 interactivity, code-lab lane).
// For each lesson in a CODING course, one agent authors a single grounded, runnable
// `lab` block — { title, summary, starter, check, stdin? } — tied to that lesson's own
// concept/code-walkthrough content. Python only (LabRunner executes Pyodide today); the
// `check` is the EXACT stdout a correct solution prints (deterministic), stored in the
// block and read server-side by verifyLab (never sent to the client). Writes to /tmp.
//
// The lab is authored to be SOLVABLE from the starter + lesson concept, with a check that
// a correct solution's stdout matches exactly. Collect merges it into each lesson's blocks.
//
// Usage: node scripts/academy/authoring/gen-lab-workflow.mjs <courseSlug> [batchNote]

import { readFileSync, writeFileSync } from 'node:fs'

// usage: gen-lab-workflow.mjs <courseSlug> [language=python|sql|js] [chunkSize]
// language arg is optional + order-flexible (a bare number is read as chunkSize, language=python)
const [courseSlug, a2, a3] = process.argv.slice(2)
if (!courseSlug) { console.error('usage: gen-lab-workflow.mjs <courseSlug> [language] [chunkSize]'); process.exit(2) }
const LANGS = { sql: 'sql', js: 'js', ts: 'js', python: 'python' }
let language = 'python', chunkArg
if (a2 && LANGS[a2.toLowerCase()]) { language = LANGS[a2.toLowerCase()]; chunkArg = a3 } else { chunkArg = a2 }
const CHUNK = Number(chunkArg) || 5 // throttle: run this many agents per wave to coexist with other processes

const LANG_LABEL = { python: 'Python', sql: 'SQL', js: 'JavaScript' }[language]
// Per-language execution + output-format contract. The `check` MUST match the runtime output
// byte-for-byte (components/academy/lab/runtimes.ts + run-labs-check.mjs), else the lab can't verify.
const LANG_GUIDE = {
  python: 'The lab runs in-browser via Pyodide (Python 3). starter: imports + a clearly-marked TODO skeleton; a runnable file (a stub that prints a placeholder or nothing is fine). check: the EXACT full stdout a correct solution prints (Python input() prompts do NOT reach stdout). If it reads input(), provide stdin (newline-separated) and reflect it in check.',
  sql: 'The lab is ONE SQL script run against a FRESH in-memory SQLite database (sql.js) — SQLite dialect only, no network/attached files. starter: CREATE TABLE + INSERT fixed inline seed data for a realistic scenario, then a clearly-marked TODO comment where the learner writes the query. check: the final query result set formatted as the column-name header row then one line per row, cells joined by " | " (e.g. "name | total" then "Ada | 415"). You MUST use ORDER BY so row order is deterministic. Keep the result small. NULL renders as an empty string. Do NOT set stdin.',
  js: 'The lab is JavaScript in a sandboxed Web Worker (no DOM/window/network; standard ES2022). Output is via console.log ONLY: each console.log(...args) prints its args joined by a single space, objects/arrays JSON.stringified (console.log("n=",3) -> "n= 3"; console.log({ok:true}) -> \'{"ok":true}\'). starter: fixed inline data + a clear TODO; the tail console.logs the results. check: the EXACT console.log output, one line per call. Do NOT set stdin.',
}[language]

const jsonPath = `data/academy/authoring/${courseSlug}.lessons.json`
const course = JSON.parse(readFileSync(jsonPath, 'utf8'))

// Give each agent the lesson's teaching content (concept + code-walkthrough) so the lab is
// grounded in what the lesson actually taught — not a generic exercise. Extract compactly.
function lessonContext(blocks) {
  const parts = []
  for (const b of blocks) {
    if (b.type === 'concept' && b.body) parts.push('CONCEPT: ' + String(b.body).slice(0, 600))
    if (b.type === 'code-walkthrough') {
      if (b.language) parts.push('WALKTHROUGH-LANG: ' + b.language)
      if (b.code) parts.push('WALKTHROUGH-CODE:\n' + String(b.code).slice(0, 800))
    }
    if (b.type === 'mission' && b.body) parts.push('MISSION: ' + String(b.body).slice(0, 300))
  }
  return parts.join('\n').slice(0, 2000)
}

const lessons = Object.entries(course).map(([slug, blocks]) => ({
  slug,
  hasLab: blocks.some((b) => b.type === 'lab'),
  ctx: lessonContext(blocks),
}))
const todo = lessons.filter((l) => !l.hasLab)

const script = `export const meta = {
  name: 'lab-${courseSlug}',
  description: 'Author runnable ${LANG_LABEL} labs for ${courseSlug} (${todo.length} lessons need one)',
  phases: [{ title: 'Author', detail: 'one grounded ${LANG_LABEL} lab per lesson' }],
}
phase('Author')
const COURSE = ${JSON.stringify(courseSlug)}
const LANGUAGE = ${JSON.stringify(language)}
const LANG_LABEL = ${JSON.stringify(LANG_LABEL)}
const LANG_GUIDE = ${JSON.stringify(LANG_GUIDE)}
const LESSONS = ${JSON.stringify(todo)}
const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['slug', 'title', 'summary', 'starter', 'check'],
  properties: {
    slug: { type: 'string' },
    title: { type: 'string', description: 'the lab task, imperative' },
    summary: { type: 'string', description: 'one sentence: what to build + that they run it in the browser' },
    starter: { type: 'string', description: LANG_LABEL + ' starter: a clearly-marked TODO skeleton the learner completes; runnable/self-contained with fixed inline data' },
    check: { type: 'string', description: 'the EXACT output a CORRECT solution produces, in the format the runtime prints. Compared server-side (case-insensitive substring). Deterministic.' },
    stdin: { type: 'string', description: 'Python only: optional newline-separated stdin if the lab uses input(); omit otherwise' },
    solutionNote: { type: 'string', description: 'one line: the intended correct solution, so a reviewer can confirm starter+check are consistent' },
  },
}
const promptFor = (lesson) => 'You are authoring ONE runnable, self-checking ' + LANG_LABEL + ' lab for an academy lesson. It must be SOLVABLE from the starter plus what the lesson taught, and DETERMINISTIC (same output every run).\\n\\n' +
  'RUNTIME + OUTPUT CONTRACT (the check MUST match this exactly): ' + LANG_GUIDE + '\\n\\n' +
  'LESSON: ' + lesson.slug + ' (course ' + COURSE + ')\\nWHAT THE LESSON TAUGHT:\\n' + lesson.ctx + '\\n\\n' +
  'DESIGN THE LAB:\\n' +
  '- The task must exercise THIS lesson\\'s core concept (not a generic warm-up).\\n' +
  '- starter: self-contained with fixed inline data and a clearly-marked TODO the learner fills in.\\n' +
  '- check: the EXACT output a CORRECT completed solution produces, in the runtime output format above. Keep it small and unambiguous.\\n' +
  '- Verify mentally: does the intended solution, run on the starter, produce check EXACTLY (in the specified format)? State that solution in solutionNote.\\n\\n' +
  'Return via StructuredOutput: slug="' + lesson.slug + '", title, summary, starter, check, stdin (Python only, if used), solutionNote.'
const CHUNK = ${CHUNK} // throttled waves to coexist with the concurrent design process
const results = []
for (let i = 0; i < LESSONS.length; i += CHUNK) {
  const wave = LESSONS.slice(i, i + CHUNK)
  const r = await parallel(wave.map((l) => () => agent(promptFor(l), { label: 'lab:' + l.slug, phase: 'Author', schema: SCHEMA }).catch(() => null)))
  results.push(...r)
  log('wave ' + (Math.floor(i / CHUNK) + 1) + ': ' + r.filter(Boolean).length + '/' + wave.length + ' authored')
}
// stamp the language on every lab so collect-labs / LabRunner / run-labs-check route correctly
const ok = results.filter(Boolean).map((l) => ({ ...l, language: LANGUAGE }))
return { course: COURSE, needed: LESSONS.length, authored: ok.length, labs: ok }
`
const outPath = `/tmp/lab-${courseSlug}.wf.js`
writeFileSync(outPath, script)
console.log(JSON.stringify({ scriptPath: outPath, course: courseSlug, lessonsNeedingLab: todo.length, alreadyHaveLab: lessons.length - todo.length }))
