// Generate RAG narration in Jason's Sage voice WITH word-level timestamps.
// Each clip = one visual beat. Saves <name>.mp3 + writes renders/vo/words.json
// ({clip: [{w, start, end}], ...}) so the composition can land every visual on its word.
// Run: node scripts/gen-vo-timestamped.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
let KEY = process.env.ELEVENLABS_API_KEY;
try {
  for (const line of fs.readFileSync(path.join(root, '..', '.env.local'), 'utf8').split('\n')) {
    const m = line.match(/^ELEVENLABS_API_KEY=(.*)$/);
    if (m) KEY = m[1].replace(/^["']|["']$/g, '');
  }
} catch {}
if (!KEY) { console.error('no ELEVENLABS_API_KEY'); process.exit(1); }

const VOICE = 'MJdPGZVWOz3O2iOT7cx5';
const outDir = path.join(root, 'renders', 'vo');
fs.mkdirSync(outDir, { recursive: true });

// One entry per beat. Text tuned so each clip maps cleanly to ONE dense diagram beat.
const scenes = [
  ['01-hook', "Ask a language model about your own documents, and it does something dangerous. It answers with total confidence — and it makes the answer up."],
  ['02-hook2', "There was no refund policy in its training data. So it guessed. In production, that's how you ship a lie to a real customer."],
  ['03-frame', "The fix isn't a bigger, smarter model. It's a simple move called RAG. Retrieve the actual page first — then answer from it, and cite it."],
  ['04-retrieve', "Here's the retrieval half. Split the docs into chunks, embed them as vectors, and for any question, pull the few passages closest in meaning."],
  ['05-answer', "Now hand those passages back to the model and make it answer from them, with a citation. Same question — and now it's right, and it shows its source."],
  ['06-abstain', "But here's the trap everyone ships. Ask something the documents don't cover, and a naive RAG still makes something up — because nothing told it it's allowed to refuse."],
  ['07-abstain2', "So we add one line. If the answer isn't in the retrieved context — don't answer. Just say: that's not in the documents. That single guardrail is the whole difference between a demo and production."],
  ['08-prove', "And we don't take its word for it. A faithfulness check traces every claim back to a source. Green means grounded — a number you can gate a deploy on, not a vibe."],
  ['09-close', "Retrieve. Answer from the source. Refuse when you can't. Verify it's grounded. That's RAG that survives production. Build this exact thing, free, at sageideas dot dev slash academy. Proof, not paper — I'll see you in the next one."],
];

const wordsOut = {};
let total = 0;
for (const [name, text] of scenes) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.45, similarity_boost: 0.85, style: 0.0, use_speaker_boost: true },
    }),
  });
  if (!res.ok) { console.error(`${name}: HTTP ${res.status} ${(await res.text()).slice(0, 160)}`); continue; }
  const j = await res.json();
  fs.writeFileSync(path.join(outDir, `${name}.mp3`), Buffer.from(j.audio_base64, 'base64'));
  total += j.audio_base64.length * 0.75;
  // char alignment -> word start/end
  const a = j.alignment || j.normalized_alignment;
  const chars = a.characters, st = a.character_start_times_seconds, en = a.character_end_times_seconds;
  const words = []; let cur = '', s = null, e = null;
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === ' ' || c === '\n') { if (cur) { words.push({ w: cur, start: +s.toFixed(3), end: +e.toFixed(3) }); cur = ''; s = null; } continue; }
    if (s === null) s = st[i];
    e = en[i]; cur += c;
  }
  if (cur) words.push({ w: cur, start: +s.toFixed(3), end: +e.toFixed(3) });
  wordsOut[name] = { dur: +en[en.length - 1].toFixed(3), words };
  console.log(`  ✓ ${name}  ${wordsOut[name].dur}s  ${words.length} words`);
}
fs.writeFileSync(path.join(outDir, 'words.json'), JSON.stringify(wordsOut, null, 0));
console.log(`done — ${Object.keys(wordsOut).length} clips + words.json (${(total / 1024 / 1024).toFixed(2)}MB)`);
