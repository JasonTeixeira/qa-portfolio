// #3 Embeddings & vector search (standard) — "nearest is not relevant"
export default [
  ['01', "You search your docs for 'refund' and miss the page that says 'money back.' Keyword search matches letters. You want to match meaning. That's what embeddings do."],
  ['02', "An embedding turns a piece of text into a vector — a long list of numbers. The trick: text with similar meaning lands in nearby coordinates."],
  ['03', "So 'money back' and 'refund' end up close together, even with no words in common. Closeness is measured by the angle between vectors — cosine similarity."],
  ['04', "Store a million of these and you can't compare against every one. So you build an index — approximate nearest-neighbor — that finds the closest vectors in milliseconds."],
  ['05', "Now the question becomes a vector too, and you pull its nearest neighbors. The top few. That's your retrieval."],
  ['06', "But here's the catch that wrecks demos: nearest is not the same as most relevant. The closest vector can still be the wrong passage."],
  ['07', "So you add a second pass — a re-ranker — that looks at the query and each hit together and reorders them by real relevance. Slower, sharper, worth it."],
  ['08', "And when meaning-search misses something exact — a product code, a name — you fall back to keywords. Hybrid search: vectors for meaning, keywords for precision."],
  ['09', "So the whole pipeline: embed the text, index the vectors, retrieve the nearest, then re-rank for relevance."],
  ['10', "Nearest is a guess. Relevance is the goal. Build vector search that knows the difference — free, at sageideas dot dev slash academy. Proof, not paper. I'll see you in the next one."],
];
