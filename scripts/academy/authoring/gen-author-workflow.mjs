// Generate a complete authoring Workflow script for ONE course, with its lessons
// + the proven authoring prompt embedded — written to a file so the (verbose)
// lesson list stays OUT of the orchestrator's context. Invoke the result with
// Workflow({scriptPath}).
//
// Usage: node scripts/academy/authoring/gen-author-workflow.mjs <courseSlug> "<Course Title>" [module1of|all]
//   default authors ALL the course's lessons. Optional 3rd arg = comma-separated slugs to author a subset.

import { readFileSync, writeFileSync } from 'node:fs'

const [courseSlug, courseTitle, subsetCsv] = process.argv.slice(2)
if (!courseSlug || !courseTitle) {
  console.error('usage: gen-author-workflow.mjs <courseSlug> "<Course Title>" [slug1,slug2,...]')
  process.exit(2)
}

const manifest = JSON.parse(readFileSync('data/academy/authoring/manifest.json', 'utf8'))
let lessons = manifest
  .filter((x) => x.courseSlug === courseSlug)
  .sort((a, b) => a.moduleSort - b.moduleSort || a.sort - b.sort)
  .map((x) => ({ slug: x.slug, title: x.title, moduleTitle: x.moduleTitle, moduleSort: x.moduleSort, sort: x.sort, sourceMdPath: x.sourceMdPath }))
if (subsetCsv) {
  const want = new Set(subsetCsv.split(',').map((s) => s.trim()))
  lessons = lessons.filter((l) => want.has(l.slug))
}
if (!lessons.length) {
  console.error(`no lessons for course ${courseSlug}${subsetCsv ? ' (subset)' : ''}`)
  process.exit(1)
}

// The proven authoring prompt (backend run scored 96-97), generalized to any domain.
const script = `export const meta = {
  name: 'author-${courseSlug}',
  description: 'Author ${courseSlug} (${lessons.length} lessons) visual-first from source curriculum mds',
  phases: [{ title: 'Author', detail: 'one agent per lesson, grounded in its source md' }],
}
phase('Author')

const COURSE_TITLE = ${JSON.stringify(courseTitle)}
const LESSONS = ${JSON.stringify(lessons)}

const BLOCKS_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['slug', 'blocks'],
  properties: { slug: { type: 'string' }, blocks: { type: 'array', minItems: 12, items: { type: 'object', additionalProperties: true } } },
}

const promptFor = (L) => {
  const isCap = /capstone|mini.?project/i.test(L.title)
  const capClause = isCap
    ? '\\nThis is a ' + (/capstone/i.test(L.title) ? 'CAPSTONE' : 'MINI-PROJECT') + ' lesson: it must SYNTHESIZE the course — roll-call the prior skills of ' + COURSE_TITLE + ' and read as a genuine integration/triumph. The hero diagram shows the assembled system; the code-walkthrough an end-to-end slice; the compare a hollow-vs-real proof.'
    : ''
  return 'Author ONE world-class, VISUAL-FIRST academy lesson, GROUNDED in its real source curriculum. Return the lesson\\'s blocks via StructuredOutput.\\n\\n' +
'STEP 1 — READ the source curriculum for this lesson (Read tool):\\n  ' + L.sourceMdPath + '\\n' +
'Structured lesson pack: Goal, Diagnose, Orient, Model (weak vs gold), Build, Break, Decide, Prove, Explain, Transfer, Standards Grounding, + "Internal Premium Score-Lift Evidence" (Domain-Specific Vocabulary, Worked Expert Example, Exact Artifact Requirement, **Media And Diagram Hook**, Reviewer Challenge, Capstone Connection). USE this real content — NO generic filler. Lesson: "' + L.title + '" (' + COURSE_TITLE + ', ' + L.moduleTitle + ', lesson ' + (L.sort + 1) + ' of module ' + (L.moduleSort + 1) + ' — prerequisite-correct: may rely on earlier lessons in this course).' + capClause + '\\n\\n' +
'STEP 2 — READ to match the house standard EXACTLY (do not edit): scripts/academy/course00/seed-module-1.ts (LOCKED TEMPLATE systemMapBlocks, 95 — mirror its 14-block arc, voice, and folding prose into 3 hero visuals); data/academy/sample-course.ts (the LessonBlock union = the ONLY valid shapes + exact fields); docs/academy/COURSE_TEMPLATE.md (visual-first doctrine + budgets).\\n\\n' +
'STEP 3 — AUTHOR ~14 blocks: sprint-contract (Goal + Exact Artifact Requirement) → mission (vivid 1-2 sentence stake) → context (Orient, <=2 sent) → pretest (Diagnose Q + an "oh!" reveal) → concept (Gold Model, <=40 words) → 3 HERO VISUALS → callout (Standards Grounding / pro insight) → quiz (Reviewer Challenge) → verification (Prove items) → teachback (Explain) → transfer (Transfer) → spaced-review.\\n' +
'3 HERO VISUALS (>=3 required, each the hero of its block):\\n' +
'  1. diagram — from the "Media And Diagram Hook" + the system/flow/structure this skill governs (nodes/edges; kinds service/store/queue/external/client/decision/process; tones default/accent/success/warning/muted; a legend). A REAL ' + COURSE_TITLE + ' diagram.\\n' +
'  2. code-walkthrough — the REAL artifact from Build + Worked Expert Example (code, config, schema, query, script, or structured doc), FILLED, stepped (filename, language \\'ts\\'|\\'python\\'|\\'bash\\', code, steps:[{lines:number[],label,note}]).\\n' +
'  3. compare — Model WEAK (tone \\'warning\\' + verdict) vs GOLD (tone \\'success\\' + verdict).\\n' +
'Optional extra debug/tradeoff if it strengthens the lesson.\\n\\n' +
'RULES: prose to budget (mission <=2 sent, concept <=40 words, context <=2 sent, no wall-of-text). Prerequisite-correct. Real, specific, grounded — zero hollow blocks. No emoji. EXACT union field names (diagram nodes id+label; code-walkthrough steps lines:number[]+label; compare left/right label+lines:string[]; quiz options[]+answer:number).\\n' +
'Return via StructuredOutput: slug="' + L.slug + '", blocks=[...~14 objects...].'
}

const results = await parallel(LESSONS.map((L) => () => agent(promptFor(L), { label: 'author:' + L.slug, phase: 'Author', schema: BLOCKS_SCHEMA }).catch(() => null)))
const ok = results.filter(Boolean)
return {
  authored: ok.length,
  lessons: ok.map((r) => ({ slug: r.slug, blocks: r.blocks.length, visuals: r.blocks.filter((b) => ['diagram', 'viz', 'code-walkthrough', 'compare'].includes(b.type)).length })),
  payload: ok.reduce((acc, r) => { acc[r.slug] = r.blocks; return acc }, {}),
}
`

const outPath = `/tmp/author-${courseSlug}.wf.js`
writeFileSync(outPath, script)
console.log(JSON.stringify({ scriptPath: outPath, course: courseSlug, lessons: lessons.length, slugs: lessons.map((l) => l.slug) }))
