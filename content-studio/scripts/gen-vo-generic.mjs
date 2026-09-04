// gen-vo-generic.mjs — timestamped VO for any video from a scenes module.
// Usage: node scripts/gen-vo-generic.mjs --scenes scripts/scenes/evals.mjs --out renders/vo-evals
// scenes module: export default [[key, text], ...]  (one per beat)
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
let KEY = process.env.ELEVENLABS_API_KEY;
try { for (const line of fs.readFileSync(path.join(root, '..', '.env.local'), 'utf8').split('\n')) { const m = line.match(/^ELEVENLABS_API_KEY=(.*)$/); if (m) KEY = m[1].replace(/^["']|["']$/g, ''); } } catch {}
if (!KEY) { console.error('no ELEVENLABS_API_KEY'); process.exit(1); }
const VOICE = 'MJdPGZVWOz3O2iOT7cx5';

const scenes = (await import(pathToFileURL(path.resolve(root, arg('scenes'))).href)).default;
const outDir = path.resolve(root, arg('out'));
fs.mkdirSync(outDir, { recursive: true });

const wordsOut = {};
let okc = 0;
for (const [name, text] of scenes) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps`, {
    method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.45, similarity_boost: 0.85, style: 0.0, use_speaker_boost: true } }),
  });
  if (!res.ok) { console.error(`${name}: HTTP ${res.status} ${(await res.text()).slice(0, 140)}`); continue; }
  const j = await res.json();
  fs.writeFileSync(path.join(outDir, `${name}.mp3`), Buffer.from(j.audio_base64, 'base64'));
  const a = j.alignment || j.normalized_alignment, chars = a.characters, st = a.character_start_times_seconds, en = a.character_end_times_seconds;
  const words = []; let cur = '', s = null, e = null;
  for (let i = 0; i < chars.length; i++) { const c = chars[i]; if (c === ' ' || c === '\n') { if (cur) { words.push({ w: cur, start: +s.toFixed(3), end: +e.toFixed(3) }); cur = ''; s = null; } continue; } if (s === null) s = st[i]; e = en[i]; cur += c; }
  if (cur) words.push({ w: cur, start: +s.toFixed(3), end: +e.toFixed(3) });
  wordsOut[name] = { dur: +en[en.length - 1].toFixed(3), words };
  okc++; console.log(`  ✓ ${name}  ${wordsOut[name].dur}s`);
}
fs.writeFileSync(path.join(outDir, 'words.json'), JSON.stringify(wordsOut));
const tot = Object.values(wordsOut).reduce((a, b) => a + b.dur, 0);
console.log(`done — ${okc}/${scenes.length} clips, ${tot.toFixed(1)}s speech (~${(tot / 60).toFixed(1)}min) -> ${arg('out')}`);
