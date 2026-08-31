// gen-descriptions.mjs — single source for all 8 videos' YouTube metadata.
// Builds the complete scripts/yt-meta.json: title, file, thumb, tags, and a rich
// description (hook + takeaways + REAL chapter timestamps from beat-durs + links + hashtags).
// Run: node scripts/gen-descriptions.mjs
import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ts = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const starts = durs => { let a = 0; return durs.map(d => { const s = a; a += d; return s; }); };

const CFG = {
  rag: { voDir: 'renders/vo-rag', title: "RAG that doesn't lie: answer from the source (or don't)",
    hook: "Ship an LLM on your own docs and it answers with total confidence — then makes the answer up. RAG fixes that: retrieve the real page, answer only from it, cite it, refuse when it's not there, and prove it's grounded.",
    learn: ['Why a bigger model does NOT fix hallucination', 'Retrieval: chunk → embed → nearest-neighbor search', 'Answering strictly from context, with citations', 'The one line that lets it say "I don\'t know"', 'Testing that answers are grounded'],
    chapters: { 0: 'The problem: AIs make things up', 3: "Why a bigger model won't help", 4: 'The fix: RAG (open-book)', 5: 'How it works: retrieve + answer', 7: 'The step everyone skips', 8: 'A real example', 10: '3 common mistakes', 11: 'Recap' },
    tags: ['RAG', 'retrieval augmented generation', 'LLM', 'AI engineering', 'hallucination', 'vector search', 'embeddings', 'LLM evals', 'grounding', 'RAG tutorial', 'build a RAG app'], hashtags: '#RAG #AIEngineering #LLM #MachineLearning' },
  evals: { voDir: 'renders/vo-evals', title: 'LLM Evals: stop shipping on vibes — test your AI for real',
    hook: "\"It works in the three examples I tried\" is not a test — it's a guess, and guesses don't survive production. Here's how to actually measure an LLM feature so a prompt tweak can't quietly break it.",
    learn: ['Ground-truth datasets (your answer key)', 'Scoring with LLM-as-judge and a rubric', 'A gate that blocks regressions before they ship', 'Slicing the score so a broken category can\'t hide'],
    chapters: { 0: 'Why "it works" isn\'t a test', 3: 'Build an eval (3 parts)', 5: 'Scoring: LLM-as-judge', 7: 'The gate: block bad changes', 9: 'The big mistake: averages hide', 10: 'Recap' },
    tags: ['LLM evals', 'AI evaluation', 'LLM-as-judge', 'AI testing', 'prompt engineering', 'RAG evals', 'machine learning', 'AI engineering', 'model evaluation', 'LLMOps'], hashtags: '#LLM #AIEngineering #MachineLearning #LLMOps' },
  embeddings: { voDir: 'renders/vo-embeddings', title: 'Embeddings & vector search: why "nearest" isn\'t "relevant"',
    hook: "Search that matches meaning instead of keywords — that's embeddings. But the closest vector isn't always the right passage, and that one gap quietly wrecks most RAG demos. Here's the pipeline done right.",
    learn: ['Embeddings: turning text into meaning-vectors', 'Cosine similarity and nearest-neighbor search', 'Why nearest ≠ most relevant — and how re-ranking fixes it', 'Hybrid search: vectors for meaning + keywords for precision'],
    chapters: { 0: 'Keyword search vs meaning', 2: 'What embeddings are', 4: 'Nearest-neighbor search', 5: 'Nearest ≠ relevant', 6: 'Re-ranking (the fix)', 8: 'Recap' },
    tags: ['embeddings', 'vector search', 'vector database', 'semantic search', 'cosine similarity', 'nearest neighbor', 're-ranking', 'RAG', 'AI engineering', 'hybrid search'], hashtags: '#Embeddings #VectorSearch #RAG #AIEngineering' },
  chunking: { voDir: 'renders/vo-chunking', title: 'Chunking: the boring choice that makes or breaks RAG',
    hook: "Same docs, same model, garbage answers — nine times out of ten it's not the model, it's how you chopped up the docs. Chunking is a knob, not a guess. Here's how to split so retrieval actually works.",
    learn: ['Why chunks too big dilute and too small lose context', 'Splitting on structure, not character count', 'Overlap so ideas across the seam aren\'t lost', 'Tagging source for citations', 'Treating chunking as a knob you eval'],
    chapters: { 0: 'Why your RAG returns garbage', 3: 'Too big vs too small', 5: 'Split on meaning', 6: 'Overlap the edges', 8: 'Test your chunking', 9: 'Recap' },
    tags: ['chunking', 'RAG', 'retrieval augmented generation', 'text splitting', 'embeddings', 'vector search', 'document processing', 'AI engineering', 'LLM', 'chunk size'], hashtags: '#Chunking #RAG #AIEngineering #LLM' },
  agents: { voDir: 'renders/vo-agents', title: 'AI Agents explained: the loop, the tools, and the leash',
    hook: "A chatbot answers; an agent acts — it books the flight, files the ticket, runs the query. And the moment an AI can act, it can go wrong in ways a chatbot never could. Here's the simple loop that powers every agent, and the safety rails every good one needs.",
    learn: ['The agent loop: think, act, observe, repeat', 'Tools — the functions an agent can call', 'The leash: step limits, allowed tools, and a budget', 'Why fewer tools + a human-in-the-loop keep it safe'],
    chapters: { 0: "What an agent is (act, not answer)", 2: 'The loop: think, act, observe', 3: 'Tools (how it acts)', 5: 'Where it goes off the rails', 6: 'The leash (limits)', 8: '2 common mistakes', 9: 'Recap' },
    tags: ['AI agents', 'LLM agents', 'agentic AI', 'tool use', 'function calling', 'AI engineering', 'autonomous agents', 'agent loop', 'ReAct'], hashtags: '#AIAgents #AIEngineering #LLM' },
  'prompt-injection': { voDir: 'renders/vo-prompt-injection', title: 'Prompt injection: how AI apps get hacked (and how to stop it)',
    hook: "Your AI reads a web page to summarize it — and hidden in that page is a line telling it to ignore your instructions and leak the user's data. That's prompt injection, the most common way AI apps get hacked. Here's exactly how to defend against it.",
    learn: ['Why the AI can\'t tell your instructions from the data\'s', 'Why "ignore malicious instructions" doesn\'t work', 'Treating all outside content as untrusted data', 'Least privilege + gating dangerous actions'],
    chapters: { 0: 'The attack', 2: 'Why it works', 3: "The fix that doesn't work", 4: 'Untrusted input is code', 5: 'Least privilege', 6: 'Gate dangerous actions', 8: 'Recap' },
    tags: ['prompt injection', 'AI security', 'LLM security', 'AI safety', 'jailbreak', 'prompt engineering', 'AI engineering', 'indirect prompt injection', 'agent security'], hashtags: '#PromptInjection #AISecurity #LLM #AIEngineering' },
  'structured-output': { voDir: 'renders/vo-structured-output', title: 'Structured output: get clean JSON from an AI, every time',
    hook: "You need the AI's answer as data, so you ask for JSON — and it replies 'Sure! Here's the JSON:' and crashes your parser. Here's how to make an AI return clean, structured data your code can actually use, reliably.",
    learn: ['Defining a schema — the exact shape you expect', 'Structured output / function calling to force valid JSON', 'Why valid JSON isn\'t correct JSON', 'Validate + retry loops that self-correct'],
    chapters: { 0: 'The problem: broken JSON', 2: 'Define a schema', 3: 'Force the AI to fill it', 4: 'A real example', 5: 'The trap: valid ≠ correct', 6: 'Validate + retry', 7: 'Recap' },
    tags: ['structured output', 'function calling', 'JSON mode', 'LLM', 'AI engineering', 'schema', 'tool calling', 'data extraction', 'pydantic'], hashtags: '#LLM #AIEngineering #StructuredOutput' },
  'context-windows': { voDir: 'renders/vo-context-windows', title: 'Context windows: why more context makes your AI worse',
    hook: "You pasted a hundred pages into the prompt to be safe, and the AI still missed the one line that mattered. The context window isn't a memory dump. Here's how to use it right so your AI actually finds the answer.",
    learn: ['What a context window really is (a token budget)', '"Lost in the middle" — why buried info gets ignored', 'Packing on purpose: important info at the edges', 'Retrieve + compress instead of stuffing'],
    chapters: { 0: 'The problem: 100 pages, missed', 2: 'What a context window is', 3: 'Lost in the middle', 4: 'Pack on purpose', 5: "Retrieve, don't stuff", 8: 'Recap' },
    tags: ['context window', 'lost in the middle', 'LLM', 'prompt engineering', 'tokens', 'long context', 'RAG', 'AI engineering'], hashtags: '#LLM #AIEngineering #ContextWindow' },
};

