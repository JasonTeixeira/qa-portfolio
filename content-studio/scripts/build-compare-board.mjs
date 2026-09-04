// Build compare-board.html: dark-premium (app/site) vs bright-friendly (content) side by side.
// Run: node scripts/build-compare-board.mjs
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const tmp = '/tmp/cb'; fs.mkdirSync(tmp, { recursive: true })
const uri = (rel, max = 1000) => {
  const src = path.join(root, 'renders', rel)
  if (!fs.existsSync(src)) return null
  const out = path.join(tmp, rel.replace(/[\/]/g, '_').replace(/\.png$/, '.jpg'))
  execSync(`sips -Z ${max} -s format jpeg ${JSON.stringify(src)} --out ${JSON.stringify(out)}`, { stdio: 'ignore' })
  return `data:image/jpeg;base64,${fs.readFileSync(out).toString('base64')}`
}
const fig = (rel, label, cls) => {
  const u = uri(rel)
  return `<figure>${u ? `<img src="${u}" alt="${label}"/>` : `<div class="miss">${rel}</div>`}<figcaption><em class="tag ${cls}">${cls === 'd' ? 'Dark premium' : 'Bright friendly'}</em>${label}</figcaption></figure>`
}
const css = `
:root{--bg:#0C0D11;--ink:#F4F2EC;--muted:#A9ABB8;--faint:#6C6E7C;--line:rgba(255,255,255,.09);--accent-ink:#9AA8FF;
--sans:-apple-system,'Segoe UI',Roboto,sans-serif;--mono:ui-monospace,'SF Mono',Menlo,monospace;--serif:'Iowan Old Style',Georgia,serif;}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased}
.wrap{max-width:1160px;margin:0 auto;padding:52px 22px 80px}
.kick{font-family:var(--mono);font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:var(--accent-ink)}
h1{font-family:var(--serif);font-size:clamp(30px,5vw,50px);font-weight:600;letter-spacing:-.02em;margin:12px 0 0}
.lede{color:var(--muted);font-size:17px;max-width:70ch;margin-top:14px;line-height:1.55}.lede b{color:var(--ink)}
h2{font-size:20px;font-weight:700;margin:46px 0 6px;display:flex;align-items:center;gap:10px}
.sub{color:var(--faint);font-family:var(--mono);font-size:12px;margin-bottom:20px}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:22px}
.trip{display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px}
figure{background:#15161C;border:1px solid var(--line);border-radius:12px;overflow:hidden}
figure img{display:block;width:100%;height:auto}
figcaption{display:flex;align-items:center;gap:10px;padding:12px 15px;font-size:13px;color:var(--muted);font-family:var(--mono)}
.tag{font-style:normal;font-size:10px;letter-spacing:.08em;text-transform:uppercase;padding:3px 8px;border-radius:5px;white-space:nowrap;font-weight:600}
.tag.d{color:#9AA8FF;border:1px solid rgba(122,140,255,.4);background:rgba(122,140,255,.08)}
.tag.b{color:#12141C;background:#FFC94A}
.note{margin-top:14px;color:var(--faint);font-size:13.5px;font-family:var(--mono);line-height:1.6}
footer{margin-top:52px;border-top:1px solid var(--line);padding-top:26px}
.foothead{font-family:var(--serif);font-size:22px;font-weight:600;margin-bottom:12px}
.rec{color:var(--muted);font-size:15.5px;line-height:1.65;max-width:76ch}.rec b{color:var(--ink)}
@media(max-width:720px){.pair,.trip{grid-template-columns:1fr}}
`
const ent = (s) => s.replaceAll('·', '&middot;').replaceAll('—', '&mdash;').replaceAll('’', '&rsquo;').replaceAll('×', '&times;').replaceAll('→', '&rarr;')
const html = `<div class="wrap">
<div class="kick">Sage Academy · Design Systems</div>
<h1>Dark premium vs bright friendly.</h1>
<p class="lede">The two visual worlds, side by side, so you can compare. <b>Left/dark</b> = the app &amp; site you've already built (Atlas, funnel, homepage) — sophisticated, serious, signals "proof". <b>Right/bright</b> = the new content look — colorful, friendly, made to win in a feed. The question is whether the app becomes bright too, or stays dark while content goes bright.</p>

<h2>1 · Same video, two moods</h2>
<div class="sub">the sharpest comparison — identical topics, two systems</div>
<div class="pair">
  ${fig('thumb-rag-hero.png', 'RAG — cinematic', 'd')}
  ${fig('hybrids/h01.png', 'RAG — isometric', 'b')}
  ${fig('thumb-evals.png', 'Evals — proof card', 'd')}
  ${fig('hybrids/h03.png', 'Evals — isometric', 'b')}
</div>

<h2>2 · The product today — dark premium</h2>
<div class="sub">this is what "keep the app dark" preserves</div>
<div class="trip">
  ${fig('compare/app-logo-nav.png', 'Academy homepage', 'd')}
  ${fig('compare/app-atlas-v2.png', 'Atlas intake', 'd')}
  ${fig('compare/app-splash.png', 'Hero', 'd')}
</div>
<div class="note">Refined, editorial, Fraunces serif, restrained — it reads "serious &amp; trustworthy," which is exactly the "proof, not paper" signal for a paid product.</div>

<h2>3 · The content layer — bright friendly</h2>
<div class="sub">covers, thumbnails, social — made to grab attention</div>
<div class="trip">
  ${fig('hybrids/h06.png', 'Find the bug', 'b')}
  ${fig('hybrids/h08.png', 'What is MCP?', 'b')}
  ${fig('hybrids/h12.png', 'How AI thinks', 'b')}
</div>

<footer>
<div class="foothead">My recommendation: two-layer.</div>
<p class="rec">Keep the <b>app &amp; site dark-premium</b> (it's built, it's sophisticated, and for a <b>paid</b> academy that "serious" signal converts) and use the <b>bright-friendly look for everything that lives in a feed</b> — YouTube, IG, playlist art, course covers, social. They share the same accent colors and the cloud logo, so they read as one family — the classic "premium product, friendly marketing" split most big brands run. A full bright rebrand of the app is possible, but it softens the premium signal and re-skins everything we've shipped. Tell me which way, and I'll proceed. Teaching diagrams are already decided: code-driven &amp; precise, wearing this warm palette.</p>
</footer>
</div>`
fs.writeFileSync(path.join(root, 'compare-board.html'), `<style>${css}</style>\n${ent(html)}\n`)
console.log('compare-board.html:', Math.round(fs.statSync(path.join(root, 'compare-board.html')).size / 1024), 'KB')
