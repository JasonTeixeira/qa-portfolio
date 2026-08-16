/**
 * Seed Course 00 · Module 1 — "Framing & Diagnosis".
 *
 * Transforms the four foundation lessons of the Engineering Judgment course from
 * their source scaffold into full, world-class academy lessons. This is a
 * JUDGMENT course (decision-making under ambiguity), not a coding course — so the
 * "win" each lesson produces is a REVIEWABLE ARTIFACT (a decision memo), not a
 * passing Pyodide lab. The artifact bar is expressed through sprint-contract +
 * verification; strong-vs-weak reasoning through compare; the worked judgment
 * call through code-walkthrough (the memo grown one line at a time).
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

<!-- Sections 2–4 are added in Lessons 2, 3 and the capstone (Lesson 4). -->`

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
    text: 'A war room: checkout is slow, the VP wants it "fixed by Friday," three people are already arguing about Redis. The staff engineer asks one sentence — "What is actually failing, and for whom?" — and the room goes silent, because nobody framed it.',
  },
  {
    type: 'context',
    text: 'Every real decision starts ambiguous: partial evidence, stakeholders who disagree, a clock running. The frame converts "everyone is anxious" into one decision, one constraint, one unacceptable failure — Section 1 of the memo you carry through all four lessons.',
  },
  {
    type: 'pretest',
    prompt:
      '"We need to add a cache to the orders service." Before you debate caching — what is wrong with that as a problem statement? Answer before reading on.',
    reveal:
      'It is an answer wearing a problem\'s clothes. "Add a cache" presumes the problem is read latency, the cause is recomputation, and the fix is caching — three unproven leaps. The real frame: "p99 order-confirmation latency is 4s, the SLO is 1s, and we do not yet know why." Naming the fix first feels like progress while quietly deciding the answer.',
  },
  {
    type: 'concept',
    title: 'A frame is problem + constraint + feared failure — and no solution',
    text: 'State the real problem in one solution-free sentence, the one non-negotiable constraint, and the specific failure you fear. The invariant: the frame holds the problem, never the answer. A solution in the problem line means you pre-decided.',
  },
  {
    type: 'compare',
    title: 'Same trigger, two frames',
    subtitle: 'Trigger: "Search is broken, customers are complaining." Only one is a frame.',
    left: {
      label: 'Disguised solution',
      tone: 'warning',
      lines: [
        'Problem: "search is broken, reindex tonight"',
        'Solution fused into the problem line',
        'Constraint: "make it fast" (decoration)',
        'Feared failure: "it stays broken" (a vibe)',
        'A peer cannot restate it without the fix',
      ],
      verdict: 'Pre-decided — defends a guess',
    },
    right: {
      label: 'Real frame',
      tone: 'success',
      lines: [
        'Problem: recent products missing for ~30% of queries',
        'Quantified: how much, who, since when',
        'Constraint: no daytime downtime (primary conversion path)',
        'Feared failure: cluster outage OR silent conversion loss',
        'Zero solution inside it — opponent would sign it',
      ],
      verdict: 'Diagnosable — aims every later move',
    },
    caption: 'Measure the pain (how much, who, since when), never the fix. "3 more replicas" is a measured answer, still an answer.',
  },
  {
    type: 'code-walkthrough',
    title: 'Writing Section 1, one line at a time',
    subtitle: 'The Frame template in the memo — each line a forcing function.',
    filename: MEMO,
    language: 'bash',
    code: FRAME_MEMO_TEMPLATE,
    steps: [
      { lines: [1], label: 'The header', note: 'This memo threads all four lessons — one artifact, grown a section at a time.' },
      { lines: [4], label: 'Decision + deadline', note: 'Name the call and when it is due. "ship | rollback | instrument | redesign" — pick the verb, not a hunch.' },
      { lines: [5], label: 'The problem line', note: 'One sentence, no solution in it. If it names a technology or an action you would take, you smuggled in the answer.' },
      { lines: [6], label: 'The hard constraint', note: 'The one thing that is NOT negotiable — and it must rule out at least one plausible option, or it is decoration.' },
      { lines: [7], label: 'Feared failure', note: 'Specific enough to recognize in a dashboard. The strong version names both a false-positive and a false-negative.' },
      { lines: [8], label: 'Reversibility', note: 'One-way vs two-way door sets how much proof the later lessons demand.' },
    ],
    caption: 'A peer should read these five lines and restate the problem back to you without correction.',
  },
  {
    type: 'diagram',
    title: 'The anatomy of a frame',
    subtitle: 'Four parts feed the decision; the solution is deliberately OUT — it belongs to the diagnosis, not the frame.',
    rankdir: 'LR',
    nodes: [
      { id: 'problem', label: 'Problem', description: 'one sentence, solution-free', kind: 'process', tone: 'accent' },
      { id: 'constraint', label: 'Constraint', description: 'the non-negotiable', kind: 'process' },
      { id: 'feared', label: 'Feared failure', description: 'what "wrong" looks like', kind: 'process', tone: 'warning' },
      { id: 'decision', label: 'Decision', description: 'the call + deadline', kind: 'decision', tone: 'success' },
      { id: 'solution', label: 'Solution', description: 'out of scope here', kind: 'external', tone: 'muted' },
    ],
    edges: [
      { from: 'problem', to: 'decision', label: 'defines', kind: 'data' },
      { from: 'constraint', to: 'decision', label: 'bounds', kind: 'data' },
      { from: 'feared', to: 'decision', label: 'raises the bar', kind: 'data', tone: 'warning' },
      { from: 'solution', to: 'problem', label: 'must NOT leak in', kind: 'control', dashed: true, tone: 'muted' },
    ],
    legend: [
      { tone: 'accent', label: 'the problem (the whole skill)' },
      { tone: 'warning', label: 'feared failure' },
      { tone: 'muted', label: 'kept out on purpose' },
    ],
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'The tell that separates senior from mid: a senior engineer states the problem in a sentence the person who disagrees with them would also sign. If your frame only sounds true to people who already favor your fix, it is a campaign, not a frame.',
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
    type: 'transfer',
    text: 'Not a software move — the move. A doctor frames before treating ("chest pain, 55, fear is an MI, constraint is we cannot wait for slow labs"). A founder frames before building. Anywhere a decision is ambiguous and a clock is running, the Frame is the first artifact. Next lesson keeps this exact memo and adds Section 2 — the Diagnostic Route — turning your feared failure into an ordered plan for finding the real cause.',
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
- Hypothesis A (lag): index worker is behind        → kill-test: newest indexed doc vs newest DB write  → cost: cheap
- Hypothesis B (silent-fail): worker crashes on some events → kill-test: worker error-log + dead-letter count → cost: cheap
- Hypothesis C (stale-cache): query layer serves old results → kill-test: bypass cache, re-query primary → cost: mid
- Run order (cheapest disqualifier first): A → B → C
- Stop rule: one branch confirmed by evidence, or 30 min elapsed → decide`

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
    text: 'Same incident, two engineers: "payments are failing intermittently." The first digs into the code she wrote last week and burns four hours. The second writes three hypotheses, picks the one a 2-minute query could rule out, and crosses off a third of the search space before the first opens a file. One had a route; one had a hunch.',
  },
  {
    type: 'context',
    text: 'Diagnosis is search through a space of causes, and ambiguous problems have large spaces. The amateur searches where the light is good (the code they own); the senior searches where information is densest per unit of effort. The Route makes that discipline visible — Section 2 of the memo.',
  },
  {
    type: 'pretest',
    prompt:
      'Three suspects, limited time. Do you investigate the one you think is MOST likely first — or something else? Decide before reading.',
    reveal:
      'Not the most likely — the most CHEAPLY DISQUALIFIABLE. A 2-minute test that eliminates half the suspects whatever its result beats an hour confirming your top guess. You are not trying to be right early; you are trying to shrink the space fastest. Often the best first move is a test you expect to PASS, precisely because passing it rules a whole branch out.',
  },
  {
    type: 'concept',
    title: 'A route ranks hypotheses by information-per-cost, not by gut',
    text: 'List plausible causes, attach to each a falsifiable kill-test (a check whose "no" eliminates it), and run the cheapest disqualifier first. Every test must be able to fail. Add a stop rule — the point where you stop diagnosing and decide.',
  },
  {
    type: 'diagram',
    title: 'The diagnostic route as a decision flow',
    subtitle:
      'Frame\'s feared failure → ranked hypotheses → cheapest kill-test first → eliminate or decide. The stop rule ends the loop; "hours of lag" survives.',
    rankdir: 'LR',
    nodes: [
      { id: 'feared', label: 'Feared failure', description: 'from the Frame', kind: 'process', tone: 'muted' },
      { id: 'rank', label: 'Rank hypotheses', description: 'A lag · B silent-fail · C stale-cache', kind: 'process', tone: 'accent' },
      { id: 'cheapest', label: 'Cheapest kill-test', description: 'A: compare newest index vs DB timestamp', kind: 'decision', tone: 'accent' },
      { id: 'eliminate', label: 'Eliminate branch', description: 'a passing test is pure profit', kind: 'process', tone: 'success' },
      { id: 'stop', label: 'Stop rule', description: 'time/evidence box → decide', kind: 'decision', tone: 'warning' },
      { id: 'cause', label: 'Leading cause', description: '"index lags 5h"', kind: 'store', tone: 'success' },
    ],
    edges: [
      { from: 'feared', to: 'rank', label: 'spawns', kind: 'data' },
      { from: 'rank', to: 'cheapest', label: 'order by info/cost', kind: 'control', tone: 'accent' },
      { from: 'cheapest', to: 'eliminate', label: 'on "no"', kind: 'async', tone: 'success' },
      { from: 'eliminate', to: 'cheapest', label: 'next cheapest', kind: 'control' },
      { from: 'cheapest', to: 'cause', label: 'survivor', kind: 'data', tone: 'success' },
      { from: 'eliminate', to: 'stop', label: 'box hit?', kind: 'control', tone: 'warning' },
    ],
    legend: [
      { tone: 'accent', label: 'rank + order by information-per-cost' },
      { tone: 'success', label: 'a kill-test that eliminates a branch' },
      { tone: 'warning', label: 'stop rule — stop diagnosing, decide' },
    ],
  },
  {
    type: 'code-walkthrough',
    title: 'Writing Section 2, one line at a time',
    subtitle: 'The Route in the memo — ranked, falsifiable, ordered cheapest-first.',
    filename: MEMO,
    language: 'bash',
    code: ROUTE_MEMO_SECTION,
    steps: [
      { lines: [2], label: 'Most-likely hypothesis', note: 'A real hypothesis, not a shrug: "maybe a config issue" has no kill-test, so it cannot be on the route.' },
      { lines: [3, 4], label: 'Span layers you do not own', note: 'B and C should reach beyond your own code. Bias hides in "it must be my service".' },
      { lines: [2, 3, 4], label: 'A falsifiable kill-test each', note: 'Each test must be able to return "no" and eliminate a branch. A test that can only confirm is theater.' },
      { lines: [2, 3, 4], label: 'Cost each test', note: 'A timestamp compare is minutes; a code-path change is expensive. Cost decides the order, not your favorite suspect.' },
      { lines: [5], label: 'Cheapest disqualifier first', note: 'Order by elimination-per-minute. The first move can cross off a whole branch in one query.' },
      { lines: [6], label: 'The stop rule', note: 'A concrete time or evidence threshold — past it, diagnosis is procrastination with a stack trace.' },
    ],
    caption: 'Run the cheapest test: newest indexed doc is 5h old, DB has 2-minute-old writes — "lag" survives, found with one query.',
  },
  {
    type: 'compare',
    title: 'One guess vs a real route',
    subtitle: 'Same incident: "API returns 500s intermittently." Both feel like work; only one shrinks the space.',
    left: {
      label: 'Search where the light is good',
      tone: 'warning',
      lines: [
        'Step 1: re-read my own endpoint code',
        'Step 2: add logging to my endpoint, redeploy',
        'Step 3: maybe ask the DB team (last)',
        'Redeploy (slow) before any cheap elimination',
        'Other teams pushed last because not "mine"',
      ],
      verdict: 'Burns the on-call\'s night proving you are innocent',
    },
    right: {
      label: 'Cheapest disqualifier first',
      tone: 'success',
      lines: [
        '3+ ranked hypotheses across layers you do not own',
        'A falsifiable kill-test on each (can return "no")',
        'Step 1: gateway logs — do 500s even reach my service?',
        'One query eliminates half the stack',
        'Stop rule: a time/evidence box, not a feeling',
      ],
      verdict: 'Crosses off a branch before opening a file',
    },
    caption: 'A passing kill-test is pure profit — it permanently removes a branch. If every test "succeeds" at finding the bug, you are confirming, not diagnosing.',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'The pros run the test they expect to PASS on purpose. Beginners only test what they think is broken, so a passing test feels wasted — but it permanently removes a branch. A good route spends most of its early tests buying eliminations.',
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
    type: 'transfer',
    text: 'Same route, any domain with a hidden cause. A mechanic runs the cheap test that splits the space ("is the battery dead? click the lights") before rebuilding the engine. A growth team ranks "tracking broke / competitor moved / funnel changed" and runs the analytics check before redesigning anything. You have framed and routed; next lesson adds Section 3 — the System Map — because "index is 5h behind" only makes sense once you can see the system the lag lives in.',
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

const systemMapBlocks: LessonBlock[] = [
  {
    type: 'sprint-contract',
    outcome:
      'Draw the smallest accurate map of the system your decision lives in — components, directed flow, the suspect edge — then name the blast radius if that edge fails.',
    intensity: 'standard',
    time: '25 min',
    proof: `Section 3 of ${MEMO}: a directed map of the relevant components, the suspect edge marked, the blast radius named, an explicit out-of-scope boundary. A peer traces a request through it without you narrating.`,
    unlock: 'Your map shows directed flow, marks the suspect edge, and names the blast radius and the out-of-scope boundary.',
    doNotClaim:
      'Not a system map if you drew every box in the company. The skill is leaving things OUT on purpose — and defending each omission.',
  },
  {
    type: 'mission',
    text: 'Ninety boxes on the incident bridge’s architecture diagram, and nobody can find the failure — until a principal sketches five boxes, points to one arrow, and says “the gap is here.”',
  },
  {
    type: 'context',
    text: 'A diagnosis without a map is a finding with nowhere to live. The system map is the smallest picture that still lets you reason about flow and blast radius — not the org-wide poster.',
  },
  {
    type: 'pretest',
    prompt:
      'You are asked to draw the system for an incident. The complete architecture, or something smaller? And what makes a map USEFUL versus merely accurate?',
    reveal:
      'Useful beats complete. A map with every service is accurate and worthless — the failure is lost in the clutter. A useful map is the smallest one that still contains the decision, with directed flow and a boundary you can defend. The skill is omission with a reason.',
  },
  {
    type: 'concept',
    title: 'Directed flow + suspect edge + blast radius — kept small on purpose',
    text: 'Name the components the decision touches, the direction data flows between them, the edge where the diagnosis landed, and what breaks if it fails. As small as it can be while still holding the failure.',
  },
  {
    type: 'diagram',
    title: 'The search-lag system map',
    subtitle:
      'Six components on the write → index → read path. The suspect edge (Orders → Index Worker → Search Index) is marked; the blast radius is the stale search catalog. Payments, auth, and billing are deliberately out of scope.',
    nodes: [
      { id: 'client', label: 'Client', description: 'browser / app', kind: 'client' },
      { id: 'gateway', label: 'API Gateway', description: 'edge routing', kind: 'service' },
      { id: 'orders', label: 'Orders Service', description: 'write path', kind: 'service' },
      { id: 'postgres', label: 'Postgres', description: 'source of truth', kind: 'store', tone: 'success' },
      { id: 'worker', label: 'Index Worker', description: 'event consumer', kind: 'service', tone: 'accent' },
      { id: 'search', label: 'Search Index', description: 'stale catalog', kind: 'store', tone: 'warning' },
    ],
    edges: [
      { from: 'client', to: 'gateway', label: 'request', kind: 'sync' },
      { from: 'gateway', to: 'orders', label: 'route', kind: 'sync' },
      { from: 'orders', to: 'postgres', label: 'writes', kind: 'sync' },
      { from: 'orders', to: 'worker', label: 'emits event', kind: 'async', tone: 'accent' },
      { from: 'worker', to: 'search', label: 'indexes (LAGS)', kind: 'async', tone: 'accent' },
      { from: 'client', to: 'search', label: 'queries', kind: 'sync' },
    ],
    legend: [
      { tone: 'accent', label: 'on the suspect path' },
      { tone: 'warning', label: 'blast radius (stale index)' },
      { tone: 'success', label: 'source of truth' },
    ],
  },
  {
    type: 'code-walkthrough',
    title: 'Writing Section 3, one line at a time',
    subtitle: 'The same map as text in the memo — built up flow by flow.',
    filename: MEMO,
    language: 'bash',
    code: `## 3. System Map
[Client] --request--> [API Gateway] --> [Orders Service] --writes--> [Postgres]
                                              |
                                              +--emits event--> [Index Worker] --> [Search Index]
                                                                                         ^
              [Client] --query-----------------------------------------------------------+ (reads here)
- Suspect edge: Orders write -> Index Worker -> Search Index
- Blast radius if it fails: search shows stale catalog; conversions drop; no data loss
- Boundary we will NOT cross: the payments path is out of scope`,
    steps: [
      { lines: [2], label: 'The write path', note: 'Request routes to Orders, which writes to Postgres — the source of truth.' },
      { lines: [3, 4], label: 'The index hand-off', note: 'Orders emits an event; the Index Worker copies the write into Search. Asynchronous — this is where lag hides.' },
      { lines: [5, 6], label: 'The read path', note: 'The Client reads from Search, not Postgres. Stale here means wrong answers to customers.' },
      { lines: [7], label: 'Suspect edge', note: 'The 5-hour lag lives on write → index → search. Name it explicitly.' },
      { lines: [8], label: 'Blast radius', note: 'Stale catalog, conversions drop — but no data loss. Stale vs lost shapes urgency.' },
      { lines: [9], label: 'Boundary', note: 'Payments is out of scope — and you can defend why.' },
    ],
    caption: 'A peer should trace a fresh product from creation to "appears in search" along these arrows.',
  },
  {
    type: 'compare',
    title: 'Two maps of the same incident',
    subtitle: 'Both are true. Only one lets the room decide.',
    left: {
      label: 'Architecture poster',
      tone: 'warning',
      lines: ['~20 boxes, every service', 'No arrow directions', 'No suspect edge', 'No blast radius', 'Failure hidden in the clutter'],
      verdict: 'The call spends 20 minutes orienting',
    },
    right: {
      label: 'Decision map',
      tone: 'success',
      lines: ['6 boxes on the suspect path', 'Directed write → index → read', 'Suspect edge circled', 'Blast radius named (stale ≠ lost)', 'Payments explicitly out of scope'],
      verdict: 'The call argues the right arrow',
    },
    caption: 'Smaller and directed beats complete and flat.',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'The senior tell is the boundary, not the boxes. A map whose omissions you can each defend — "payments is out because nothing on this path touches it" — is a map a reviewer trusts.',
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
    type: 'transfer',
    text: 'Cartography of the relevant, nothing more — it travels everywhere. A surgeon studies the region they will operate on and marks where a nick is catastrophic versus survivable. You have framed, routed, and mapped; next is the Retrieval Protocol — running these three moves from memory under pressure.',
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
    text: 'It is 2 a.m., the page just fired, and there is no time to open a doc — the judgment either lives in your hands or it does not. Over three lessons you built a memo with someone watching; tonight you prove you can run it with no notes, and — harder — that you know which of your answers to trust.',
  },
  {
    type: 'context',
    text: 'Knowledge you can only retrieve with notes open is knowledge you do not have when it counts. Retrieval practice converts "I understand framing" into "I frame automatically at 2 a.m." Calibration — scoring confidence and checking it against truth — stops the most dangerous engineer: the one confidently wrong who never finds out.',
  },
  {
    type: 'pretest',
    prompt:
      'You feel 5/5 confident about a diagnosis. Is high confidence good news or a warning sign? Decide before reading.',
    reveal:
      'Unverified data — and on its own, a mild warning. Confidence and correctness are different axes; the dangerous quadrant is high-confidence-and-wrong, because you stop checking exactly when you should not. Logging confidence is not to feel sure — it is to find the gap between how sure you felt and how right you were. A calibrated engineer is the one whose confidence predicts their accuracy.',
  },
  {
    type: 'concept',
    title: 'A protocol is the three moves from memory, scored for calibration',
    text: 'A closed-note checklist that runs the module — Frame, Route, Map, then Decide — from memory, with a 1–5 confidence per step. After proof, you compare confidence to reality and log every gap. Passed only when run closed-note AND checked against truth: recall plus calibration, never one without the other.',
  },
  {
    type: 'diagram',
    title: 'The closed-note loop — four moves, scored and proven',
    subtitle:
      'Frame → Route → Map → Decide, each run from memory with a confidence score, then PROVE feeds back the calibration repair. This is the whole module in one circuit.',
    rankdir: 'LR',
    nodes: [
      { id: 'frame', label: 'Frame', description: 'L1 · problem · constraint · feared failure', kind: 'process', tone: 'accent' },
      { id: 'route', label: 'Route', description: 'L2 · ranked hypotheses · kill-tests', kind: 'process', tone: 'accent' },
      { id: 'map', label: 'Map', description: 'L3 · directed flow · suspect edge · blast radius', kind: 'process', tone: 'accent' },
      { id: 'decide', label: 'Decide', description: 'chosen · rejected · reversal condition', kind: 'decision', tone: 'success' },
      { id: 'prove', label: 'Prove + calibrate', description: 'confidence vs reality', kind: 'decision', tone: 'warning' },
      { id: 'repair', label: 'Repair', description: 'a reusable rule per miss', kind: 'store', tone: 'warning' },
    ],
    edges: [
      { from: 'frame', to: 'route', label: 'closed-note', kind: 'control', tone: 'accent' },
      { from: 'route', to: 'map', label: 'closed-note', kind: 'control', tone: 'accent' },
      { from: 'map', to: 'decide', label: 'closed-note', kind: 'control', tone: 'accent' },
      { from: 'decide', to: 'prove', label: 'score 1–5/step', kind: 'data' },
      { from: 'prove', to: 'repair', label: 'where confidence > truth', kind: 'async', tone: 'warning' },
      { from: 'repair', to: 'frame', label: 'sharpens next run', kind: 'control', dashed: true, tone: 'muted' },
    ],
    legend: [
      { tone: 'accent', label: 'the four moves, run from memory' },
      { tone: 'success', label: 'the decision the module exists to make' },
      { tone: 'warning', label: 'calibration — the gap, and its repair' },
    ],
  },
  {
    type: 'code-walkthrough',
    title: 'Running the protocol, one checkbox at a time',
    subtitle: 'The closed-note checklist + calibration log — the whole module made portable.',
    filename: MEMO,
    language: 'bash',
    code: RETRIEVAL_PROTOCOL_SECTION,
    steps: [
      { lines: [2], label: 'Frame, from memory (L1)', note: 'Problem · constraint · feared failure, no notes. Score how sure you are BEFORE you check it.' },
      { lines: [3], label: 'Route, from memory (L2)', note: 'Three ranked hypotheses, a kill-test each, cheapest first. The timestamp compare was the cheapest disqualifier.' },
      { lines: [4], label: 'Map, from memory (L3)', note: 'Directed flow, suspect edge, blast radius, boundary. This is the step self-scores overclaim most — grade it harshly.' },
      { lines: [5], label: 'Decide', note: 'Chosen (fix the lagging worker + backfill), rejected (full reindex — violates no-daytime-downtime), reversal condition (off-hours reindex if backfill misses 30 min).' },
      { lines: [8, 9], label: 'Calibration: confidence vs reality', note: 'The Map missed the Index Worker also feeds Analytics. 3/5 was too confident — that honest miss is the most useful line here.' },
      { lines: [10], label: 'The repair', note: 'A reusable rule, not "be more careful": "before declaring blast radius, ask who else reads from this node."' },
    ],
    caption: 'Run it from memory, score, prove, then log one honest gap (or a defended "verified, none over"). The miss IS the deliverable.',
  },
  {
    type: 'compare',
    title: 'Two calibration logs, same engineer',
    subtitle: 'One trains reading; one trains judgment. The difference is the whole lesson.',
    left: {
      label: 'Confidence brag (open-note)',
      tone: 'warning',
      lines: [
        'Ran with the Lesson 1–3 memo open in another tab',
        'Frame 5/5 · Route 5/5 · Map 5/5 · Decide 5/5',
        '"I was confident and it all felt right"',
        'No comparison to reality — no axis of truth',
        'Confident-and-wrong is invisible by construction',
      ],
      verdict: 'Tests reading, not 2 a.m. recall',
    },
    right: {
      label: 'Honest calibration (closed-note)',
      tone: 'success',
      lines: [
        'Ran from memory, notes closed',
        'Confidence scored per step BEFORE checking',
        'Each step compared to proof',
        'One honest gap logged: Map 3/5, missed Analytics edge',
        'Repair = a reusable rule that prevents the miss class',
      ],
      verdict: 'Proves pressure performance + calibration',
    },
    caption: 'A 5/5 that turns out wrong is the most valuable line in the log. A flawless-looking log with no honest miss teaches you nothing.',
  },
  {
    type: 'callout',
    tone: 'note',
    text: 'The trait that correlates with senior judgment is not being right more often — it is knowing when you are not. "70% on this, here is what would change my mind" is worth more in a room than reflexive 100%, because the first one\'s confidence is information and the second one\'s is noise.',
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
