// Direct apply for python-basics (4 lessons authored from scratch, no manifest).
// Reads data/academy/authoring/python-basics.lessons.json ({slug: LessonBlock[]}),
// validates every block, and updates ONLY the blocks column on the existing DB rows
// (title/module/sort preserved). Dry-run by default; --apply writes.
//
// Usage: npx tsx --env-file=.env.local scripts/academy/authoring/apply-python-basics.ts [--apply]

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { validateBlocks, countVisualBlocks } from '../../../lib/academy/validate-blocks'

const COURSE = 'python-basics'
const apply = process.argv.includes('--apply')

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  const sb = createClient(url, key, { auth: { persistSession: false } })

  const payload = JSON.parse(readFileSync(`data/academy/authoring/${COURSE}.lessons.json`, 'utf8')) as Record<string, unknown[]>
  const { data: rows } = await sb.from('academy_lessons').select('slug,title,module_title,module_sort,sort').eq('course_slug', COURSE)
  const meta = new Map((rows ?? []).map((r) => [r.slug, r]))

  const errors: string[] = []
  const plans: { slug: string; blocks: unknown[]; visuals: number }[] = []
  for (const [slug, blocks] of Object.entries(payload)) {
    if (!meta.has(slug)) { errors.push(`${slug}: no DB row for course ${COURSE}`); continue }
    const v = validateBlocks(blocks)
    if (!v.ok) { errors.push(`${slug}: ${v.errors.join('; ')}`); continue }
    const visuals = countVisualBlocks(v.blocks)
    if (visuals < 3) console.warn(`  ! ${slug}: only ${visuals} visual blocks (<3)`)
    plans.push({ slug, blocks: v.blocks, visuals })
  }
  if (errors.length) {
    console.error('VALIDATION FAILED (nothing written):')
    for (const e of errors) console.error('  ✗ ' + e)
    process.exit(1)
  }

  if (!apply) {
    console.log(`DRY RUN — ${COURSE} (${plans.length} lessons). No DB writes.`)
    for (const p of plans) console.log(`  • ${p.slug.padEnd(22)} blocks=${(p.blocks.length + '').padStart(2)} visual=${p.visuals} validation=OK`)
    console.log('Re-run with --apply to write (updates blocks only, preserves metadata).')
    return
  }

  let applied = 0
  for (const p of plans) {
    const m = meta.get(p.slug)!
    const { error } = await sb.from('academy_lessons').update({ blocks: p.blocks, status: 'published' }).eq('course_slug', COURSE).eq('slug', p.slug)
    if (error) { console.error(`  ✗ ${p.slug}: ${error.message}`); continue }
    applied++
    void m
  }
  console.log(`APPLIED — ${COURSE}: updated ${applied} lesson(s) (blocks only, metadata preserved).`)
}

main().catch((e) => { console.error(e); process.exit(1) })
