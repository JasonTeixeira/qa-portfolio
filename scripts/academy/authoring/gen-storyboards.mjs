// Generate a STORYBOARD-authoring Workflow (Program C1). For each lesson that has a
// `diagram` block, one agent reads the diagram (nodes + edges) + the lesson narrative
// (mission/context/concept/code-walkthrough) and authors a DiagramStoryboard — an
// ordered list of beats {say, nodes, edges, ms} that make the figure explain itself.
//
// HARD CONSTRAINT (enforced again in collect-storyboards): every node id and every
// [from,to] edge a beat references MUST already exist in that diagram. The agent is
// given the exact id/edge lists and told to use them verbatim — never invent one.
//
// Usage: node scripts/academy/authoring/gen-storyboards.mjs <courseSlug> [chunkSize]

import { readFileSync, writeFileSync } from 'node:fs'

const [courseSlug, chunkArg] = process.argv.slice(2)
if (!courseSlug) { console.error('usage: gen-storyboards.mjs <courseSlug> [chunkSize]'); process.exit(2) }
const CHUNK = Number(chunkArg) || 5

const jsonPath = `data/academy/authoring/${courseSlug}.lessons.json`
const course = JSON.parse(readFileSync(jsonPath, 'utf8'))

const clip = (s, n) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n)

// Pull the narrative a diagram illustrates, compactly, so beats track the lesson.
function narrativeOf(blocks) {
  const parts = []
  for (const b of blocks) {
    if (b.type === 'mission' && b.text) parts.push('MISSION: ' + clip(b.text, 300))
    if (b.type === 'context' && b.text) parts.push('CONTEXT: ' + clip(b.text, 400))
    if (b.type === 'concept' && b.text) parts.push('CONCEPT: ' + clip(b.text, 700))
    if (b.type === 'code-walkthrough') {
      if (Array.isArray(b.steps) && b.steps.length) parts.push('WALKTHROUGH: ' + clip(b.steps.map((s) => (typeof s === 'string' ? s : s.caption ?? '')).join(' · '), 500))
    }
  }
  return parts.join('\n').slice(0, 1600)
}

const lessons = Object.entries(course)
  .map(([slug, blocks]) => {
    const d = (blocks ?? []).find((b) => b.type === 'diagram')
    if (!d || !Array.isArray(d.nodes) || !Array.isArray(d.edges)) return null
    return {
      slug,
      title: d.title ?? slug,
      subtitle: d.subtitle ?? '',
      nodes: d.nodes.map((n) => ({ id: n.id, label: n.label, kind: n.kind ?? 'service', tone: n.tone ?? 'default' })),
      edges: d.edges.map((e) => ({ from: e.from, to: e.to, label: e.label ?? '' })),
      narrative: narrativeOf(blocks ?? []),
    }
  })
  .filter(Boolean)

const script = `export const meta = {
  name: 'storyboards-${courseSlug}',
  description: 'Author narration storyboards for ${lessons.length} lesson diagrams (${courseSlug})',
  phases: [{ title: 'Narrate', detail: 'one storyboard per diagram, throttled' }],
}
phase('Narrate')
const LESSONS = ${JSON.stringify(lessons)}
const CHUNK = ${CHUNK}
const SCHEMA = {
  type: 'object', additionalProperties: false, required: ['slug', 'beats'],
  properties: {
    slug: { type: 'string' },
    beats: {
      type: 'array', minItems: 3, maxItems: 8,
      items: {
        type: 'object', additionalProperties: false, required: ['say'],
        properties: {
          say: { type: 'string', description: 'ONE spoken narration sentence for this beat, <=160 chars, plain and concrete' },
          nodes: { type: 'array', items: { type: 'string' }, description: 'node ids to spotlight — ONLY ids from this diagram, verbatim' },
          edges: { type: 'array', items: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2 }, description: '[from,to] edge pairs to spotlight — ONLY edges that exist in this diagram, verbatim' },
          ms: { type: 'number', description: 'beat length in ms (3200-5200); longer for denser lines' },
        },
      },
    },
  },
}
const promptFor = (l) => 'You are narrating a system-architecture diagram so it EXPLAINS ITSELF beat by beat (a voice will later read each beat aloud while the diagram spotlights what it is about).\\n\\n' +
  'DIAGRAM: ' + l.title + (l.subtitle ? ' — ' + l.subtitle : '') + '\\n' +
  'NODES (id → label):\\n' + l.nodes.map((n) => '  ' + n.id + ' → ' + n.label + ' [' + n.kind + '/' + n.tone + ']').join('\\n') + '\\n' +
  'EDGES (from → to · label):\\n' + l.edges.map((e) => '  ' + e.from + ' → ' + e.to + (e.label ? ' · ' + e.label : '')).join('\\n') + '\\n\\n' +
  'WHAT THE LESSON TEACHES:\\n' + (l.narrative || '(use the diagram structure)') + '\\n\\n' +
  'Author an ordered STORYBOARD of 4-7 beats that walks the flow the way a senior engineer would explain it: start at the entry/trigger, follow the path, surface the key decision/risk, end on the core insight. For EACH beat give:\\n' +
  '- say: one concrete spoken sentence (<=160 chars).\\n' +
  '- nodes: the node ids this beat is about — ONLY ids from the NODES list above, copied verbatim.\\n' +
  '- edges: the [from,to] pairs this beat traverses — ONLY edges from the EDGES list above, copied verbatim (each as a 2-element array [from,to]).\\n' +
  '- ms: 3200-5200.\\n\\n' +
  'CRITICAL: never invent a node id or an edge. Every id must appear in the lists above exactly. If a beat is purely conceptual, give it nodes/edges that are genuinely involved (or an empty array). Return via StructuredOutput: slug="' + l.slug + '", beats=[...].'
const results = []
for (let i = 0; i < LESSONS.length; i += CHUNK) {
  const wave = LESSONS.slice(i, i + CHUNK)
  const r = await parallel(wave.map((l) => () => agent(promptFor(l), { label: 'story:' + l.slug, phase: 'Narrate', schema: SCHEMA }).catch(() => null)))
  results.push(...r)
  log('wave ' + (Math.floor(i / CHUNK) + 1) + ': ' + r.filter(Boolean).length + '/' + wave.length + ' narrated')
}
return { course: ${JSON.stringify(courseSlug)}, diagrams: LESSONS.length, storyboards: results.filter(Boolean) }
`
const outPath = `/tmp/storyboards-${courseSlug}.wf.js`
writeFileSync(outPath, script)
console.log(JSON.stringify({ scriptPath: outPath, course: courseSlug, diagrams: lessons.length }))
