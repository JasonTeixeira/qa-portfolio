import { chromium } from 'playwright';
import { resolve } from 'node:path';
const tpl = 'file://' + resolve('templates/hybrid-thumb.html');
const hero = n => 'file://' + resolve(`renders/heroes/${n}.png`);
const thumbs = [
  { n:'rag',        kicker:'AI ENGINEERING · 01', title:'RAG that <hl>doesn’t lie</hl>',   hl:'#5EE08C' },
  { n:'evals',      kicker:'AI ENGINEERING · 02', title:'Stop shipping on <hl>vibes</hl>', hl:'#F5C64F' },
  { n:'embeddings', kicker:'AI ENGINEERING · 03', title:'Nearest isn’t <hl>relevant</hl>', hl:'#E08FFF' },
  { n:'chunking',   kicker:'AI ENGINEERING · 04', title:'The choice that <hl>breaks RAG</hl>', hl:'#6ECBFF' },
];
const b = await chromium.launch({ args:['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport:{width:1280,height:720}, deviceScaleFactor:2 });
for (const t of thumbs) {
  const q = new URLSearchParams({ r:'16x9', hero:hero(t.n), kicker:t.kicker, title:t.title, hl:t.hl });
  await p.goto(`${tpl}?${q}`, { waitUntil:'networkidle' });
  await p.evaluate(()=>document.fonts&&document.fonts.ready); await p.waitForTimeout(400);
  await p.screenshot({ path:`renders/thumbs-ship/${t.n}-16x9.png` });
  console.log('  ✓', t.n);
}
await b.close();
