/**
 * Move generated narration audio from local public/academy/voice/* into Supabase
 * Storage (public bucket 'academy-voice') so it deploys to production, and rewrite
 * beat.audio URLs in the authoring JSONs to the storage public URL. Idempotent
 * (upsert). After this: re-apply each course so Supabase points at storage.
 *   node --env-file=.env.local scripts/academy/voice/migrate-to-storage.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const BUCKET = 'academy-voice'
const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}`
const ROOT = 'public/academy/voice'

// 1. ensure the public bucket exists
{
  const { error } = await sb.storage.createBucket(BUCKET, { public: true, fileSizeLimit: '10MB' })
  if (error && !/already exists/i.test(error.message)) { console.error('bucket:', error.message); process.exit(1) }
  console.log(`bucket '${BUCKET}' ready`)
}

// 2. upload every mp3 (upsert = idempotent)
const courses = readdirSync(ROOT).filter((d) => statSync(join(ROOT, d)).isDirectory())
let up = 0, fail = 0
for (const c of courses) {
  const files = readdirSync(join(ROOT, c)).filter((f) => f.endsWith('.mp3'))
  for (const f of files) {
    const { error } = await sb.storage.from(BUCKET).upload(`${c}/${f}`, readFileSync(join(ROOT, c, f)), { contentType: 'audio/mpeg', upsert: true })
    if (error) { fail++; console.error('  fail', `${c}/${f}`, error.message) } else up++
  }
  console.log(`  uploaded ${c} (${files.length} files)`)
}
console.log(`\nuploaded ${up} files (${fail} failed)`)

// 3. rewrite beat.audio URLs in authoring JSONs: /academy/voice/<c>/ → storage URL
let rewritten = 0
for (const c of courses) {
  const jp = `data/academy/authoring/${c}.lessons.json`
  if (!existsSync(jp)) continue
  const before = readFileSync(jp, 'utf8')
  const after = before.split(`/academy/voice/${c}/`).join(`${BASE}/${c}/`)
  if (after !== before) { writeFileSync(jp, after); rewritten++ }
}
console.log(`rewrote audio URLs in ${rewritten} course JSONs → ${BASE}/<course>/`)
console.log(`\nNext: re-apply each course so Supabase points at storage:`)
console.log(`  ${courses.join(' ')}`)
