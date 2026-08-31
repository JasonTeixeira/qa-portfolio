// gen-warehouse.mjs — auto-generate a big variety showcase from the primitives
// engine to prove combinatorial variety (one generator -> many looks). Writes
// library/warehouse.html. Run: node scripts/gen-warehouse.mjs
import fs from 'node:fs';
import path from 'node:path';
import * as P from '../library/primitives.js';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const R = P.rng(7);
const ri = (a, b) => Math.floor(a + R() * (b - a + 1));
const arr = (n, f) => Array.from({ length: n }).map((_, i) => f(i));
const HUES = P.HUES;
const pickIcons = ['server','database','cloud','cpu','shield','lock','git-branch','box','layers','network','zap','activity','search','filter','brain','bot','message-square','file-text','key','gauge','workflow','container','globe','terminal','package','rocket','target','users','folder','send'];

const card = (nm, v) => `<div class="card"><div class="nm">${nm}</div><div class="viz">${v}</div></div>`;
const section = (t, cards) => `<h2>${t}</h2><div class="grid">${cards.join('')}</div>`;

// ---- one generator, many instances ----
const barsSet = arr(4, i => card(`bars · seed ${i}`, P.bars(arr(ri(4, 7), () => ({ v: ri(15, 100), c: HUES[ri(0, 9)] })))));
const lineSet = arr(3, i => card(`multi-line · ${i}`, P.line(arr(ri(1, 3), s => ({ v: arr(7, () => ri(20, 100)), c: HUES[(i + s) % 10] })), { dots: i === 0 })));
const areaSet = arr(2, i => card(`area · ${i}`, P.area(arr(8, () => ri(20, 100)), { c: ['brand2', 'cdn'][i], id: i })));
const donutSet = arr(3, i => card(`donut · ${i}`, P.donut(arr(ri(2, 4), j => ({ v: ri(10, 50), c: HUES[(i * 2 + j) % 10] })), { center: ri(40, 90) + '%' })));
const gaugeSet = arr(3, i => card(`gauge · ${i}`, P.gauge(ri(35, 98), { label: ri(35, 98) + '%' })));
const scatterSet = arr(2, i => card(`scatter · ${i}`, P.scatter(arr(ri(8, 16), () => ({ x: R(), y: R(), c: HUES[ri(0, 9)], r: ri(3, 8) })))));
const heatSet = arr(2, i => card(`heatmap · ${i}`, P.heatmap(arr(ri(3, 5), () => arr(ri(4, 6), () => R())), { c: ['brand', 'service'][i] })));
const radarSet = arr(2, i => card(`radar · ${i}`, P.radar(arr(ri(4, 6), () => ({ v: 0.3 + R() * 0.7 })), { c: ['brand', 'loadbal'][i] })));
const funnelSet = arr(2, i => card(`funnel · ${i}`, P.funnel(arr(4, j => ({ v: 100 - j * ri(15, 25), l: 'step ' + (j + 1) })))));
const miscViz = [
  card('grouped bars', P.groupedBars(arr(4, () => ({ v: arr(3, () => ri(20, 90)) })))),
  card('histogram', P.histogram(arr(9, () => ri(10, 100)), { curve: true })),
  card('waffle 68%', P.waffle(68)),
  card('candlesticks', P.candles(arr(10, () => { const o = ri(30, 70), c = o + ri(-20, 20); return { o, c, h: Math.max(o, c) + ri(2, 12), l: Math.min(o, c) - ri(2, 12) }; }))),
  card('pyramid', P.pyramid(['reach', 'engage', 'convert', 'retain'])),
  card('sparklines', arr(3, () => P.sparkline(arr(12, () => ri(10, 100)), { c: HUES[ri(0, 9)] })).join('')),
];

// ---- diagrams w/ real icons ----
const flowSet = arr(4, i => card(`flow · ${i}`, P.flow(arr(ri(3, 4), j => ({ l: ['Client','API','Cache','Worker','DB','Queue'][j] || 'Node', tag: ['edge','svc','store','job'][j % 4], icon: pickIcons[(i * 3 + j) % pickIcons.length], c: HUES[(i + j) % 10] })))));
const layeredSet = [card('layered arch', P.layered([{ l: 'edge / CDN', c: 'cdn', icon: 'cloud' }, { l: 'gateway', c: 'gateway', icon: 'shield' }, { l: 'services', c: 'service', icon: 'boxes' }, { l: 'data', c: 'db', icon: 'database' }]))];
const cycleSet = [card('cycle', P.cycle([{ l: 'plan', icon: 'clipboard-list' }, { l: 'build', icon: 'hammer' }, { l: 'test', icon: 'flask-conical' }, { l: 'ship', icon: 'rocket' }, { l: 'learn', icon: 'brain' }]))];
const treeSet = [card('tree', P.tree({ l: 'root', children: [{ l: 'auth' }, { l: 'api' }, { l: 'jobs' }] }))];
const netSet = [card('network', P.network([{ x: 50, y: 40 }, { x: 120, y: 30 }, { x: 160, y: 90 }, { x: 90, y: 100 }, { x: 60, y: 140 }], [[0, 1], [0, 3], [1, 2], [3, 2], [3, 4]]))];
const seqSet = [card('sequence', P.sequence(['client', 'api', 'db'], [{ from: 0, to: 1, l: 'GET' }, { from: 1, to: 2, l: 'query' }, { from: 2, to: 1, l: 'rows', dash: true }, { from: 1, to: 0, l: '200', dash: true }]))];
const ganttSet = [card('gantt', P.gantt([{ s: 0, d: 40, l: 'spec' }, { s: 20, d: 55, l: 'build' }, { s: 50, d: 30, l: 'test' }, { s: 72, d: 25, l: 'ship' }]))];
const vennSet = [card('venn', P.venn('fast', 'safe'))];

