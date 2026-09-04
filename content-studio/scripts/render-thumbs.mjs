import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
const tpl = 'file://' + resolve('templates/hybrid-thumb.html');
const fileUrl = p => 'file://' + resolve(p);
// hero = the APPROVED hybrid illustration (renders/hybrids/*), title overlaid
const thumbs = [
  { n:'rag',        hero:'renders/hybrids/h01.png', kicker:'AI ENGINEERING · 01', title:'RAG that <hl>doesn’t lie</hl>',    hl:'#FF6B4A' },
  { n:'evals',      hero:'renders/hybrids/h03.png', kicker:'AI ENGINEERING · 02', title:'Test your LLM, <hl>not vibes</hl>', hl:'#FFC94A' },
  { n:'embeddings', hero:'renders/hybrids/h05.png', kicker:'AI ENGINEERING · 03', title:'Fix your <hl>vector search</hl>',   hl:'#2BB673' },
  { n:'chunking',   hero:'renders/heroes/chunking.png', kicker:'AI ENGINEERING · 04', title:'Chunking <hl>breaks RAG</hl>',  hl:'#5B7CFA' },
  { n:'agents',            hero:'renders/heroes/agents.png',            kicker:'AI ENGINEERING · 05', title:'AI agents, <hl>explained</hl>',       hl:'#FF6B4A' },
  { n:'prompt-injection',  hero:'renders/heroes/prompt-injection.png',  kicker:'AI ENGINEERING · 06', title:'How AI apps get <hl>hacked</hl>',     hl:'#FFC94A' },
  { n:'structured-output', hero:'renders/heroes/structured-output.png', kicker:'AI ENGINEERING · 07', title:'Get clean <hl>JSON</hl> from AI',     hl:'#2BB673' },
  { n:'context-windows',   hero:'renders/heroes/context-windows.png',   kicker:'AI ENGINEERING · 08', title:'Why more context <hl>hurts</hl>',     hl:'#5B7CFA' },
];
const b = await chromium.launch({ args:['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport:{width:1280,height:720}, deviceScaleFactor:2 });
for (const t of thumbs) {
  if (!existsSync(t.hero)) { console.log('  �skip', t.n, '(no hero yet)'); continue; }
  const q = new URLSearchParams({ r:'16x9', hero:fileUrl(t.hero), kicker:t.kicker, title:t.title, hl:t.hl });
  await p.goto(`${tpl}?${q}`, { waitUntil:'networkidle' });
  await p.evaluate(()=>document.fonts&&document.fonts.ready); await p.waitForTimeout(400);
  await p.screenshot({ path:`renders/thumbs-ship/${t.n}-16x9.png` });
  console.log('  ✓', t.n);
}
await b.close();
