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

const [courseSlug] = process.argv.slice(2)
if (!courseSlug) { console.error('usage: gen-lab-workflow.mjs <courseSlug>'); process.exit(2) }

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
  description: 'Author runnable Python labs for ${courseSlug} (${todo.length} lessons need one)',
  phases: [{ title: 'Author', detail: 'one grounded lab per lesson' }],
}
phase('Author')
const COURSE = ${JSON.stringify(courseSlug)}
const LESSONS = ${JSON.stringify(todo)}
const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['slug', 'title', 'summary', 'starter', 'check'],
  properties: {
    slug: { type: 'string' },
    title: { type: 'string', description: 'the lab task, imperative (e.g. "Implement binary search")' },
    summary: { type: 'string', description: 'one sentence: what to build + that they run it in the browser' },
    starter: { type: 'string', description: 'Python starter: imports + a clear TODO skeleton the learner completes; must be a runnable file (a stub that prints nothing or a placeholder is fine)' },
    check: { type: 'string', description: 'the EXACT, complete stdout a CORRECT solution prints — deterministic, no trailing prompt text. This is compared verbatim server-side.' },
    stdin: { type: 'string', description: 'optional newline-separated stdin if the lab uses input(); omit if none' },
    solutionNote: { type: 'string', description: 'one line: the intended correct solution, so a reviewer can confirm starter+check are consistent' },
  },
}
const promptFor = (lesson) => 'You are authoring ONE runnable, self-checking Python lab for an academy lesson. The lab runs in-browser via Pyodide (Python 3 only). It must be SOLVABLE from the starter plus what the lesson taught, and DETERMINISTIC (same output every run).\\n\\n' +
  'LESSON: ' + lesson.slug + ' (course ' + COURSE + ')\\nWHAT THE LESSON TAUGHT:\\n' + lesson.ctx + '\\n\\n' +
  'DESIGN THE LAB:\\n' +
  '- The task must exercise THIS lesson\\'s core concept (not a generic warm-up).\\n' +
  '- starter: a runnable Python file with imports and a clearly-marked TODO the learner fills in. Include any fixed input data inline so the lab is self-contained. The starter itself may print a placeholder or nothing.\\n' +
  '- check: the EXACT full stdout that a CORRECT completed solution prints — every line, verbatim, no extra prompt text (Python input() prompts do not reach stdout). It is compared byte-for-byte server-side. Keep output small and unambiguous (e.g. print a computed result, or a few asserted lines).\\n' +
  '- Prefer printing a concrete computed answer over interactive I/O. If you must read input(), provide stdin (newline-separated) and make check reflect the resulting output.\\n' +
  '- Verify mentally: does the intended solution, run on the starter, print check EXACTLY? State that solution in solutionNote.\\n\\n' +
  'Return via StructuredOutput: slug="' + lesson.slug + '", title, summary, starter, check, stdin (if used), solutionNote.'
const results = await parallel(LESSONS.map((l) => () => agent(promptFor(l), { label: 'lab:' + l.slug, phase: 'Author', schema: SCHEMA }).catch(() => null)))
const ok = results.filter(Boolean)
return { course: COURSE, needed: LESSONS.length, authored: ok.length, labs: ok }
`
const outPath = `/tmp/lab-${courseSlug}.wf.js`
writeFileSync(outPath, script)
console.log(JSON.stringify({ scriptPath: outPath, course: courseSlug, lessonsNeedingLab: todo.length, alreadyHaveLab: lessons.length - todo.length }))
