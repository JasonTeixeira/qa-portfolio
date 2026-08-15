/**
 * Run a voice reference through ElevenLabs' voice isolator to strip background
 * noise/static before cloning. Usage:
 *   node --env-file=.env.local scripts/academy/voice/clean-reference.mjs <in.wav> <out.mp3>
 */
import { readFileSync, writeFileSync } from 'node:fs'

const key = process.env.ELEVENLABS_API_KEY
if (!key) { console.error('ELEVENLABS_API_KEY not set'); process.exit(2) }
const inPath = process.argv[2]
const outPath = process.argv[3] || inPath.replace(/\.\w+$/, '-clean.mp3')

const buf = readFileSync(inPath)
const fd = new FormData()
fd.append('audio', new Blob([buf], { type: 'audio/wav' }), 'in.wav')

const r = await fetch('https://api.elevenlabs.io/v1/audio-isolation', {
  method: 'POST',
  headers: { 'xi-api-key': key },
  body: fd,
})
if (!r.ok) { console.error('isolation failed:', r.status, (await r.text()).slice(0, 200)); process.exit(1) }
writeFileSync(outPath, Buffer.from(await r.arrayBuffer()))
console.log('CLEAN=' + outPath)
