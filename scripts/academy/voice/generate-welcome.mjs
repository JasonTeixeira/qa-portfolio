/**
 * Generate the welcome + onboarding voiceovers in Jason's cloned voice, upload to
 * Supabase Storage (academy-voice/welcome/), and write a manifest the UI wires to.
 *   node --env-file=.env.local scripts/academy/voice/generate-welcome.mjs [--apply]
 * Dry run (default) prints the char cost; --apply generates + uploads.
 */
import { createClient } from '@supabase/supabase-js'
import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const APPLY = process.argv.includes('--apply')
const OUT = 'public/academy/voice/welcome'
const BUCKET = 'academy-voice'
const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}`

// Approved scripts — plain-language, in Jason's voice.
const SCRIPTS = {
  welcome:
    "Hey — welcome to Sage Academy. I'm Jason; I built this. Here's the honest version of what you're getting into: most platforms hand you a certificate for watching videos. We don't. Here you learn by doing — you'll frame a real problem, build the fix, and prove it holds with a check you can't hand-wave. Every course ends in evidence a reviewer would actually trust, not a badge. Start with one lesson, ship one proof — that's the whole game. Let's go.",
  'onboard-goal': "First, tell me what you're aiming at, and I'll point you at the right track — no filler.",
  'onboard-loop': "Every lesson runs the same loop senior engineers run on autopilot: frame it, map it, decide under tradeoffs, prove it. You'll feel it by lesson two.",
  'onboard-first-win': "Here's your first lesson — small on purpose. Get one proof holding. That's the moment this clicks.",
  'onboard-ledger': "Everything you prove lands in your ledger — that's your real portfolio. Pick any claim, follow the artifact. It's what makes a certificate here actually mean something.",
}

const chars = Object.values(SCRIPTS).reduce((n, t) => n + t.length, 0)
console.log(`welcome/onboarding: ${Object.keys(SCRIPTS).length} lines · ${chars} characters`)
if (!APPLY) { console.log('DRY RUN — re-run with --apply to generate + upload.'); process.exit(0) }

const key = process.env.ELEVENLABS_API_KEY, voiceId = process.env.ELEVENLABS_VOICE_ID
async function synth(text) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true } }),
  })
  if (!r.ok) throw new Error(`TTS ${r.status}: ${(await r.text()).slice(0, 160)}`)
  return Buffer.from(await r.arrayBuffer())
}
const durMs = (p) => { const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], { encoding: 'utf8' }); const s = parseFloat((r.stdout || '').trim()); return Number.isFinite(s) ? Math.round(s * 1000) : null }

mkdirSync(OUT, { recursive: true })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const manifest = existsSync(join(OUT, 'manifest.json')) ? JSON.parse(readFileSync(join(OUT, 'manifest.json'), 'utf8')) : {}
for (const [id, text] of Object.entries(SCRIPTS)) {
  const file = join(OUT, `${id}.mp3`)
  writeFileSync(file, await synth(text))
  await sb.storage.from(BUCKET).upload(`welcome/${id}.mp3`, readFileSync(file), { contentType: 'audio/mpeg', upsert: true })
  manifest[id] = { url: `${BASE}/welcome/${id}.mp3`, ms: durMs(file), text }
  console.log(`  ${id} · ${manifest[id].ms}ms`)
  await new Promise((r) => setTimeout(r, 250))
}
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log(`\nDONE — welcome/onboarding audio in ${OUT} + storage. Manifest: ${OUT}/manifest.json`)
