// #8 Context windows — "lost in the middle: pack context on purpose"
export default [
  ['01', "You pasted a hundred pages into the prompt to be safe, and the model still missed the one line that mattered. The context window is not a memory dump."],
  ['02', "The window is how much the model can see at once — a fixed budget of tokens. Everything the model knows in this moment has to fit inside it."],
  ['03', "And here's the part that surprises people: models don't read the middle well. They pay the most attention to the start and the end. Bury the key fact in the middle, and it gets lost."],
  ['04', "So more context isn't better. A giant prompt dilutes the signal, costs more money, and runs slower — while hiding the answer in a place the model barely looks."],
  ['05', "The move is to pack on purpose. Put the most important information first and last, where attention is strongest. Position is leverage."],
  ['06', "And don't stuff — retrieve. Instead of dumping every document, pull the few passages that actually matter. That's the whole point of RAG."],
  ['07', "For long conversations, compress. Summarize the history into a few tight lines instead of pasting the entire transcript every turn."],
  ['08', "Treat tokens like a budget, because they are — money and latency. Every token in the window should be earning its place."],
  ['09', "One last trap: your own system instructions, buried mid-prompt, get ignored too. Keep the rules that matter at the edges, not the middle."],
  ['10', "So — retrieve, order by relevance, compress, and put what matters at the edges. A small, sharp context beats a giant, noisy one."],
  ['11', "Stop stuffing. Start packing. Learn to use the window right, free → sageideas dot dev slash academy. Proof, not paper. I'll see you in the next one."],
];
