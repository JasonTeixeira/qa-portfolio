// gen-descriptions.mjs — rich YouTube descriptions with REAL chapter timestamps
// (computed from each video's beat-durs) + hook + takeaways + links + hashtags.
// Writes into scripts/yt-meta.json. Run: node scripts/gen-descriptions.mjs
import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ts = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const starts = durs => { let a = 0; return durs.map(d => { const s = a; a += d; return s; }); };

const CFG = {
  rag: { voDir: 'renders/vo-flagship',
    hook: "Ship an LLM on your own docs and it answers with total confidence — then makes the answer up. This is how RAG fixes it for real: retrieve the actual page, answer only from it, cite it, refuse when it's not there, and prove it's grounded with a number you can gate a deploy on.",
    learn: ['Why a bigger model does NOT fix hallucination (it\'s honesty, not smarts)', 'Retrieval end-to-end: chunk → embed → nearest-neighbor search (top-k)', 'Answering strictly from context, with citations', 'The one-line guardrail that makes it say "I don\'t know"', 'Faithfulness evals — turning "seems good" into a number'],
    chapters: { 0: 'The lie every LLM will tell you', 3: 'Why a bigger model won\'t help', 4: 'What RAG actually is', 6: 'Retrieval: chunk, embed, search', 9: 'Answer from the source (+ cite)', 11: 'The guardrail: "I don\'t know"', 15: 'Proving it\'s grounded (evals)', 20: 'The 4 moves (recap)' },
    tags: ['RAG','retrieval augmented generation','LLM','AI engineering','hallucination','vector search','embeddings','LLM evals','faithfulness','grounding','AI app development','prompt engineering','RAG tutorial','build a RAG app'],
    hashtags: '#RAG #AIEngineering #LLM #MachineLearning' },
  evals: { voDir: 'renders/vo-evals',
    hook: "\"It works in the three examples I tried\" is not a test — it's a vibe, and vibes don't survive production. This is how you actually measure an LLM feature so a prompt tweak can't quietly break it.",
    learn: ['Ground-truth datasets (your answer key)', 'Metrics: exact match, semantic, and LLM-as-judge with a rubric', 'Wiring the score into CI so bad changes can\'t deploy', 'Slicing the score so a healthy average can\'t hide a broken category', 'Growing a golden set from real production failures'],
    chapters: { 0: 'Why "it works" is a lie', 2: 'Build an eval: dataset, metric, target', 4: 'LLM-as-judge', 7: 'Gate it in CI', 9: 'Slice the score', 13: 'Recap' },
    tags: ['LLM evals','AI evaluation','LLM-as-judge','faithfulness','AI testing','prompt engineering','RAG evals','machine learning','AI engineering','model evaluation','regression testing','ML testing'],
    hashtags: '#LLM #AIEngineering #MachineLearning #LLMOps' },
  embeddings: { voDir: 'renders/vo-embeddings',
    hook: "Search that matches meaning instead of keywords — that's embeddings. But the closest vector isn't always the right passage, and that one gap quietly wrecks most RAG demos. Here's the pipeline done right.",
    learn: ['Embeddings: turning text into meaning-vectors', 'Cosine similarity and nearest-neighbor search', 'Why nearest ≠ most relevant — and how re-ranking fixes it', 'Hybrid search: vectors for meaning + keywords for precision'],
    chapters: { 0: 'Keywords vs meaning', 1: 'What embeddings are', 4: 'Nearest-neighbor search', 5: 'Why nearest ≠ relevant', 8: 'The full pipeline (recap)' },
    tags: ['embeddings','vector search','vector database','semantic search','cosine similarity','nearest neighbor','re-ranking','RAG','retrieval','AI engineering','hybrid search','embedding models'],
    hashtags: '#Embeddings #VectorSearch #RAG #AIEngineering' },
  chunking: { voDir: 'renders/vo-chunking',
    hook: "Same docs, same model, garbage answers — nine times out of ten it's not the model, it's how you chopped up the docs. Chunking is a knob, not a guess. Here's how to split so retrieval actually works.",
    learn: ['Why chunks that are too big dilute and too small lose context', 'Splitting on structure (paragraphs/headings), not character count', 'Overlap so ideas across the seam aren\'t lost', 'Tagging source for citations', 'Treating chunking as a knob you eval'],
    chapters: { 0: 'Why your RAG returns garbage', 2: 'Too big vs too small', 4: 'Split on meaning', 5: 'Overlap the seams', 8: 'The recipe (recap)' },
    tags: ['chunking','RAG','retrieval augmented generation','text splitting','embeddings','vector search','document processing','AI engineering','LLM','context window','chunk size'],
    hashtags: '#Chunking #RAG #AIEngineering #LLM' },
};

const meta = JSON.parse(fs.readFileSync(path.join(root, 'scripts/yt-meta.json'), 'utf8'));
for (const m of meta) {
  const cfg = CFG[m.slug]; if (!cfg) continue;
  const durs = JSON.parse(fs.readFileSync(path.join(root, cfg.voDir, 'beat-durs.json'), 'utf8'));
  const st = starts(durs);
  const chapters = Object.entries(cfg.chapters).map(([i, title]) => `${ts(i === '0' ? 0 : st[+i])} ${title}`).join('\n');
  m.desc = [
    cfg.hook,
    'In this video:\n' + cfg.learn.map(l => '• ' + l).join('\n'),
    '⏱ Chapters:\n' + chapters,
    '🔧 Build this exact system, free, in your browser → https://sageideas.dev/academy',
    '👉 Subscribe for one un-hyped AI-engineering lesson at a time. Proof, not paper.',
    cfg.hashtags,
  ].join('\n\n');
  m.tags = cfg.tags;
}
fs.writeFileSync(path.join(root, 'scripts/yt-meta.json'), JSON.stringify(meta, null, 1));
console.log('✓ descriptions rebuilt with chapters:');
for (const m of meta) console.log(`\n=== ${m.slug} (${m.desc.length} chars) ===\n` + m.desc.split('\n').slice(0, 3).join('\n') + '\n...');
