// render-motion.mjs — the REAL render engine.
// Composition is deterministic + seekable: window.__seek(ms) sets the exact visual
// state at time ms. We capture every frame (no camera move -> zero shake), then
// encode once and mux the narration. Motion lives in the content, not the camera.
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import { mkdirSync, rmSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };

const comp = resolve(ROOT, arg('comp', 'video/rag-motion.html'));
const audio = resolve(ROOT, arg('audio', 'renders/video/vo-full.mp3'));
const out = resolve(ROOT, arg('out', 'renders/video/rag-motion.mp4'));
const dur = +arg('duration', '0');           // seconds to render; 0 = ask the page
const W = +arg('w', 1920), H = +arg('h', 1080), FPS = +arg('fps', 30);

const work = resolve(ROOT, 'renders/video/_frames');
rmSync(work, { recursive: true, force: true }); mkdirSync(work, { recursive: true });
const q = s => `'${String(s).replace(/'/g, "'\\''")}'`;
const sh = c => execSync(c, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();

const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
// inject word-level timestamps so the composition lands each visual on its spoken word
const wordsPath = resolve(ROOT, arg('words', 'renders/vo/words.json'));
try {
  const wj = readFileSync(wordsPath, 'utf8');
  await page.addInitScript(`window.__WORDS=${wj};`);
  console.log('▸ cue timing injected from', arg('words', 'renders/vo/words.json'));
} catch { console.log('▸ no words.json — falling back to numeric delays'); }
try {
  const dj = readFileSync(resolve(ROOT, arg('durs', 'renders/vo/beat-durs.json')), 'utf8');
  await page.addInitScript(`window.__DURS=${dj};`);
  console.log('▸ beat durations (with dwell) injected');
} catch { /* composition falls back to speech-only durations */ }
await page.goto('file://' + comp, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts && document.fonts.ready);
const total = dur > 0 ? dur : await page.evaluate(() => window.__duration || 0);
const frames = Math.round(total * FPS);
console.log(`▸ ${total.toFixed(2)}s · ${frames} frames · ${W}x${H}@${FPS}`);

for (let f = 0; f < frames; f++) {
  await page.evaluate(ms => window.__seek(ms), (f / FPS) * 1000);
  await page.screenshot({ path: `${work}/f-${String(f).padStart(5, '0')}.png`, animations: 'disabled' });
  if (f % 60 === 0) process.stdout.write(`  ${f}/${frames}\r`);
}
await browser.close();
console.log(`\n▸ ${frames} frames captured`);

// encode once (crf 18), mux narration. No zoompan, no xfade — motion is in the frames.
sh(`ffmpeg -y -framerate ${FPS} -i ${q(`${work}/f-%05d.png`)} -i ${q(audio)} ` +
   `-map 0:v -map 1:a -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r ${FPS} ` +
   `-c:a aac -b:a 192k -shortest ${q(out)}`);
rmSync(work, { recursive: true, force: true });
const meta = sh(`ffprobe -v error -show_entries format=duration:stream=width,height -of default=nw=1 ${q(out)}`).trim();
console.log(`✓ ${out}\n${meta}`);
