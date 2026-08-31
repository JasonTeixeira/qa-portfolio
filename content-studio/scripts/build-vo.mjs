// build-vo.mjs — pace the narration for absorption.
// Pads each beat's VO clip with trailing SILENCE (dwell time) so the finished
// diagram holds on screen after its sentence ends, then concatenates to vo-full.mp3
// and writes beat-durs.json (padded duration per beat) for the composition.
// Run: node scripts/build-vo.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const voDir = path.join(root, arg('in', 'renders/vo'));
const outMp3 = path.join(root, arg('out', 'renders/video/vo-full.mp3'));
const dursOut = path.join(root, arg('durs', path.join(arg('in', 'renders/vo'), 'beat-durs.json')));
const held = path.join(voDir, '_held');
fs.mkdirSync(held, { recursive: true });
const HOLD = +arg('hold', '2.4'); // uniform dwell seconds after each beat's narration
// optional per-beat overrides for the 9-beat short; else uniform HOLD
const HOLDS_9 = [2.4, 2.4, 2.8, 3.6, 2.8, 3.0, 3.2, 3.6, 2.8];

const clips = fs.readdirSync(voDir).filter(f => /^\d.*\.mp3$/.test(f)).sort();
const HOLDS = clips.length === 9 ? HOLDS_9 : clips.map(() => HOLD);
const durs = [];
const listFile = path.join(held, 'concat.txt');
let list = '';
clips.forEach((c, i) => {
  const inp = path.join(voDir, c);
  const speech = +execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${inp}"`).toString().trim();
  const hold = HOLDS[i] ?? 2.5;
  const out = path.join(held, c);
  // pad end with `hold` seconds of digital silence
  execSync(`ffmpeg -y -i "${inp}" -af "apad=pad_dur=${hold}" -c:a libmp3lame -q:a 3 "${out}"`, { stdio: 'ignore' });
  const total = +execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${out}"`).toString().trim();
  durs.push(+total.toFixed(3));
  list += `file '${out}'\n`;
  console.log(`  ${c}: ${speech.toFixed(1)}s speech + ${hold}s hold = ${total.toFixed(1)}s`);
});
fs.writeFileSync(listFile, list);
execSync(`ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${outMp3}"`, { stdio: 'ignore' });
fs.writeFileSync(dursOut, JSON.stringify(durs));
const tot = durs.reduce((a, b) => a + b, 0);
console.log(`\n✓ ${path.basename(outMp3)} — ${durs.length} beats, ${tot.toFixed(1)}s total (~${(tot / 60).toFixed(1)}min)`);
console.log(`✓ ${path.basename(dursOut)} written`);
