// Export a course's live lesson blocks from Supabase into the authoring working
// copy (data/academy/authoring/<course>.lessons.json), keyed slug → blocks[] —
// the same format apply-course.ts / gen-storyboards.mjs read. Used to seed a local
// working copy for a course that has lessons in Supabase but no local JSON yet.
// Real data only — a straight copy of what's live, no transformation.
//
// Usage: node scripts/academy/authoring/export-course-json.mjs <courseSlug>

import { createClient } from '@supabase/supabase-js'
import { writeFileSync, readFileSync } from 'node:fs'
import { config } from 'dotenv'

config({ path: '.env.local' })
const [courseSlug] = process.argv.slice(2)
if (!courseSlug) { console.error('usage: export-course-json.mjs <courseSlug>'); process.exit(2) }

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const { data, error } = await sb
  .from('academy_lessons')
  .select('slug, title, module_title, module_sort, sort, blocks')
  .eq('course_slug', courseSlug)
  .order('module_sort', { ascending: true })
  .order('sort', { ascending: true })
if (error) { console.error('query failed: ' + error.message); process.exit(1) }
if (!data?.length) { console.error(`no lessons for ${courseSlug}`); process.exit(1) }

const out = {}
for (const l of data) out[l.slug] = l.blocks ?? []
const jsonPath = `data/academy/authoring/${courseSlug}.lessons.json`
writeFileSync(jsonPath, JSON.stringify(out, null, 2))

// Seed the upsert manifest for this course (from real Supabase metadata) so
// apply-course.ts can persist — these lessons already exist, so it's not a stray row.
const manPath = 'data/academy/authoring/manifest.json'
const manifest = JSON.parse(readFileSync(manPath, 'utf8'))
const have = new Set(manifest.filter((e) => e.courseSlug === courseSlug).map((e) => e.slug))
let added = 0
for (const l of data) {
  if (have.has(l.slug)) continue
  manifest.push({
    courseSlug,
    slug: l.slug,
    title: l.title ?? l.slug,
    moduleTitle: l.module_title ?? 'Module 1',
    moduleSort: l.module_sort ?? 0,
    sort: l.sort ?? 0,
    sourceMdPath: `supabase:${courseSlug}/${l.slug}`,
  })
  added++
}
if (added) writeFileSync(manPath, JSON.stringify(manifest, null, 2))

const diagrams = data.filter((l) => (l.blocks ?? []).some((b) => b.type === 'diagram')).length
console.log(JSON.stringify({ wrote: jsonPath, lessons: data.length, withDiagram: diagrams, manifestAdded: added }))
