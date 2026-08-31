// build-vo.mjs — pace the narration for absorption.
// Pads each beat's VO clip with trailing SILENCE (dwell time) so the finished
// diagram holds on screen after its sentence ends, then concatenates to vo-full.mp3
// and writes beat-durs.json (padded duration per beat) for the composition.
// Run: node scripts/build-vo.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const voDir = path.join(root, 'renders', 'vo');
const outDir = path.join(root, 'renders', 'video');
const held = path.join(voDir, '_held');
fs.mkdirSync(held, { recursive: true });

// dwell seconds AFTER each beat's narration. More for dense data-viz beats.
//        1    2    3    4(scatter) 5    6    7    8(proof) 9(close)
const HOLDS = [2.4, 2.4, 2.8, 3.6, 2.8, 3.0, 3.2, 3.6, 2.8];

const clips = fs.readdirSync(voDir).filter(f => /^0.*\.mp3$/.test(f)).sort();
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
execSync(`ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${path.join(outDir, 'vo-full.mp3')}"`, { stdio: 'ignore' });
fs.writeFileSync(path.join(voDir, 'beat-durs.json'), JSON.stringify(durs));
const tot = durs.reduce((a, b) => a + b, 0);
console.log(`\n✓ vo-full.mp3 rebuilt — ${durs.length} beats, ${tot.toFixed(1)}s total (was 82.7s)`);
console.log(`✓ beat-durs.json → [${durs.join(', ')}]`);
