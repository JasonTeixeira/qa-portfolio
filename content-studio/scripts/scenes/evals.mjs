// #2 Evals for LLMs (flagship) — "you can't ship what you can't measure"
export default [
  ['01', "Your LLM feature works. In the three examples you tried. That's not a test — that's a vibe. And vibes don't survive production."],
  ['02', "You tweak the prompt to fix one bad case. Is the whole thing better now, or did you just break five others? Without an eval, you have no idea. You're flying blind."],
  ['03', "So stop eyeballing outputs. Build an eval. Three pieces: a dataset of real cases, a metric that scores them, and a target you refuse to ship below."],
  ['04', "The dataset is your answer key. Real inputs, paired with the output you'd actually accept. Twenty good cases beats twenty thousand you never checked."],
  ['05', "Then the metric. Sometimes it's exact match. Often it's fuzzier — is this answer faithful, is it relevant — and for that, you let a model grade it against a rubric."],
  ['06', "LLM-as-judge. You hand a second model the answer, the source, and a checklist, and it scores each one. Cheap, fast, and surprisingly consistent when the rubric is tight."],
  ['07', "Now run every case and you get a number. Not a feeling — a score you can watch move as you change things."],
  ['08', "And here's where it earns its keep: you wire that score into CI. If a change drops the eval below your bar, the deploy fails. The bad prompt never ships."],
  ['09', "Watch it work. You 'improve' the prompt — and the eval catches that it quietly broke twelve percent of your cases. That's the regression you would have shipped on a Friday."],
  ['10', "But one number lies. A healthy average can hide one category that's completely broken — and of course it's the category your biggest customer uses."],
  ['11', "So you slice the score — by topic, by input type, by language — and the weak spot lights up. You fix what's actually broken, not what feels broken."],
  ['12', "Where do hard cases come from? Production. Every real failure a user hits becomes a new row in your golden set. Your eval gets meaner every week."],
  ['13', "One warning: the eval is a proxy, not the truth. Chase the number too hard and you overfit to it. Keep it honest, and keep refreshing it."],
  ['14', "So — the whole thing. A dataset of real cases. A metric that scores them. A gate that blocks regressions. And slices so no failure hides."],
  ['15', "You can't ship what you can't measure. Build the eval first, and every change after it becomes safe. Build this exact harness, free, at sageideas dot dev slash academy. Proof, not paper. I'll see you in the next one."],
];
