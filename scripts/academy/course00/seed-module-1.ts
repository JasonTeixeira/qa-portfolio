/**
 * Seed Course 00 · Module 1 — "Framing & Diagnosis".
 *
 * Transforms the four foundation lessons of the Engineering Judgment course from
 * their source scaffold into full, world-class academy lessons. This is a
 * JUDGMENT course (decision-making under ambiguity), not a coding course — so the
 * "win" each lesson produces is a REVIEWABLE ARTIFACT (a decision memo), not a
 * passing Pyodide lab. The artifact bar is expressed through sprint-contract +
 * calibration + verification; the real decision through tradeoff; flawed
 * reasoning through debug; a worked judgment call through worked-example.
 *
 *   tsx scripts/academy/course00/seed-module-1.ts                              # dry-run (default)
 *   tsx --env-file=.env.local scripts/academy/course00/seed-module-1.ts --apply
 *
 * Course: career-engineering_judgment_foundation  (existing — we only UPDATE 4 lessons)
 * Module: Module 1 · Framing & Diagnosis  (module_sort 0)
 *
 * The four target lessons already exist as skeletons (created by
 * ingest-career-os.ts). We UPDATE them in place by upserting on
 * (course_slug, slug) with full `blocks`. Slugs are NEVER changed (learner
 * progress + evidence reference slugs). Idempotent: re-run any time.
 *
 *   01-problem-frame      (sort 0, free preview)  → the Problem Frame
 *   02-diagnostic-route   (sort 1)                → the Diagnostic Route
 *   03-system-map         (sort 2)                → the System Map
 *   04-retrieval-protocol (sort 3)                → the Retrieval Protocol
 *
 * Arc: frame the problem → route the diagnosis → map the system → lock retrieval.
 * One running artifact threads all four: engineering_judgment_decision_memo.md.
 *
 * Ordering: the reader (lib/academy/content.ts) sorts by (module_sort, sort).
 */

import { createClient } from '@supabase/supabase-js'
import type { LessonBlock } from '@/data/academy/sample-course'

const shouldApply = process.argv.includes('--apply')

const COURSE_SLUG = 'career-engineering_judgment_foundation'
const MODULE_TITLE = 'Module 1 · Framing & Diagnosis'
const MODULE_SORT = 0

// The one artifact that threads the whole module. Each lesson grows one section.
const MEMO = 'engineering_judgment_decision_memo.md'

// ============================================================================
// LESSON 1 — 01-problem-frame · The Problem Frame
// Skill: state the real problem, the constraint, and the failure you fear BEFORE
// proposing a solution. Artifact section: the Frame (context, constraint,
// decision-to-be-made, feared failure).
// ============================================================================

const FRAME_MEMO_TEMPLATE = `# Engineering Judgment Decision Memo

## 1. Frame
- Decision to be made: <ship | rollback | instrument | redesign>, by <when>
- Real problem (one sentence, no solution in it):
- Hard constraint (the thing that is NOT negotiable):
- Feared failure (what "wrong" looks like in production):
- Reversibility: <one-way door | two-way door>

<!-- Sections 2–5 are added in Lessons 2, 3, 4 and the capstone. -->`

