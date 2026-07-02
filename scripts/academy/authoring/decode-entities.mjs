// Deep HTML-entity decoder for lab Workflow outputs. Some agents emit single-encoded
// (&lt;) and some double-encoded (&amp;lt;) entities, so decoding must LOOP until stable.
// Reads a task-output JSON ({result:{...}} or the result directly), recursively decodes
// every string, and writes the result object. Shape-agnostic: works for author outputs
// ({course, labs:[...]}) and verify outputs ({course, solutions:[...]}) alike.
//
// Usage: node scripts/academy/authoring/decode-entities.mjs <task-output.json> <out.json>

import { readFileSync, writeFileSync } from 'node:fs'

const [inPath, outPath] = process.argv.slice(2)
if (!inPath || !outPath) { console.error('usage: decode-entities.mjs <in.json> <out.json>'); process.exit(2) }

const ENT = [[/&lt;/g, '<'], [/&gt;/g, '>'], [/&quot;/g, '"'], [/&#0?39;/g, "'"], [/&apos;/g, "'"], [/&amp;/g, '&']]
function decodeOnce(s) { let r = s; for (const [re, ch] of ENT) r = r.replace(re, ch); return r }
function decode(s) {
  // loop until no further change (handles &amp;lt; -> &lt; -> < ), cap iterations
  let prev = s
  for (let i = 0; i < 6; i++) { const next = decodeOnce(prev); if (next === prev) break; prev = next }
  return prev
}
function deep(node) {
  if (typeof node === 'string') return decode(node)
  if (Array.isArray(node)) return node.map(deep)
  if (node && typeof node === 'object') { const o = {}; for (const [k, v] of Object.entries(node)) o[k] = deep(v); return o }
  return node
}

const raw = JSON.parse(readFileSync(inPath, 'utf8'))
const result = raw.result ?? raw
const decoded = deep(result)
writeFileSync(outPath, JSON.stringify(decoded))

// report residual entities as a sanity check
const residual = (JSON.stringify(decoded).match(/&(lt|gt|amp|quot|apos|#0?39);/g) || []).length
const n = (decoded.labs?.length ?? decoded.solutions?.length ?? 0)
console.log(JSON.stringify({ out: outPath, course: decoded.course, items: n, residualEntities: residual }))
