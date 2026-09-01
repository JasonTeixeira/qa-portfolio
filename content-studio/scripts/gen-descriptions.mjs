// gen-descriptions.mjs — single source for all 8 videos' YouTube metadata.
// Builds scripts/yt-meta.json with RICH descriptions (hook + why-it-matters + expanded
// takeaways + REAL chapter timestamps + who-it's-for + resources + keyword coverage + CTA + tags).
// Run: node scripts/gen-descriptions.mjs
import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ts = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const starts = durs => { let a = 0; return durs.map(d => { const s = a; a += d; return s; }); };

const CFG = {
  rag: { voDir: 'renders/vo-rag', title: "RAG that doesn't lie: answer from the source (or don't)",
    hook: "Ship an LLM on your own documents and it answers with total confidence — then makes the answer up. In this lesson you'll learn how RAG (Retrieval-Augmented Generation) actually fixes that: retrieve the real page, answer only from it, cite the source, refuse when the answer isn't there, and prove it's grounded with a number you can gate a deploy on.",
    context: "RAG is the backbone of almost every serious AI product today — customer-support bots, internal search, coding assistants, and every \"chat with your docs\" feature. Get it wrong and your AI confidently lies to real users. Get it right and you have something you can actually trust in production. If you're building anything on top of a large language model, this is the first thing to master — and we build it up from zero, in plain English, with a real worked example.",
    learn: ['Why LLMs hallucinate — and why a bigger, more expensive model does NOT fix it', 'The core RAG idea explained with a simple open-book vs closed-book analogy', 'Retrieval end to end: chunking your docs, embedding them as vectors, and nearest-neighbor search (top-k)', 'Answering strictly from the retrieved context, with citations back to the source', 'The one-line guardrail that lets your AI say "I don\'t know" instead of inventing', 'How to test that answers are actually grounded — turning "seems fine" into a real metric'],
    chapters: { 0: 'The problem: AIs make things up', 3: "Why a bigger model won't help", 4: 'The fix: RAG (open-book)', 5: 'How it works: retrieve + answer', 7: 'The step everyone skips', 8: 'A real example', 10: '3 common mistakes', 11: 'Recap' },
    tags: ['RAG', 'retrieval augmented generation', 'RAG tutorial', 'LLM', 'AI engineering', 'hallucination', 'vector search', 'embeddings', 'LLM evals', 'grounding', 'chat with your docs', 'build a RAG app', 'AI app development'], hashtags: '#RAG #AIEngineering #LLM #MachineLearning' },
  evals: { voDir: 'renders/vo-evals', title: 'LLM Evals: stop shipping on vibes — test your AI for real',
    hook: "\"It works in the three examples I tried\" is not a test — it's a guess, and guesses don't survive production. In this lesson you'll learn how to actually measure an LLM feature so a small prompt change can't quietly break it: build a real dataset, score it automatically, and gate bad changes before they ever ship.",
    context: "Evals are the single thing that separates hobby projects from production AI. Every team that ships reliable LLM features has one habit in common — they measure. Without an eval you're editing prompts in the dark and hoping nothing regresses. This is the discipline that lets you move fast without breaking your product, and it's far simpler to set up than most people think.",
    learn: ['Why "testing by vibes" silently breaks things you can\'t see', 'Building a ground-truth dataset — your answer key of real cases', 'Scoring answers automatically, including LLM-as-judge with a rubric', 'Wiring the score into CI so a failing change is blocked from shipping', 'Slicing the score by category so a healthy average can\'t hide one broken area', 'Growing a "golden set" from real production failures'],
    chapters: { 0: 'Why "it works" isn\'t a test', 3: 'Build an eval (3 parts)', 5: 'Scoring: LLM-as-judge', 7: 'The gate: block bad changes', 9: 'The big mistake: averages hide', 10: 'Recap' },
    tags: ['LLM evals', 'AI evaluation', 'LLM-as-judge', 'AI testing', 'prompt engineering', 'RAG evals', 'machine learning', 'AI engineering', 'model evaluation', 'LLMOps', 'ML testing', 'regression testing'], hashtags: '#LLM #AIEngineering #MachineLearning #LLMOps' },
  embeddings: { voDir: 'renders/vo-embeddings', title: 'Embeddings & vector search: why "nearest" isn\'t "relevant"',
    hook: "Search that matches meaning instead of keywords — that's embeddings, and it powers modern AI search. But the closest vector isn't always the right passage, and that one gap quietly wrecks most RAG demos. In this lesson you'll learn how embeddings and vector search really work, and how to make them return the right thing.",
    context: "Embeddings and vector search are the engine behind semantic search, recommendations, RAG, and long-term memory for AI agents. Understanding how \"meaning as numbers\" actually works — and exactly where it fails — is fundamental to building AI that retrieves the right information instead of confidently pulling the wrong passage.",
    learn: ['What an embedding is: turning text into a vector that captures meaning', 'Cosine similarity and nearest-neighbor search, explained simply', 'Why "nearest" is not the same as "most relevant" — the trap that breaks RAG', 'How a re-ranker fixes relevance with a cheap second pass', 'Hybrid search: combining vectors for meaning with keywords for exact matches'],
    chapters: { 0: 'Keyword search vs meaning', 2: 'What embeddings are', 4: 'Nearest-neighbor search', 5: 'Nearest ≠ relevant', 6: 'Re-ranking (the fix)', 8: 'Recap' },
    tags: ['embeddings', 'vector search', 'vector database', 'semantic search', 'cosine similarity', 'nearest neighbor', 're-ranking', 'RAG', 'AI engineering', 'hybrid search', 'embedding models', 'retrieval'], hashtags: '#Embeddings #VectorSearch #RAG #AIEngineering' },
  chunking: { voDir: 'renders/vo-chunking', title: 'Chunking: the boring choice that makes or breaks RAG',
    hook: "Same documents, same model, garbage answers — nine times out of ten it's not the model, it's how you chopped up the docs. Chunking is a knob, not a guess. In this lesson you'll learn how to split your documents so retrieval actually works.",
    context: "Chunking is the unglamorous decision that silently makes or breaks every RAG system. Teams burn weeks tuning models and prompts while the real bug is how they split their documents into pieces. Master this one step and half of your retrieval problems simply disappear — it's the highest-leverage, lowest-glamour skill in the whole pipeline.",
    learn: ['Why chunks that are too big dilute the match and drown the model in noise', 'Why chunks that are too small cut ideas in half and lose context', 'Splitting on structure — paragraphs and headings — instead of a fixed character count', 'Adding overlap so ideas that cross a boundary aren\'t lost', 'Tagging each chunk with its source so your AI can cite it', 'Treating chunking as a setting you measure with an eval, not a number you guess'],
    chapters: { 0: 'Why your RAG returns garbage', 3: 'Too big vs too small', 5: 'Split on meaning', 6: 'Overlap the edges', 8: 'Test your chunking', 9: 'Recap' },
    tags: ['chunking', 'RAG', 'retrieval augmented generation', 'text splitting', 'chunk size', 'embeddings', 'vector search', 'document processing', 'AI engineering', 'LLM', 'RAG tutorial'], hashtags: '#Chunking #RAG #AIEngineering #LLM' },
  agents: { voDir: 'renders/vo-agents', title: 'AI Agents explained: the loop, the tools, and the leash',
    hook: "A chatbot answers; an agent acts — it books the flight, files the ticket, runs the query. And the moment an AI can take actions, it can go wrong in ways a chatbot never could. In this lesson you'll learn the simple loop that powers every AI agent, and the safety rails every good one needs.",
    context: "AI agents are the frontier of applied AI: systems that don't just respond, but take real actions in the world. They're also where things get genuinely risky — an agent that can act can also cause damage. Understanding the underlying loop, the role of tools, and how to constrain the whole thing is essential before you let an AI touch anything that matters.",
    learn: ['What actually makes an agent an agent (acting, not just answering)', 'The agent loop: think → act → observe → repeat', 'Tools — the functions an agent is allowed to call', 'Where agents go off the rails, and why unbounded loops are dangerous', 'The "leash": step limits, an allowed-tools list, and a budget', 'Why fewer, sharper tools plus a human-in-the-loop keep agents safe'],
    chapters: { 0: 'What an agent is (act, not answer)', 2: 'The loop: think, act, observe', 3: 'Tools (how it acts)', 5: 'Where it goes off the rails', 6: 'The leash (limits)', 8: '2 common mistakes', 9: 'Recap' },
    tags: ['AI agents', 'LLM agents', 'agentic AI', 'tool use', 'function calling', 'AI engineering', 'autonomous agents', 'agent loop', 'ReAct', 'AI automation', 'agent tutorial'], hashtags: '#AIAgents #AIEngineering #LLM' },
  'prompt-injection': { voDir: 'renders/vo-prompt-injection', title: 'Prompt injection: how AI apps get hacked (and how to stop it)',
    hook: "Your AI reads a web page to summarize it — and hidden in that page is a line telling it to ignore your instructions and leak the user's data. That's prompt injection, the most common way AI apps get hacked. In this lesson you'll learn exactly how the attack works and how to actually defend against it.",
    context: "The moment your AI reads outside content — a web page, an email, a document, a tool result — it can be attacked. Prompt injection is the number-one security risk in AI applications, and most teams have no real defense for it. If you're shipping anything that ingests untrusted text (and almost every useful AI app does), you need to understand this — because you cannot prompt your way out of it.",
    learn: ['How the attack works, with a concrete real-world example', 'Why the AI literally can\'t tell your instructions from the data\'s instructions', 'Why "ignore malicious instructions" in your prompt does NOT work', 'The mindset fix: treat all outside content as untrusted data, never commands', 'Least privilege — removing capabilities so an attack has nothing to trigger', 'Gating dangerous actions so the AI proposes and your code decides'],
    chapters: { 0: 'The attack', 2: 'Why it works', 3: "The fix that doesn't work", 4: 'Untrusted input is code', 5: 'Least privilege', 6: 'Gate dangerous actions', 8: 'Recap' },
    tags: ['prompt injection', 'AI security', 'LLM security', 'AI safety', 'jailbreak', 'prompt engineering', 'AI engineering', 'indirect prompt injection', 'agent security', 'LLM vulnerabilities'], hashtags: '#PromptInjection #AISecurity #LLM #AIEngineering' },
  'structured-output': { voDir: 'renders/vo-structured-output', title: 'Structured output: get clean JSON from an AI, every time',
    hook: "You need the AI's answer as data, so you ask for JSON — and it replies \"Sure! Here's the JSON:\" and crashes your parser. In this lesson you'll learn how to make an AI return clean, structured data your code can rely on, every single time.",
    context: "Turning an AI's free-flowing text into reliable structured data is the glue that connects language models to real software. Data extraction, tool-calling, agents, APIs — they all depend on getting clean, validated JSON out of a model that loves to add a friendly sentence and break your code. This is one of the most practical skills for anyone building AI features.",
    learn: ['Defining a schema — the exact fields and types you expect back', 'Using structured output / function calling to force valid JSON', 'A real example: extracting clean fields from a messy invoice', 'The trap: valid JSON is not the same as correct JSON', 'Validate-and-retry loops that feed errors back and self-correct'],
    chapters: { 0: 'The problem: broken JSON', 2: 'Define a schema', 3: 'Force the AI to fill it', 4: 'A real example', 5: 'The trap: valid ≠ correct', 6: 'Validate + retry', 7: 'Recap' },
    tags: ['structured output', 'function calling', 'JSON mode', 'LLM', 'AI engineering', 'schema', 'tool calling', 'data extraction', 'pydantic', 'json schema', 'openai function calling'], hashtags: '#LLM #AIEngineering #StructuredOutput' },
  'context-windows': { voDir: 'renders/vo-context-windows', title: 'Context windows: why more context makes your AI worse',
    hook: "You pasted a hundred pages into the prompt to be safe, and the AI still missed the one line that mattered. The context window isn't a memory dump. In this lesson you'll learn what a context window really is and how to use it so your AI actually finds the answer.",
    context: "Every prompt you write lives inside a context window, and how you fill it decides whether your AI finds the answer or walks right past it. Understanding token budgets and the surprising \"lost in the middle\" effect is one of the highest-leverage skills in prompt engineering — it quietly fixes a huge class of AI bugs that look like the model \"just isn't smart enough.\"",
    learn: ['What a context window really is — a fixed budget of tokens', 'The "lost in the middle" effect: why buried information gets ignored', 'Packing on purpose — putting the most important info at the edges', 'Retrieving only what\'s relevant instead of stuffing everything in', 'Compressing long chat history so it stays small and sharp'],
    chapters: { 0: 'The problem: 100 pages, missed', 2: 'What a context window is', 3: 'Lost in the middle', 4: 'Pack on purpose', 5: "Retrieve, don't stuff", 8: 'Recap' },
    tags: ['context window', 'lost in the middle', 'LLM', 'prompt engineering', 'tokens', 'long context', 'RAG', 'AI engineering', 'context length', 'llm context'], hashtags: '#LLM #AIEngineering #ContextWindow #PromptEngineering' },
};