const ORDER = ['rag', 'evals', 'embeddings', 'chunking', 'agents', 'prompt-injection', 'structured-output', 'context-windows'];
const meta = ORDER.map(slug => {
  const c = CFG[slug];
  const durs = JSON.parse(fs.readFileSync(path.join(root, c.voDir, 'beat-durs.json'), 'utf8'));
  const st = starts(durs);
  const chapters = Object.entries(c.chapters).map(([i, title]) => `${ts(i === '0' ? 0 : st[+i])} ${title}`).join('\n');
  const desc = [
    c.hook,
    'In this video:\n' + c.learn.map(l => '• ' + l).join('\n'),
    '⏱ Chapters:\n' + chapters,
    '🔧 Build this exact system, free, in your browser → https://sageideas.dev/academy',
    '👉 Subscribe for one un-hyped AI-engineering lesson at a time. Proof, not paper.',
    c.hashtags,
  ].join('\n\n');
  return { slug, title: c.title, file: `renders/video/pub/${slug}.mp4`, thumb: `renders/thumbs-ship/${slug}-16x9.png`, tags: c.tags, desc };
});
fs.writeFileSync(path.join(root, 'scripts/yt-meta.json'), JSON.stringify(meta, null, 1));
console.log(`✓ yt-meta.json — ${meta.length} videos`);
for (const m of meta) console.log(`  ${m.slug.padEnd(18)} "${m.title.slice(0, 46)}"  (${m.desc.length} char desc)`);
