// #4 Chunking (standard) — "the boring choice that decides RAG quality"
export default [
  ['01', "Same documents. Same model. Same prompt. Garbage answers. Nine times out of ten, the culprit isn't the model — it's how you chopped up the docs."],
  ['02', "Because you can't embed a whole manual. You split it into chunks — small passages — and each chunk is what actually gets retrieved. Get this wrong and everything downstream inherits it."],
  ['03', "Make the chunks too big, and one passage covers five topics. The match gets diluted, and the model drowns in noise it didn't need."],
  ['04', "Make them too small, and you slice a single idea in half. Retrieval hands the model the setup without the punchline. It's holding half a thought."],
  ['05', "The fix isn't a magic number. Split on structure — paragraphs, headings, sections — so each chunk is one complete idea, the way the author wrote it."],
  ['06', "Then add a little overlap. Let each chunk share a sentence or two with its neighbor, so an idea that straddles the seam isn't lost."],
  ['07', "And tag every chunk with where it came from — the doc, the section. That's what lets the model cite its source instead of just trusting it."],
  ['08', "Here's the part people skip: chunking is a knob, not a guess. Change the strategy, run your eval, and let the score tell you which one actually retrieves better."],
  ['09', "So — split on meaning, overlap the seams, tag the source, and measure it. Boring. And it decides whether your RAG works at all."],
  ['10', "The unglamorous choices are the ones that ship. Learn to make them, free, at sageideas dot dev slash academy. Proof, not paper. I'll see you in the next one."],
];
