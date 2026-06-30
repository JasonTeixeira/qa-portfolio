// Collect an authoring Workflow's payload into a course lessons JSON.
// Keeps the (large) authored blocks out of the orchestrator's context: reads the
// Workflow task-output file, extracts result.payload ({slug: blocks[]}), MERGES it
// into data/academy/authoring/<courseSlug>.lessons.json, and prints only counts.
//
// Usage: node scripts/academy/authoring/collect-payload.mjs <taskOutputFile> <courseSlug>

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const [outputFile, courseSlug] = process.argv.slice(2)
if (!outputFile || !courseSlug) {
  console.error('usage: collect-payload.mjs <taskOutputFile> <courseSlug>')
  process.exit(2)
}

const raw = readFileSync(outputFile, 'utf8')
const top = JSON.parse(raw)
let result = top.result ?? top
if (typeof result === 'string') result = JSON.parse(result)
const payload = result.payload
if (!payload || typeof payload !== 'object') {
  console.error('no payload in result; keys:', Object.keys(result))
  process.exit(1)
}

const flat = JSON.stringify(payload)
const entities = ['&lt;', '&gt;', '&amp;'].filter((e) => flat.includes(e))

const dest = `data/academy/authoring/${courseSlug}.lessons.json`
if (!existsSync(dirname(dest))) mkdirSync(dirname(dest), { recursive: true })
const cur = existsSync(dest) ? JSON.parse(readFileSync(dest, 'utf8')) : {}
const before = Object.keys(cur).length
Object.assign(cur, payload)
writeFileSync(dest, JSON.stringify(cur, null, 2))

const VISUAL = new Set(['diagram', 'viz', 'code-walkthrough', 'compare'])
const rows = Object.entries(payload).map(([slug, blocks]) => ({
  slug,
  blocks: blocks.length,
  visuals: blocks.filter((b) => VISUAL.has(b?.type)).length,
}))
const lowVisual = rows.filter((r) => r.visuals < 3)

console.log(JSON.stringify({
  merged: Object.keys(payload).length,
  totalInFile: Object.keys(cur).length,
  added: Object.keys(cur).length - before,
  htmlEntities: entities,
  lowVisualLessons: lowVisual,
  dest,
}, null, 2))
process.exit(entities.length === 0 && lowVisual.length === 0 ? 0 : 1)