const problemFrameBlocks: LessonBlock[] = [
  {
    type: 'sprint-contract',
    outcome:
      'Take one ambiguous, real decision you are facing (or a realistic one) and write the Frame: the actual problem in one sentence, the non-negotiable constraint, the decision to be made, and the specific failure you fear — solution-free.',
    intensity: 'standard',
    time: '20–25 min',
    proof: `Section 1 ("Frame") of ${MEMO}: a one-sentence problem with no solution baked in, one named hard constraint, the decision + deadline, and a concrete feared failure. A peer reads it and can restate the problem back to you without you correcting them.`,
    unlock: 'Your Frame names the problem, the constraint, and the feared failure — and contains no proposed solution.',
    doNotClaim:
      'Do not claim you have "framed the problem" if your one-sentence problem already contains a solution (e.g. "we need to add a cache"). That is a disguised answer, not a frame. The frame describes the pain, not the fix.',
  },
  {
    type: 'mission',
    text: 'A staff engineer is pulled into a war room: the checkout page is slow, the VP wants it "fixed by Friday," and three people are already arguing about Redis. She says one sentence — "What is actually failing, and for whom?" — and the room goes quiet, because nobody can answer it. That sentence is the whole job. Before you touch a tool, before you pick a side, you frame. This module builds the four moves senior engineers run on autopilot; this lesson is the first and the one most people skip.',
  },
  {
    type: 'context',
    text: 'Every engineering decision worth the name starts ambiguous: incomplete evidence, stakeholders who disagree, a clock running. The frame is what converts "everyone is anxious" into "here is the one decision, the one constraint, and the one failure we cannot accept." Get the frame right and the diagnosis, the system map, and the proof that follow have something true to hang on. Get it wrong — solve the wrong problem fast — and every hour after is wasted with confidence. This is Section 1 of a memo you will carry through all four lessons.',
  },
  {
    type: 'pretest',
    prompt:
      'A teammate opens with: "We need to add a cache to the orders service." Before you debate caching — what is wrong with that as a problem statement? Write your answer before reading on.',
    reveal:
      'It is not a problem statement at all — it is an answer wearing a problem\'s clothes. "Add a cache" presumes the problem is read latency, the cause is recomputation, and the fix is caching — three unproven leaps. The real frame might be "p99 order-confirmation latency is 4s and the SLO is 1s, and we do not yet know why." Naming the solution first is the most common senior-level mistake there is, because it feels like progress while quietly deciding the answer. The frame must describe the pain with zero fix inside it.',
  },
  {
    type: 'concept',
    title: 'A frame is problem + constraint + feared failure — and no solution',
    text: 'The Problem Frame is a forcing function: it makes you state, in writing, (1) the real problem in one solution-free sentence, (2) the one hard constraint that is not negotiable (a deadline, a budget, a compliance line, a backwards-compat guarantee), and (3) the specific failure you fear if you get it wrong. The invariant: the frame contains the problem, never the answer. If a solution has leaked into your problem sentence, you have pre-decided — and you will spend the rest of the decision defending a guess instead of diagnosing a system. A good frame is also small enough to fit in a few lines and sharp enough that a peer can restate it back to you correctly.',
  },
  {
    type: 'worked-example',
    intro:
      'A real one. The trigger: "Search is broken, customers are complaining." Watch a weak frame become a strong one.',
    steps: [
      'Weak frame: "Search is broken — we should reindex Elasticsearch tonight." Problem and solution are fused; reindexing is already decided.',
      'Strip the solution. What is the actual pain? "Customers report that recent products do not appear in search results."',
      'Quantify and bound it: "Products created in the last 6 hours are missing from search for ~30% of queries." Now it is a problem, not a vibe.',
      'Name the hard constraint: "We cannot take search offline during business hours — it is the primary conversion path." That constraint will rule out options later.',
      'Name the feared failure: "If we act on the wrong cause, we either index-storm the cluster into an outage or quietly keep losing conversions for days."',
      'Final frame: problem (recent products missing for ~30% of queries), constraint (no daytime downtime), feared failure (cluster outage OR silent conversion loss). Zero solution inside it.',
    ],
    commonMistake:
      'Quantifying the SOLUTION instead of the problem: "we need 3 more replicas" is a measured answer, still an answer. Measure the pain (how much, who, since when), not the fix.',
  },
  {
    type: 'code',
    filename: MEMO,
    language: 'bash',
    code: FRAME_MEMO_TEMPLATE,
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'The tell that separates senior from mid: a senior engineer can state the problem in a sentence that the person who disagrees with them would also sign. If your frame only sounds true to people who already favor your fix, it is not a frame — it is a campaign. Write the version your opponent would accept; that is the one with no solution smuggled inside.',
  },
  {
    type: 'calibration',
    artifact: `Section 1 "Frame" of ${MEMO}`,
    weak:
      'The problem sentence contains a solution ("add a cache", "reindex tonight"); the constraint is vague ("make it fast") or missing; no specific feared failure. Reads like a plan, not a frame.',
    passing:
      'One solution-free problem sentence, one named non-negotiable constraint, and a concrete feared failure. A peer can restate the problem correctly. Reversibility is marked.',
    excellent:
      'The problem is quantified (how much, who, since when), the constraint is the one that will actually eliminate options downstream, and the feared failure names BOTH a false-positive and a false-negative outcome — the version your opponent would still sign.',
    note: 'Grade against the artifact, not against how confident the author sounds. Confidence is not calibration.',
  },
  {
    type: 'debug',
    symptom:
      'A teammate hands you this frame and asks you to approve it. It feels reasonable but it is quietly broken. Find the flaw and rewrite the problem line.',
    language: 'bash',
    brokenCode: `## 1. Frame
- Decision: migrate the orders DB to Postgres 16 this sprint
- Real problem: our database is outdated and we should upgrade
- Constraint: finish before the quarter ends
- Feared failure: the migration is hard`,
    task:
      'Name what is wrong with the "Real problem" and "Feared failure" lines, then rewrite the problem as a solution-free sentence.',
    fix:
      '"Our database is outdated and we should upgrade" is a solution (upgrade) plus an opinion (outdated), not a problem — and "the migration is hard" is an effort estimate, not a failure mode. Rewrite, e.g.: Real problem: "On Postgres 13 we cannot use the index type we need for the new search query, and that query is timing out for 5% of users." Now the upgrade is one candidate option, not a foregone conclusion, and the feared failure becomes concrete: "a botched migration corrupts order rows or causes extended write downtime during business hours."',
  },
  {
    type: 'quiz',
    question: 'Which of these is a real Problem Frame rather than a disguised solution?',
    options: [
      '"We need to move to microservices because the monolith is slow."',
      '"Deploys take 40 minutes and block 6 teams; we fear that slowing them further stalls releases, and we cannot break the existing deploy API."',
      '"Let us add a queue to handle the load."',
      '"The architecture is bad and should be refactored."',
    ],
    answer: 1,
    explanation:
      'Only option 2 states a quantified problem (40-min deploys blocking 6 teams), a feared failure (stalled releases), and a hard constraint (cannot break the deploy API) — with no solution inside it. The others all name a fix ("microservices", "add a queue", "refactor") and call it a problem.',
  },
  {
    type: 'verification',
    intro: 'Prove your Frame holds — no vibes:',
    items: [
      'Read your one-sentence problem aloud. If it contains a noun that is a technology or a verb that is an action you would take, you have a solution in it — cut it.',
      'Hand the Frame to a peer and ask them to restate the problem. If they restate it differently than you meant, the frame is ambiguous, not them.',
      'Check the constraint actually constrains: can you name at least one plausible option it rules out? If not, it is decoration.',
      'Check the feared failure is specific enough to recognize in a dashboard or a customer report — not "things go wrong".',
      'Confirm reversibility is marked (one-way vs two-way door) — it sets how much proof the later lessons demand.',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'In your own words: why does naming a solution inside the problem sentence quietly cost you the whole decision?',
      'Explain the difference between measuring the problem and measuring the solution, using your own Frame as the example.',
      'What is the one constraint in your Frame, and which option does it eliminate before you have even diagnosed anything?',
    ],
  },
  {
    type: 'tradeoff',
    question:
      'You have 30 minutes before the war-room call. Do you spend it sharpening the Frame, or jumping straight into the logs to look busy?',
    optionA: {
      label: 'Sharpen the Frame first',
      text: 'Spend 10 minutes writing the solution-free problem, the constraint, and the feared failure. You walk in able to say "here is the one decision and the one thing we cannot accept" — and the diagnosis that follows is aimed.',
    },
    optionB: {
      label: 'Dive into the logs now',
      text: 'Start grepping immediately. You will have screenshots to show, but no shared definition of what "fixed" means — so the room keeps re-litigating the goal while you dig in a direction nobody agreed to.',
    },
    guidance:
      'Option A, almost always, for an ambiguous decision with stakeholders. The frame is cheap (minutes) and it makes every later minute count; un-framed investigation is motion mistaken for progress. The only time B wins is a true sev-1 where the failure is already obvious and the clock is the only constraint — and even then you frame in one spoken sentence before you dig.',
  },
  {
    type: 'transfer',
    text: 'This is not a software move — it is the move. A doctor frames before treating ("chest pain, 55-year-old, fear is an MI, constraint is we cannot wait for slow labs"). A founder frames before building ("retention drops after week 2, fear is the core loop is boring, constraint is we cannot rebuild onboarding this quarter"). Anywhere a decision is ambiguous and a clock is running, the Frame is the first artifact. Next lesson you keep this exact memo and add Section 2 — the Diagnostic Route — which turns your feared failure into an ordered plan for finding the real cause.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '30 days'] },
]

// ============================================================================
// LESSON 2 — 02-diagnostic-route · The Diagnostic Route
// Skill: turn the framed problem into an ordered, falsifiable plan for finding
// the cause — cheapest/most-likely-disqualifying test first. Artifact section:
// the Route (ranked hypotheses + the one test that would kill each).
// ============================================================================

const ROUTE_MEMO_SECTION = `## 2. Diagnostic Route
- Hypothesis A (most likely): ______  → kill-test: ______  → cost: <cheap|mid|expensive>
- Hypothesis B: ______              → kill-test: ______  → cost: ______
- Hypothesis C: ______              → kill-test: ______  → cost: ______
- Run order (cheapest disqualifier first): ______
- Stop rule (when do we stop diagnosing and decide): ______`

const diagnosticRouteBlocks: LessonBlock[] = [
  {
    type: 'sprint-contract',
    outcome:
      'Take the feared failure from your Frame and write the Diagnostic Route: at least three ranked hypotheses for the cause, the single test that would DISQUALIFY each, and the order you would run them — cheapest disqualifier first.',
    intensity: 'standard',
    time: '25 min',
    proof: `Section 2 ("Diagnostic Route") of ${MEMO}: 3+ hypotheses, each with a falsifiable kill-test and a cost, plus an explicit run order and a stop rule. A reviewer agrees your first test is the one most likely to eliminate a branch for the least effort.`,
    unlock: 'Your Route ranks hypotheses, attaches a falsifiable kill-test to each, and orders them cheapest-disqualifier-first.',
    doNotClaim:
      'Do not claim you have a diagnostic route if your "tests" only confirm your favorite hypothesis. A test that can only say "yes" is theater. Each test must be able to return "no" and eliminate a branch.',
  },
  {
    type: 'mission',
    text: 'Two engineers get the same incident: "payments are failing intermittently." The first starts at the code she wrote last week, because that is what she knows best, and burns four hours there. The second writes three hypotheses on a whiteboard, picks the one a 2-minute log query could rule out, runs it, and crosses off a third of the search space before the first engineer has even opened a file. Same incident, same skill with code — wildly different outcomes — because one had a route and one had a hunch. You wrote the Frame last lesson; now you turn its feared failure into a search you can actually win.',
  },
  {
    type: 'context',
    text: 'Diagnosis is search through a space of possible causes, and ambiguous problems have large spaces. The amateur move is to search where the light is good (the code you wrote, the service you own). The senior move is to search where the information is densest per unit of effort — to run the test that eliminates the most possibility for the least cost, regardless of whose code it implicates. The Route is the artifact that makes that discipline visible and reviewable. It is Section 2 of the memo you started in Lesson 1.',
  },
  {
    type: 'pretest',
    prompt:
      'You have three suspects for a bug and limited time. Do you investigate the one you think is MOST likely first — or something else? Decide before reading.',
    reveal:
      'Not necessarily the most likely — the most CHEAPLY DISQUALIFIABLE. Information theory beats intuition here: a 2-minute test that, whatever its result, eliminates half the suspects is worth more than an hour spent confirming your top guess. You are not trying to be right early; you are trying to shrink the search space fastest. Often the best first move is a test you expect to pass, precisely because passing it rules a whole branch out.',
  },
  {
    type: 'concept',
    title: 'A route ranks hypotheses by information-per-cost, not by gut',
    text: 'The Diagnostic Route lists the plausible causes (hypotheses), attaches to each a single falsifiable kill-test — a check whose "no" result eliminates that hypothesis — and orders the tests so the cheapest disqualifier runs first. Two invariants. First, every test must be able to fail; a check that can only confirm your bias adds no information. Second, you order by expected information per unit cost, not by which hypothesis you favor. The Route also needs a stop rule: the point where you stop gathering evidence and decide, because in a real decision more diagnosis past a point is just procrastination with a stack trace.',
  },
  {
    type: 'worked-example',
    intro:
      'Carrying the search problem from Lesson 1 forward: "recent products missing from search for ~30% of queries." Here is the Route.',
    steps: [
      'List hypotheses: (A) the indexing job is failing silently, (B) the index job runs but lags hours behind writes, (C) the query layer filters out fresh docs by a stale cache, (D) a recent mapping change drops the new fields.',
      'Attach a kill-test to each. A: check the indexer job exit codes / dead-letter queue — non-empty kills "silent failure". B: compare newest doc timestamp in the index vs the DB — a small gap kills "hours of lag". C: bypass the cache on one query — fresh docs appearing kills "stale cache". D: inspect the live mapping for the fields — fields present kills "mapping drop".',
      'Cost each test: A and B and D are minutes (a query or an API call); C requires a code path change — more expensive.',
      'Order cheapest-disqualifier-first: B (one timestamp compare) → A (queue check) → D (mapping read) → C (code change). Each cheap test can cross off a whole branch.',
      'Set the stop rule: "If B, A, and D all pass and C is implicated, we stop diagnosing and decide on a cache fix — we do not keep hunting for a fifth cause past 45 minutes."',
      'Run B first. The newest indexed doc is 5 hours old while the DB has writes from 2 minutes ago — "hours of lag" is now the leading hypothesis, and you got there with one query.',
    ],
    commonMistake:
      'Writing hypotheses that are not mutually testable — "maybe it is a config issue" is not a hypothesis, it is a shrug. A hypothesis you cannot write a kill-test for cannot be on the route.',
  },
  {
    type: 'code',
    filename: MEMO,
    language: 'bash',
    code: ROUTE_MEMO_SECTION,
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'The pros run the test they expect to PASS on purpose. Beginners only test what they think is broken, so a passing test feels like wasted effort. But a passing kill-test is pure profit — it permanently removes a branch you no longer have to think about. If every test you run "succeeds" at finding the bug, you are not diagnosing, you are confirming. A good route spends most of its early tests buying eliminations.',
  },
  {
    type: 'calibration',
    artifact: `Section 2 "Diagnostic Route" of ${MEMO}`,
    weak:
      'One or two hypotheses, no falsifiable tests (or tests that can only confirm), no cost estimate, no run order. Effectively "I will go look at the thing I suspect."',
    passing:
      '3+ hypotheses, each with a kill-test that can return "no", a rough cost, an explicit cheapest-first order, and a stop rule.',
    excellent:
      'Hypotheses span layers you do NOT own (not just your own code), the ordering visibly maximizes elimination-per-minute, and at least one early test is one you expect to pass purely to rule a branch out. The stop rule names a time or evidence threshold, not a feeling.',
    note: 'Grade the route on whether each test can eliminate something, not on whether it points at the "right" answer — you do not know the answer yet; that is the point.',
  },
  {
    type: 'debug',
    symptom:
      'Here is a colleague\'s diagnostic plan for "API returns 500s intermittently." It looks busy but it will waste the on-call\'s night. Find the flaw.',
    language: 'bash',
    brokenCode: `## 2. Diagnostic Route
- Step 1: re-read my new endpoint code carefully
- Step 2: add more logging to my endpoint and redeploy
- Step 3: if still failing, ask the database team to check their side
- Run order: as listed`,
    task:
      'Explain why this ordering wastes time and rewrite the first move.',
    fix:
      'Every early step searches where the author has the most familiarity (their own endpoint), not where information is cheapest — and Step 2 requires a redeploy (expensive, slow) before any cheap elimination has happened. The database, network, and upstream dependencies are pushed to last precisely because they are not "mine", which is bias, not strategy. Rewrite Step 1 as the cheapest disqualifier: "Check the load balancer / gateway error logs to see whether the 500s even reach my service, or are emitted upstream — one query, eliminates half the stack." Only after that should code-level redeploys be on the table.',
  },
  {
    type: 'quiz',
    question: 'You have four hypotheses. Which test should you run first?',
    options: [
      'The test for the hypothesis you personally think is most likely.',
      'The test that is cheapest to run and can eliminate the largest part of the search space whatever its result.',
      'The most thorough test, even if it takes hours, so you only test once.',
      'The test that you expect will confirm a bug, so you have something to show.',
    ],
    answer: 1,
    explanation:
      'Diagnosis is search; you win by shrinking the space fastest. The best first move maximizes elimination-per-cost — cheap, and disqualifying whichever way it returns. Favoring your top guess (1) is gut, not route; the marathon test (3) delays all elimination; the confirm-only test (4) buys no information.',
  },
  {
    type: 'verification',
    intro: 'Prove your Route is real:',
    items: [
      'For every hypothesis, write the exact result that would KILL it. If you cannot, it is not a hypothesis yet.',
      'Confirm at least one hypothesis points outside the code you own — bias hides in "it must be my service".',
      'Check your first test is genuinely the cheapest big-eliminator, not just the one nearest your comfort zone.',
      'Confirm a stop rule exists with a concrete threshold (a time box or an evidence bar), so diagnosis cannot run forever.',
      'Trace the route on paper: if Test 1 passes, what is left? If it fails? Each branch should be smaller than where you started.',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'Explain "cheapest disqualifier first" to a junior using your own Route as the example.',
      'Why is a test that can only confirm your hypothesis worthless? What does a real kill-test let you do?',
      'What is your stop rule, and what would tempt you to ignore it in the moment?',
    ],
  },
  {
    type: 'tradeoff',
    question:
      'A 5-minute log query would rule out a whole branch but implicates another team. A 1-hour deep-dive stays entirely inside your own code. Which first?',
    optionA: {
      label: 'Run the cross-team log query',
      text: 'Five minutes, eliminates a third of the search space, and tells you whether the problem is even yours before you spend an hour. The social friction of "checking someone else\'s side" is trivial against an hour saved.',
    },
    optionB: {
      label: 'Do the hour inside your own code',
      text: 'No need to involve another team, feels productive, and you understand your own code best — but if the cause is upstream you have burned an hour proving your own service is innocent the slow way.',
    },
    guidance:
      'Option A. The route is ordered by information-per-cost, and "whose code does it implicate" is not a cost — it is bias dressed as politeness. The cheap, branch-killing test wins even when it points away from you, especially when it points away from you. If org politics genuinely block the query, that is a real constraint to note in the Frame — but solve it, do not let it silently reorder your diagnosis.',
  },
  {
    type: 'transfer',
    text: 'Same route, any domain with a hidden cause. A mechanic does not rebuild the engine — they run the cheap test that splits the space ("is the battery dead? click the lights") before the expensive one. A growth team debugging a conversion drop ranks "tracking broke / a competitor moved / the funnel changed" and runs the analytics check that disqualifies a branch before redesigning anything. You have now framed the problem and routed the diagnosis. Next lesson you add Section 3 — the System Map — because the test you just ran ("index is 5 hours behind") only makes sense if you can see the system the lag lives in.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '30 days'] },
]

// ============================================================================
// LESSON 3 — 03-system-map · The System Map
// Skill: draw the smallest accurate picture of the system the decision lives in
// — components, the data/control flow between them, and where it can break — so
// the diagnosis has a place to stand. Artifact section: the Map (as text) +
// the named blast radius.
// ============================================================================

const SYSTEM_MAP_SECTION = `## 3. System Map
\`\`\`
[Client] --request--> [API Gateway] --> [Orders Service] --writes--> [Postgres]
                                              |
                                              +--emits event--> [Index Worker] --> [Search Index]
                                                                       ^
                                              [Client] --query-------- + (reads here)
\`\`\`
- Suspect edge (where the diagnosis landed): Orders write -> Index Worker -> Search Index
- Blast radius if this edge fails: search shows stale catalog; conversions drop; no data loss
- Boundary we will NOT cross this decision: <e.g. the payments path is out of scope>`

const systemMapBlocks: LessonBlock[] = [
  {
    type: 'sprint-contract',
    outcome:
      'Draw the smallest accurate map of the system your decision lives in — the components, the direction of data/control flow between them, and the one edge where your diagnosis landed — then name the blast radius if that edge fails.',
    intensity: 'standard',
    time: '25 min',
    proof: `Section 3 ("System Map") of ${MEMO}: a text diagram of the relevant components and the directed flows between them, the suspect edge marked, the blast radius named, and an explicit out-of-scope boundary. A peer can trace a request through it without you narrating.`,
    unlock: 'Your Map shows directed flow between the components that matter, marks the suspect edge, and names the blast radius and the out-of-scope boundary.',
    doNotClaim:
      'Do not claim a system map if you have drawn every box in the company. A map that includes everything explains nothing. The skill is leaving things OUT on purpose and being able to defend each omission.',
  },
  {
    type: 'mission',
    text: 'An incident bridge has twelve people on it, and the architecture diagram someone screen-shares has ninety boxes. Nobody can find the failure on it because it shows everything and therefore nothing. A principal engineer mutes the noise, sketches five boxes and four arrows in a text file — "request comes in here, writes here, this worker copies it to here, the client reads from here" — and says "the gap is on this arrow." The room finally has a place to stand. You routed the diagnosis last lesson and landed on "the index lags." Now you draw the map that makes that lag a location, not a guess.',
  },
  {
    type: 'context',
    text: 'A diagnosis without a map is a finding with nowhere to live. "The index is 5 hours behind" only becomes actionable when you can see WHERE the index sits, what feeds it, who reads from it, and what else breaks if that path fails. The System Map is the smallest accurate picture that lets you reason about flow and blast radius — not the org-wide architecture poster, but the four-to-eight boxes this decision actually touches. It is Section 3 of your memo, and the thing every later argument will point at.',
  },
  {
    type: 'pretest',
    prompt:
      'You are asked to draw the system for an incident. Do you draw the complete architecture, or something smaller? And what makes a map USEFUL versus merely accurate? Answer first.',
    reveal:
      'Useful beats complete. A map that includes every service is accurate and worthless — it cannot be held in one head, and the failure is lost in the clutter. A useful map is the smallest one that still contains the decision: the components on the suspect path, the direction data flows between them, and the boundary of what you are deliberately NOT touching. The skill is not drawing — it is omission with a reason. Every box you leave out, you should be able to defend.',
  },
  {
    type: 'concept',
    title: 'A map is directed flow + suspect edge + blast radius — kept small on purpose',
    text: 'The System Map names the components that the decision touches and the directed flow between them (who calls whom, which way the data moves), marks the edge where the diagnosis landed, and states the blast radius — what else breaks, and how badly, if that edge fails. The invariant is parsimony with intent: the map is as small as it can be while still containing the failure and its consequences. Arrows have direction because direction is where causation hides — "A writes to B" and "B reads from A" fail in opposite ways. And a real map draws its own boundary: this is in scope, that is explicitly not, and you can say why.',
  },
  {
    type: 'worked-example',
    intro:
      'From Lesson 2 you know the index lags. Now locate that on a map small enough to reason about.',
    steps: [
      'List only the components on the path: Client, API Gateway, Orders Service, Postgres, Index Worker, Search Index. Six boxes — payments, auth, billing are deliberately omitted; they are not on this path.',
      'Draw directed flow: Client → Gateway → Orders Service → Postgres (the write); Orders Service emits an event → Index Worker → Search Index (the copy); Client → Search Index (the read).',
      'Mark the suspect edge: the "Orders Service emits event → Index Worker → Search Index" path is where the 5-hour lag lives. Circle that arrow.',
      'Name the blast radius: if that edge stalls, the search index serves a stale catalog — customers see old availability and prices, conversions drop — but no order data is lost (Postgres is still the source of truth). That distinction (stale vs lost) shapes how urgent and how reversible the fix is.',
      'Draw the boundary: payments and auth are out of scope for this decision; you write that down so nobody re-expands the map mid-call.',
      'Sanity check: can a peer trace a fresh product from creation to "should appear in search" along your arrows? If yes, the map is sufficient.',
    ],
    commonMistake:
      'Drawing components but no arrow directions — a box diagram with undirected lines. Without direction you cannot tell a write path from a read path, and the two fail differently. Always direct the flow.',
  },
  {
    // The worked example, made visual: the six-box search-incident map with
    // directed flow, the suspect edge marked (accent), and the blast-radius
    // node called out (warning). Mirrors SYSTEM_MAP_SECTION below.
    type: 'diagram',
    title: 'The search-lag system map',
    subtitle:
      'Six components on the write → index → read path. The suspect edge (Orders → Index Worker → Search Index) is marked; the blast radius is the stale search catalog. Payments, auth, and billing are deliberately out of scope.',
    height: 480,
    nodes: [
      // Top row (write path) and bottom row (index/read cluster) sit close
      // together (y 110 → 300, a 190px rhythm) so the write-path and the
      // index/read cluster read as one connected system, not two stranded bands.
      { id: 'client', label: 'Client', description: 'browser / app', x: 150, y: 110 },
      { id: 'gateway', label: 'API Gateway', description: 'edge routing', x: 430, y: 110 },
      { id: 'orders', label: 'Orders Service', description: 'write path', x: 710, y: 110 },
      { id: 'postgres', label: 'Postgres', description: 'source of truth', x: 960, y: 110, tone: 'success' },
      // Search Index and Index Worker are spaced 420px apart (x 340 / 760) so
      // the heavy "indexes (LAGS)" blast-radius edge between them has room and
      // its label never crowds either node.
      { id: 'worker', label: 'Index Worker', description: 'event consumer', x: 760, y: 300, tone: 'accent' },
      { id: 'search', label: 'Search Index', description: 'stale catalog', x: 340, y: 300, tone: 'warning' },
    ],
    edges: [
      { from: 'client', to: 'gateway', label: 'request' },
      { from: 'gateway', to: 'orders', label: 'route' },
      { from: 'orders', to: 'postgres', label: 'writes' },
      // The suspect path: Orders emits an event the Index Worker consumes
      // (accent) and the lagging index copy (warning = blast radius). Toned +
      // heavier so the diagnosis is legible from the graph alone, not just copy.
      { from: 'orders', to: 'worker', label: 'emits event', dashed: true, tone: 'accent' },
      { from: 'worker', to: 'search', label: 'indexes (LAGS)', dashed: true, tone: 'accent' },
      { from: 'client', to: 'search', label: 'queries' },
    ],
    legend: [
      { tone: 'accent', label: 'on the suspect path' },
      { tone: 'warning', label: 'blast radius (stale index)' },
      { tone: 'success', label: 'source of truth' },
    ],
  },
  {
    type: 'code',
    filename: MEMO,
    language: 'bash',
    code: SYSTEM_MAP_SECTION,
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'The senior tell is the boundary, not the boxes. Anyone can add components; the judgment is in what you cross out and your reason for it. "Payments is out of scope because nothing on the suspect path writes to or reads from it" is a defended omission. A map you can defend the edges of — both the arrows you drew and the boxes you refused to draw — is a map a reviewer trusts.',
  },
  {
    type: 'calibration',
    artifact: `Section 3 "System Map" of ${MEMO}`,
    weak:
      'A bag of boxes with no arrows or undirected lines; either everything or too little; no marked suspect edge; no blast radius; no scope boundary. Cannot be used to trace a request.',
    passing:
      'The components on the relevant path with directed flow, the suspect edge marked, a stated blast radius, and an explicit out-of-scope boundary.',
    excellent:
      'The map is the smallest one that still contains the failure; the blast radius distinguishes severity (e.g. stale data vs data loss, degraded vs down); and every omission can be defended ("X is out because nothing on this path touches it"). A peer traces a request through it unaided.',
    note: 'Grade on whether the map lets someone REASON about the failure, not on how pretty or complete it is.',
  },
  {
    type: 'debug',
    symptom:
      'A teammate shares this "system map" for the search incident. It is technically true and completely useless for the decision. Diagnose why.',
    language: 'bash',
    brokenCode: `## 3. System Map
- Components: Web, iOS, Android, Gateway, Auth, Orders, Payments, Billing,
  Inventory, Notifications, Email, Postgres, Redis, Kafka, Index Worker,
  Search, Analytics, Data Lake, CDN, Load Balancer
- (no arrows; "everything connects to everything")`,
    task:
      'Explain why this map cannot help the search-lag decision and rewrite it down to what matters.',
    fix:
      'It is the org architecture poster, not a decision map: twenty undirected boxes, no flow direction, no marked suspect edge, no blast radius. You cannot locate the 5-hour index lag on it because the relevant path is buried in noise and the arrows that would show causation are missing. Rewrite to the six components on the write-then-index-then-read path with directed arrows, circle the Orders→IndexWorker→Search edge, and explicitly drop Payments/Billing/Notifications/Analytics as out of scope. Smaller and directed beats complete and flat.',
  },
  {
    type: 'quiz',
    question: 'What most distinguishes a useful system map from a complete architecture diagram?',
    options: [
      'It uses a fancier diagramming tool.',
      'It includes every service so nothing is missed.',
      'It is the smallest map that still contains the failure and its blast radius, with directed flow and a defended scope boundary.',
      'It color-codes every component by team ownership.',
    ],
    answer: 2,
    explanation:
      'Usefulness comes from intentional omission plus direction: the smallest picture that still holds the failure, shows which way data flows, names what breaks downstream, and draws a boundary you can defend. Completeness (2) is the opposite virtue — it reintroduces the clutter that hides the failure.',
  },
  {
    type: 'verification',
    intro: 'Prove your Map earns its place:',
    items: [
      'Every connection has a direction. If any line is undirected, you cannot tell a write path from a read path — fix it.',
      'A peer can trace one request end-to-end through your arrows without you narrating.',
      'The suspect edge from your Diagnostic Route is marked and findable in under five seconds.',
      'The blast radius distinguishes severity — stale vs lost, degraded vs down — not just "it breaks".',
      'You can defend at least two omissions: name two components you left out and why they are not on this path.',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'Trace a request through your map out loud, naming each arrow\'s direction and why it matters.',
      'Explain your blast radius: what breaks, how badly, and what is protected — using your own map.',
      'Defend one box you deliberately left out. Why is leaving it out a judgment, not an oversight?',
    ],
  },
  {
    type: 'tradeoff',
    question:
      'For the war-room call, do you spend 15 minutes drawing the small decision-map, or paste the existing full architecture diagram everyone already has?',
    optionA: {
      label: 'Draw the small map',
      text: 'Fifteen minutes produces six boxes the room can actually reason on, with the suspect edge circled. The call moves to "what do we do about this arrow" instead of "where even is the problem".',
    },
    optionB: {
      label: 'Paste the full architecture',
      text: 'Zero effort, and it is "official" — but ninety boxes means the failure is invisible, the call spends twenty minutes orienting, and three people propose fixes to components that are not even on the path.',
    },
    guidance:
      'Option A. The full diagram optimizes for completeness; the decision needs orientation, and those are different jobs. The fifteen minutes to draw the small map are repaid many times over by a call that argues about the right arrow. Keep the full architecture as a reference to pull omitted components back IN if the diagnosis moves — but lead with the small map.',
  },
  {
    type: 'transfer',
    text: 'Cartography of the relevant, nothing more — it travels everywhere. A surgeon studies the anatomy of the region they will operate on, not the entire body, and marks where a nick is catastrophic versus survivable. An investigator maps the people and money flows around one event, not the whole city. Anywhere you must reason about how a failure propagates, you draw the smallest accurate map and name the blast radius. You have now framed, routed, and mapped. The last lesson adds Section 4 — the Retrieval Protocol — the discipline that lets you run these three moves from memory under pressure, when there is no time to look any of it up.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '30 days'] },
]

// ============================================================================
// LESSON 4 — 04-retrieval-protocol · The Retrieval Protocol  (module capstone)
// Skill: convert the three moves into a closed-note checklist you can run from
// memory, with calibrated confidence, so judgment survives pressure. Artifact:
// the completed memo + a calibration log proving you ran it closed-note.
// ============================================================================

const RETRIEVAL_PROTOCOL_SECTION = `## 4. Retrieval Protocol (run closed-note)
- [ ] Frame: problem (solution-free) · constraint · feared failure        confidence: _/5
- [ ] Route: 3 ranked hypotheses · a kill-test each · cheapest first       confidence: _/5
- [ ] Map: directed flow · suspect edge · blast radius · scope boundary    confidence: _/5
- [ ] Decision: chosen option · rejected option · reversal condition       confidence: _/5

## Calibration log
- Ran closed-note on: <date> · for decision: <name>
- Confidence said: __  | Reality after proof: <right|wrong on each step>
- Overconfident step (>3 confidence, wrong) → repair: ______`

const retrievalProtocolBlocks: LessonBlock[] = [
  {
    type: 'sprint-contract',
    outcome:
      'Turn the three moves of this module — Frame, Route, Map — into a closed-note Retrieval Protocol you can run from memory on a real decision, logging a calibrated confidence (1–5) on each step and catching where confidence outran reality.',
    intensity: 'capstone',
    time: '30 min',
    proof: `The completed ${MEMO} (all four sections) PLUS a calibration log showing you ran the protocol CLOSED-NOTE: a confidence score per step and at least one honest note where confidence exceeded correctness (or a defensible claim that none did). Reusable on the next real decision.`,
    unlock: 'You can run Frame → Route → Map → Decide from memory, with a confidence score per step and a calibration note where confidence outran reality.',
    doNotClaim:
      'Do not claim mastery from a high confidence score alone. Confidence is the thing being TESTED, not the proof. A 5/5 that turns out wrong is the most valuable line in the log — it is the calibration repair. Claiming calibration without an honest miss (or honest "I checked, none missed") is the failure mode this lesson exists to kill.',
  },
  {
    type: 'mission',
    text: 'It is 2 a.m., the page just fired, and there is no time to open a doc or read a checklist — the judgment either lives in your hands or it does not. This is the difference between an engineer who is good in the review meeting and one who is good in the incident. Over three lessons you built a memo with someone watching; tonight you prove you can run it with no notes and no audience, and — harder — that you know which of your answers to trust. This is the capstone: not new material, but the move that makes the other three survive contact with pressure.',
  },
  {
    type: 'context',
    text: 'Knowledge you can only retrieve with your notes open is knowledge you do not have when it counts. Retrieval practice — recalling the moves closed-note — is what converts "I understand framing" into "I frame automatically at 2 a.m." And calibration — scoring how confident you were and checking it against what was true — is what stops the most dangerous engineer in the building: the one who is confidently wrong and never finds out. This lesson closes the loop on the whole module: it makes the Frame, the Route, and the Map portable and trustworthy.',
  },
  {
    type: 'pretest',
    prompt:
      'You feel 5/5 confident about a diagnosis. Is high confidence good news or a warning sign? Decide before reading.',
    reveal:
      'It is unverified data — and on its own, a mild warning. Confidence and correctness are different axes; the dangerous quadrant is high-confidence-and-wrong, because you stop checking exactly when you should not. The point of logging confidence is not to feel sure — it is to find the gap between how sure you felt and how right you were, so the next 5/5 means something. A calibrated engineer is not the most confident one; it is the one whose confidence predicts their accuracy.',
  },
  {
    type: 'concept',
    title: 'A protocol is the three moves from memory, scored for calibration',
    text: 'The Retrieval Protocol is a closed-note checklist that runs the module: Frame the problem, Route the diagnosis, Map the system, then Decide (chosen option, rejected option, reversal condition). You run it from memory — that is the retrieval practice that makes it stick — and you attach a confidence (1–5) to each step. Then, after proof, you compare confidence to reality and log every place confidence exceeded correctness. Those over-confident misses are not failures; they are the calibration signal, and each one routes to a repair. The invariant: the protocol is only "passed" when it has been run closed-note AND the confidence has been checked against truth — recall plus calibration, never one without the other.',
  },
  {
    type: 'worked-example',
    intro:
      'The whole module, run from memory on the search incident — and the calibration that follows.',
    steps: [
      'Frame (from memory): "Recent products missing from search for ~30% of queries; constraint: no daytime downtime; feared failure: cluster outage or silent conversion loss." Confidence 4/5.',
      'Route (from memory): hypotheses indexer-failure / index-lag / stale-cache / mapping-drop; cheapest kill-test first is the timestamp compare. Confidence 4/5.',
      'Map (from memory): Client→Gateway→Orders→Postgres, Orders→IndexWorker→SearchIndex, Client reads SearchIndex; suspect edge is the index path; blast radius is stale catalog, no data loss. Confidence 3/5.',
      'Decide: chosen — fix the lagging index worker and backfill; rejected — full reindex (violates the no-daytime-downtime constraint); reversal condition — if backfill does not close the gap in 30 min, fall back to a throttled off-hours reindex. Confidence 4/5.',
      'Now PROVE and calibrate: the timestamp test confirmed the lag (Route was right, 4/5 earned). But the map missed that the Index Worker also feeds Analytics — a real edge you forgot. Map confidence was 3/5 and still too high.',
      'Calibration log: "Map step — confidence 3/5, reality: incomplete (missed the Analytics consumer). Repair: when mapping, always ask \'who else reads from this node\' before declaring blast radius." That single logged miss is the most useful line in the memo.',
    ],
    commonMistake:
      'Logging only the steps you got right and quietly dropping the miss. The miss IS the deliverable — a calibration log with no honest gap (and no honest "I verified none") is just a confidence brag, and it teaches you nothing.',
  },
  {
    type: 'code',
    filename: MEMO,
    language: 'bash',
    code: RETRIEVAL_PROTOCOL_SECTION,
  },
  {
    type: 'callout',
    tone: 'note',
    text: 'The trait that correlates with senior judgment is not being right more often — it is knowing when you are not. An engineer who says "70% on this, here is what would change my mind" is worth more in a room than one who is reflexively 100% on everything, because the first one\'s confidence is information and the second one\'s is noise. Calibration is the skill that makes all your other answers trustworthy to other people.',
  },
  {
    type: 'calibration',
    artifact: `The completed ${MEMO} + calibration log`,
    weak:
      'The protocol was run with notes open (no real retrieval); confidence scores are all 5/5; the log records no miss and no verification of "no miss". It proves nothing about pressure performance.',
    passing:
      'All four sections completed from memory, a 1–5 confidence on each step, and at least one honest calibration entry comparing confidence to reality with a repair (or a defended "I checked each and none were overconfident").',
    excellent:
      'The closed-note run surfaced a real gap (an over-confident step that proof contradicted), the repair is a reusable rule that prevents the same miss class next time, and the memo is genuinely reusable on a fresh decision without edits to its structure.',
    note: 'The most valuable artifact here contains an honest miss. Grade up calibration that found its own error; grade down a flawless-looking log with no evidence it was run closed-note.',
  },
  {
    type: 'debug',
    symptom:
      'An engineer submits this calibration log as proof of judgment under pressure. It is the exact anti-pattern this lesson targets. Diagnose it.',
    language: 'bash',
    brokenCode: `## Calibration log
- Frame: confidence 5/5
- Route: confidence 5/5
- Map: confidence 5/5
- Decide: confidence 5/5
- Notes: I was confident about everything and it all felt right.
  (ran with the memo from Lesson 1-3 open in the other tab)`,
    task:
      'Name the two things that make this log worthless, and state what a passing log would show instead.',
    fix:
      'Two fatal flaws. First, it was not run closed-note ("memo open in the other tab") — so it tests reading, not retrieval, and proves nothing about 2 a.m. performance. Second, uniform 5/5 with no comparison to reality is a confidence brag, not calibration — there is no axis of truth to measure against, so the most dangerous quadrant (confident-and-wrong) is invisible by construction. A passing log is run from memory, scores confidence per step, then checks each against proof and records at least one honest gap (or a defended "verified, none over") with a reusable repair.',
  },
  {
    type: 'quiz',
    question: 'What makes a calibration log valuable evidence of judgment?',
    options: [
      'Every step scored 5/5 confidence.',
      'It was run closed-note and records at least one honest comparison of confidence to reality, with a repair for any gap.',
      'It is long and detailed.',
      'It avoids admitting any mistakes so it looks competent.',
    ],
    answer: 1,
    explanation:
      'Value comes from retrieval plus calibration: the protocol was run from memory (so it tests pressure performance) and confidence was checked against what turned out true (so over-confidence is caught and repaired). Uniform 5/5 (1) and mistake-hiding (4) destroy exactly the signal the log exists to capture.',
  },
  {
    type: 'verification',
    intro: 'Prove the protocol — and your calibration:',
    items: [
      'You ran Frame → Route → Map → Decide from memory, notes closed. If you peeked, it does not count as retrieval — re-run it.',
      'Every step has a 1–5 confidence recorded BEFORE you checked it against reality.',
      'At least one step has been compared to proof, and any gap between confidence and correctness is logged honestly.',
      'Each over-confident miss has a repair that is a reusable rule, not "be more careful".',
      'The completed memo reads as reusable on a brand-new decision — you could hand it to next week\'s incident unchanged in structure.',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'Roll-call the module: name the four moves (Frame, Route, Map, Decide) and what each one is FOR, from memory.',
      'Explain why high confidence is data to be tested, not proof — using a real step from your own log.',
      'Which step were you most over-confident on, and what reusable repair did it earn?',
    ],
  },
  {
    type: 'tradeoff',
    question:
      'Practicing the protocol: do you run it closed-note and risk fumbling, or keep your notes open so it goes smoothly?',
    optionA: {
      label: 'Run it closed-note',
      text: 'You will stumble, and the stumble is the point — it shows you exactly which move is not yet automatic, which is the gap you would have hit at 2 a.m. anyway. Effortful recall is what makes it stick and what surfaces your real calibration.',
    },
    optionB: {
      label: 'Keep notes open',
      text: 'It feels smooth and competent — but it trains reading, not recall, and it hides every gap behind the open tab. You will leave feeling ready and be unready the first time the page fires.',
    },
    guidance:
      'Option A. Smoothness with notes open is an illusion of mastery — the fluency belongs to the document, not to you. The desirable difficulty of closed-note recall is precisely what builds retrievable judgment and honest calibration. Use the notes to CHECK yourself after, never to carry yourself through.',
  },
  {
    type: 'transfer',
    text: 'You came in able to argue about Redis in a war room and you leave able to do the four things that actually decide the outcome: frame the problem with no solution smuggled in, route the diagnosis cheapest-disqualifier-first, map the system small enough to reason about, and run all of it from memory while knowing which of your own answers to trust. That last skill — calibrated, retrievable judgment — is what a pilot rehearses in the simulator, what a surgeon drills before the OR, what a trader logs after every call. It is domain-independent and it is the whole game. The memo you built across these four lessons is your first piece of portfolio evidence: not "I understand engineering judgment" but "here is a decision I framed, diagnosed, mapped, decided, and calibrated — read it." Carry it into the next module. You do not just talk about judgment now. You can run it.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '30 days'] },
]

// ============================================================================
// apply
// ============================================================================

type SeedLesson = {
  slug: string
  title: string
  eyebrow: string
  sort: number
  est_minutes: number
  is_free_preview: boolean
  intensity: 'micro' | 'standard' | 'deep' | 'capstone'
  blocks: LessonBlock[]
}

const lessons: SeedLesson[] = [
  {
    slug: '01-problem-frame',
    title: 'The Problem Frame',
    eyebrow: 'Module 1 · Lesson 1 · 25 min',
    sort: 0,
    est_minutes: 25,
    is_free_preview: true,
    intensity: 'standard',
    blocks: problemFrameBlocks,
  },
  {
    slug: '02-diagnostic-route',
    title: 'The Diagnostic Route',
    eyebrow: 'Module 1 · Lesson 2 · 25 min',
    sort: 1,
    est_minutes: 25,
    is_free_preview: false,
    intensity: 'standard',
    blocks: diagnosticRouteBlocks,
  },
  {
    slug: '03-system-map',
    title: 'The System Map',
    eyebrow: 'Module 1 · Lesson 3 · 25 min',
    sort: 2,
    est_minutes: 25,
    is_free_preview: false,
    intensity: 'standard',
    blocks: systemMapBlocks,
  },
  {
    slug: '04-retrieval-protocol',
    title: 'The Retrieval Protocol',
    eyebrow: 'Module 1 · Lesson 4 · 30 min',
    sort: 3,
    est_minutes: 30,
    is_free_preview: false,
    intensity: 'capstone',
    blocks: retrievalProtocolBlocks,
  },
]

async function main() {
  if (!shouldApply) {
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          applyCommand: 'tsx --env-file=.env.local scripts/academy/course00/seed-module-1.ts --apply',
          course: COURSE_SLUG,
          module: MODULE_TITLE,
          moduleSort: MODULE_SORT,
          lessons: lessons.map((l) => ({
            slug: l.slug,
            sort: l.sort,
            isFreePreview: l.is_free_preview,
            intensity: l.intensity,
            blocks: l.blocks.length,
            blockSequence: l.blocks.map((b) => b.type),
          })),
          note: 'UPDATE-by-upsert on (course_slug, slug); slugs + sorts preserved; status published.',
        },
        null,
        2,
      ),
    )
    return
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (load .env.local).')
    process.exit(1)
  }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  // 0. Guard: the course must already exist (seeded by ingest-career-os.ts).
  const { data: course, error: courseErr } = await sb
    .from('academy_courses')
    .select('slug')
    .eq('slug', COURSE_SLUG)
    .maybeSingle()
  if (courseErr) throw courseErr
  if (!course) {
    console.error(
      `Course "${COURSE_SLUG}" not found. Run ingest-career-os.ts --apply first, then re-run this seed.`,
    )
    process.exit(1)
  }

  // 1. UPDATE the four existing skeleton lessons in place by upserting on
  //    (course_slug, slug) with full authored blocks. Slugs + sorts are
  //    preserved (learner progress + evidence reference slugs). Idempotent.
  for (const l of lessons) {
    const { error } = await sb.from('academy_lessons').upsert(
      {
        course_slug: COURSE_SLUG,
        slug: l.slug,
        title: l.title,
        eyebrow: l.eyebrow,
        module_title: MODULE_TITLE,
        module_sort: MODULE_SORT,
        sort: l.sort,
        est_minutes: l.est_minutes,
        is_free_preview: l.is_free_preview,
        status: 'published',
        intensity: l.intensity,
        blocks: l.blocks,
      },
      { onConflict: 'course_slug,slug' },
    )
    if (error) throw error
  }

  // 2. Maintain the denormalized lesson counter on the course.
  const { count } = await sb
    .from('academy_lessons')
    .select('id', { count: 'exact', head: true })
    .eq('course_slug', COURSE_SLUG)
    .eq('status', 'published')
  await sb.from('academy_courses').update({ lessons: count ?? 0 }).eq('slug', COURSE_SLUG)

  console.log(
    `Authored "${MODULE_TITLE}" — updated ${lessons.length} lessons (${lessons
      .map((l) => l.slug)
      .join(', ')}). Course now has ${count ?? 0} published lesson(s).`,
  )
}

main().catch((err) => {
  console.error('seed failed:', err)
  process.exit(1)
})