const ORDER = ['rag', 'evals', 'embeddings', 'chunking', 'agents', 'prompt-injection', 'structured-output', 'context-windows'];
const meta = ORDER.map(slug => {
  const c = CFG[slug];
  const durs = JSON.parse(fs.readFileSync(path.join(root, c.voDir, 'beat-durs.json'), 'utf8'));
  const st = starts(durs);
  const chapters = Object.entries(c.chapters).map(([i, title]) => `${ts(i === '0' ? 0 : st[+i])} ${title}`).join('\n');
  const desc = [
    c.hook,
    c.context,
    '🎯 In this video, you\'ll learn:\n' + c.learn.map(l => '• ' + l).join('\n'),
    '⏱ Chapters\n' + chapters,
    '👤 Who this is for: developers, founders, and builders working with LLMs. No PhD required — just plain-English explanations, real examples, and diagrams for every idea.',
    '🔧 Build it hands-on\nThis exact system is a free, interactive lab inside Sage Academy → https://sageideas.dev/academy',
    '📚 About this channel\nSage Academy teaches AI engineering the honest way — clear, no-hype lessons on building AI that actually works in production. This is part of the AI Engineering series. New lessons regularly, so subscribe and hit the bell.',
    '💬 Got a question, or a topic you want covered next? Drop it in the comments — I read them.',
    'Proof, not paper.',
    '🔎 Topics covered: ' + c.tags.join(', ') + '.',
    c.hashtags,
  ].join('\n\n');
  return { slug, title: c.title, file: `renders/video/pub/${slug}.mp4`, thumb: `renders/thumbs-ship/${slug}-16x9.png`, tags: c.tags, desc };
});
fs.writeFileSync(path.join(root, 'scripts/yt-meta.json'), JSON.stringify(meta, null, 1));
console.log(`✓ yt-meta.json — ${meta.length} videos`);
for (const m of meta) console.log(`  ${m.slug.padEnd(18)} ${m.desc.length} chars`);
