// #5 Agents — "an agent is a loop with tools, and a leash"
export default [
  ['01', "You asked the AI to DO something, not just answer — book the flight, fix the ticket, run the query. The moment it acts, it stops being a chatbot and becomes an agent."],
  ['02', "And an agent isn't one call to a model. It's a loop. Think, act, observe — then think again with what it just learned. Over and over, until the job is done."],
  ['03', "But a model can't act on its own. It can only produce text. So you give it tools — functions it's allowed to call — and a way to ask for them."],
  ['04', "Here's the loop in motion. The model picks a tool. You run it. You feed the result back. It looks at the result and decides the next move."],
  ['05', "Search flights, read the results, pick one, call book. Four steps, one goal — and the model drove each decision using what came back from the last."],
  ['06', "Which is exactly where it gets dangerous. A loop with no limit can run forever, burn your budget, or wander completely off the rails."],
  ['07', "So you put it on a leash. A cap on steps. A short list of allowed tools. A token budget. The agent is free to think — inside a fence you drew."],
  ['08', "And you log every single step — the thought, the tool, the result. You cannot debug an agent you cannot see. The trace is the whole game."],
  ['09', "One counterintuitive trap: more tools make it worse. Hand it thirty tools and it gets confused. A few sharp, well-named tools beat a giant toolbox."],
  ['10', "And for anything with real blast radius — sending money, deleting data — you don't let it act alone. You put a human in the loop to approve."],
  ['11', "So that's an agent. A loop, a set of tools, a leash to keep it safe, and a trace so you can see what it did."],
  ['12', "Give a model hands, then teach it restraint. Build a real agent, free → sageideas dot dev slash academy. Proof, not paper. I'll see you in the next one."],
];
