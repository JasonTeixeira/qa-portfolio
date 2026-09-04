// Generate warm, conversational voice samples across models/settings to pick the
// teaching voice. Run: node scripts/gen-voice-test.mjs
import fs from 'node:fs'
import path from 'node:path'
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
let KEY
for (const line of fs.readFileSync(path.join(root, '..', '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^ELEVENLABS_API_KEY=(.*)$/); if (m) KEY = m[1].replace(/^["']|["']$/g, '')
}
const VOICE = 'MJdPGZVWOz3O2iOT7cx5'
const out = path.join(root, 'renders', 'voicetest'); fs.mkdirSync(out, { recursive: true })

// Warm, 1:1 rewrite of the RAG hook — curiosity gap + productive failure, then tease the a-ha.
const warm = "Okay — watch this. I'm gonna ask this AI a question about my own company's docs. Simple one: what's our refund window? ... And look what it says. Thirty days. Confident. Clean. ... One problem. We don't have a thirty-day policy. It made that up. It didn't lie on purpose — it just didn't have the answer, so it guessed. And here's the thing that took me way too long to learn: the fix isn't a smarter model. It's teaching it to say three words almost no AI will say. I. Don't. Know. That's RAG — let me show you.";

const variants = [
  { name: 'A_v3conv', model: 'eleven_v3_conversational', text: warm, settings: { stability: 0.5, similarity_boost: 0.8 } },
  { name: 'B_v3', model: 'eleven_v3', text: '[warm][thoughtful] ' + warm, settings: { stability: 0.5, similarity_boost: 0.8 } },
  { name: 'C_mv2warm', model: 'eleven_multilingual_v2', text: warm, settings: { stability: 0.4, similarity_boost: 0.75, style: 0.45, use_speaker_boost: true } },
]

for (const v of variants) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: v.text, model_id: v.model, voice_settings: v.settings }),
  })
  if (!res.ok) { console.error(`${v.name}: HTTP ${res.status} ${(await res.text()).slice(0, 160)}`); continue }
  const buf = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(path.join(out, v.name + '.mp3'), buf)
  console.log(`  ✓ ${v.name} (${v.model})  ${(buf.length / 1024).toFixed(0)}KB`)
}
console.log('done → renders/voicetest/')
