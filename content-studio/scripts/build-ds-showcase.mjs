import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const tmp = '/tmp/dss'; fs.mkdirSync(tmp, { recursive: true })
const uri = (rel, max = 900) => {
  const src = path.join(root, 'renders', rel)
  if (!fs.existsSync(src)) return null
  const out = path.join(tmp, rel.replace(/[\/ ]/g, '_').replace(/\.png$/, '.jpg'))
  execSync(`sips -Z ${max} -s format jpeg ${JSON.stringify(src)} --out ${JSON.stringify(out)}`, { stdio: 'ignore' })
  return `data:image/jpeg;base64,${fs.readFileSync(out).toString('base64')}`
}
const fig = (rel, title, note, tag, tall) => {
  const u = uri(rel, tall ? 1100 : 900)
  return `<figure>${u ? `<img src="${u}" alt="${title}"/>` : `<div class="miss">${rel}</div>`}<figcaption><div><b>${title}</b><span>${note}</span></div><em class="tag ${tag}">${tag === 'y' ? 'you built' : 'this session'}</em></figcaption></figure>`
}
const css = `:root{--bg:#0B0B0E;--card:#111115;--ink:#F2EFE9;--muted:#9C9CA6;--faint:#6C6E7C;--line:#1E1E24;--blue:#3D5AFE;--green:#5EE08C}
*{margin:0;padding:0;box-sizing:border-box}body{background:var(--bg);color:var(--ink);font-family:-apple-system,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased}
.rail{height:4px;background:linear-gradient(90deg,#6ECBFF,#4FE3CF,#5EE08C,#F5C64F,#FFA94D,#FF7DB1,#E08FFF,#8FA0FF)}
.wrap{max-width:1180px;margin:0 auto;padding:52px 24px 90px}
.kick{font-family:ui-monospace,Menlo,monospace;font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#8FA0FF}
h1{font-family:Georgia,serif;font-weight:600;font-size:clamp(32px,5vw,52px);letter-spacing:-.02em;margin:12px 0 0}
.lede{color:var(--muted);font-size:17px;max-width:70ch;margin-top:14px;line-height:1.55}.lede b{color:var(--ink)}
h2{font-size:15px;font-family:ui-monospace,monospace;letter-spacing:.18em;text-transform:uppercase;margin:48px 0 6px;display:flex;align-items:center;gap:10px}
h2 .d{width:9px;height:9px;border-radius:50%}
.sub{color:var(--faint);font-size:14px;margin-bottom:20px}
.grid{display:grid;grid-template-columns:1fr;gap:26px}
.grid.two{grid-template-columns:1fr 1fr}
figure{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden}
figure img{display:block;width:100%;height:auto;border-bottom:1px solid var(--line)}
figcaption{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;font-size:13.5px}
figcaption b{display:block}figcaption span{color:var(--faint);font-size:12px;font-family:ui-monospace,monospace}
.tag{font-style:normal;font-family:ui-monospace,monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;padding:4px 9px;border-radius:6px;white-space:nowrap}
.tag.y{color:#5EE08C;border:1px solid rgba(94,224,140,.4)}.tag.n{color:#8FA0FF;border:1px solid rgba(143,160,255,.4)}
.pal{display:flex;flex-wrap:wrap;gap:10px;margin:8px 0 4px}
.sw{display:flex;flex-direction:column;gap:6px;font-family:ui-monospace,monospace;font-size:10px}.sw span{width:74px;height:44px;border-radius:8px;border:1px solid var(--line)}.sw b{color:var(--muted);font-weight:400}
.note{margin-top:20px;padding:20px 22px;border:1px solid var(--line);border-radius:14px;background:var(--card);color:var(--muted);font-size:15px;line-height:1.65}.note b{color:var(--ink)}
.miss{padding:60px;text-align:center;color:var(--faint);font-family:monospace}
@media(max-width:760px){.grid.two{grid-template-columns:1fr}}`
const hues = [['#6ECBFF','client'],['#4FE3CF','cdn'],['#FF7DB1','load-bal'],['#8FA0FF','gateway'],['#B79CFF','service'],['#FFA94D','cache'],['#5EE08C','database'],['#F5C64F','queue'],['#E08FFF','worker'],['#FF6B6B','failure']]
const ent = (s)=>s.replaceAll('—','&mdash;').replaceAll('·','&middot;').replaceAll('→','&rarr;').replaceAll('’','&rsquo;')
const html = `<div class="rail"></div><div class="wrap">
<div class="kick">Sage Academy · Design System</div>
<h1>What you already built, and what we have now.</h1>
<p class="lede">Rendered live from your Claude Design canvases (found in your Downloads) — this is a real, <b>locked, coded</b> system, not mockups. Below it: what we produced this session, and how they fit as two skins of one brand.</p>

<h2><span class="d" style="background:#5EE08C"></span>1 · Found in your Downloads — your design system</h2>
<div class="sub">rendered live from the .dc.html canvases</div>
<div class="pal">${hues.map(([h,n])=>`<div class="sw"><span style="background:${h}"></span><b>${n}</b></div>`).join('')}</div>
<div class="sub">your signature 10-hue teaching spectrum — one color per concept</div>
<div class="grid">
  ${fig('ds-real.png','Design System — tokens + the 4 hero components','SageDiagram · SageCodeWalkthrough · SageCompare · SageViz','y',true)}
  ${fig('ds-viz.png','Data Viz & Widgets','histogram · gauge · capacity curve · mastery bars · sequence builder · incident replay · recall card','y',true)}
  ${fig('ds-kit.png','System Design Kit (locked)','10-hue spectrum · 12 infra icons · every course emblem · diagram language','y',true)}
</div>

<h2><span class="d" style="background:#3D5AFE"></span>2 · What we have now — built this session</h2>
<div class="sub">the feed skin + the video engine</div>
<div class="grid two">
  ${fig('prod/rag-thumb-16x9.png','Thumbnail (feed skin)','isometric hybrid · multi-ratio template · Poppins','n')}
  ${fig('vid-frame-proof.png','Flagship video frame','animated, kinetic captions, narrated in your voice','n')}
</div>

<div class="note"><b>How they fit — two skins, one brand.</b> Your design system (top) is the <b>teaching</b> layer — precise diagrams, code walkthroughs, charts, the 10-hue palette — for in-video visuals and the academy. What we built (bottom) is the <b>feed</b> layer — the bright isometric thumbnail that wins in a crowded YouTube/IG feed. Same ◆ mark, same blue accent, each used where it's strongest. The next step is porting your components into the render pipeline so every video is <b>assembled</b> from these parts — ~70–80% of that library is already done, right here.</div>
</div>`
fs.writeFileSync(path.join(root,'ds-showcase.html'),`<style>${css}</style>\n${ent(html)}\n`)
console.log('ds-showcase.html:',Math.round(fs.statSync(path.join(root,'ds-showcase.html')).size/1024),'KB')