// ---- code / product ----
const codeSet = [
  card('code walkthrough', P.codeBlock([{ t: '# retrieve', c: 'c' }, { t: 'ctx = search(q, k=4)' }, { t: 'ans = llm(q, ctx)', hl: true }, { t: 'assert cited(ans)', c: 'g' }], { file: 'rag.py' })),
  card('terminal', P.terminal([{ t: '····· 5 passed', c: 'g' }, { t: 'faithfulness: 1.00' }, { t: '✓ deploy gate', c: 'g' }], { cmd: '▸ pytest -q' })),
  card('diff', P.diff([{ s: '-', t: 'answer(q)' }, { s: '+', t: 'answer(q, ctx)' }, { s: '+', t: 'if not ctx: abstain()' }])),
  card('KPI tiles', P.kpi([{ v: '1.00', l: 'faithful', c: 'db' }, { v: '142ms', l: 'p95', c: 'brand2' }, { v: '4', l: 'top-k', c: 'warn' }, { v: '0', l: 'ungrounded', c: 'ok' }])),
  card('chat', P.chat([{ u: true, t: 'refund policy?' }, { good: true, t: '30 days [1]' }])),
  card('comparison table', P.table(['', 'naive', 'ours'], [['grounded', '✗', '✓'], ['cites', '✗', '✓'], ['abstains', '✗', '✓']])),
  card('steps', P.steps([{ l: 'retrieve' }, { l: 'answer' }, { l: 'verify' }])),
  card('callout', P.callout('value = 42', '← here')),
];
// ---- icon warehouse strip ----
const iconStrip = card('icon warehouse · 1,410 symbols (sample)', `<div style="display:grid;grid-template-columns:repeat(10,1fr);gap:16px;color:var(--brand2)">${pickIcons.concat(['calendar','clock','trending-up','pie-chart','flag','star','eye','settings','wifi','battery','map-pin','compass','award','lightbulb','beaker','atom','dna','cpu','hard-drive','wallet']).map(n => `<span style="display:flex;justify-content:center;color:var(--${HUES[Math.floor(Math.random() * 10)] || 'brand2'})">${P.icon(n, 34)}</span>`).join('')}</div>`);

const html = `<!doctype html><html><head><meta charset="utf-8"/>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet"/>
<style>
:root{--bg:#0B0B0E;--s1:#121218;--s2:#16161d;--line:#1E1E24;--line2:#2A2A33;--ink:#F2EFE9;--muted:#9C9CA6;--faint:#6C6E7C;--brand:#3D5AFE;--brand2:#6E86FF;--client:#6ECBFF;--cdn:#4FE3CF;--loadbal:#FF7DB1;--gateway:#8FA0FF;--service:#B79CFF;--cache:#FFA94D;--db:#5EE08C;--queue:#F5C64F;--worker:#E08FFF;--failure:#FF6B6B;--ok:#5EE08C;--warn:#F5C64F;--display:'Fraunces',Georgia,serif;--sans:'Hanken Grotesk',system-ui,sans-serif;--mono:'JetBrains Mono',ui-monospace,monospace}
*{margin:0;padding:0;box-sizing:border-box}body{background:var(--bg);color:var(--ink);font-family:var(--sans);padding:44px 42px 90px}
.rail{position:fixed;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--client),var(--cdn),var(--db),var(--queue),var(--cache),var(--loadbal),var(--worker),var(--gateway));z-index:9}
h1{font-family:var(--display);font-weight:600;font-size:42px;letter-spacing:-.02em}.sub{font-family:var(--mono);font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--faint);margin:6px 0 26px}
h2{font-family:var(--mono);font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:var(--gateway);margin:34px 0 14px;padding-bottom:7px;border-bottom:1px solid var(--line)}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.card{background:var(--s1);border:1px solid var(--line);border-radius:13px;padding:16px;min-height:200px;display:flex;flex-direction:column}
.nm{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-bottom:12px}
.viz{flex:1;display:flex;align-items:center;justify-content:center;width:100%}svg{overflow:visible}text{font-family:var(--mono)}
</style></head><body><div class="rail"></div>
<h1>Sage visual warehouse</h1><div class="sub">generator engine · one primitive → infinite instances · 1,410 icons · all data-driven, all on the tokens</div>
${section('Data-viz — same generators, generated data (every instance unique)', [...barsSet, ...lineSet, ...areaSet, ...donutSet, ...gaugeSet, ...scatterSet, ...heatSet, ...radarSet, ...funnelSet, ...miscViz])}
${section('Diagrams & systems — icon-driven', [...flowSet, ...layeredSet, ...cycleSet, ...treeSet, ...netSet, ...seqSet, ...ganttSet, ...vennSet])}
${section('Code & product', codeSet)}
${section('Icon warehouse', [iconStrip])}
</body></html>`;
fs.writeFileSync(path.join(root, 'library', 'warehouse.html'), html);
const count = (html.match(/class="card"/g) || []).length;
console.log(`✓ library/warehouse.html — ${count} auto-generated instances from ${Object.keys(P).filter(k => typeof P[k] === 'function').length} generators`);
