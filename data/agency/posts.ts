/**
 * THE PROOF LOG — typed post model for the agency blog.
 *
 * Body copy is stored as a typed block array (no markdown pipeline, no HTML
 * strings). Inline emphasis inside para/list/checklist text uses a minimal
 * marker syntax — **bold**, *em*, `code` — parsed into typed segments by
 * `parseInline` and rendered as real React elements. Nothing is ever
 * injected as raw HTML.
 */

export type PostCategory =
  | 'AI QUALITY'
  | 'BROWSER QA'
  | 'RELEASE SAFETY'
  | 'OPERATIONS'
  | 'DOCUMENTATION'

/** Category → semantic accent token (workflow-stage semantics from agency.css). */
export const CATEGORY_ACCENT: Record<PostCategory, string> = {
  'AI QUALITY': 'var(--acc-ai)',
  'BROWSER QA': 'var(--acc-browser)',
  'RELEASE SAFETY': 'var(--acc-pass)',
  OPERATIONS: 'var(--acc-primary)',
  DOCUMENTATION: 'var(--acc-log)',
}

export type PostBlock =
  | { kind: 'para'; text: string; variant?: 'lead' | 'closing' }
  | { kind: 'h2'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'code'; lines: string[] }
  | { kind: 'callout'; label: string; text: string }
  | { kind: 'checklist'; label: string; items: string[] }

export interface Post {
  slug: string
  title: string
  dek: string
  category: PostCategory
  /** CSS accent token, e.g. 'var(--acc-ai)'. Always CATEGORY_ACCENT[category]. */
  accent: string
  /** Display date, mono meta format, e.g. '01 JUL 2026'. 'TBD' for drafts. */
  date: string
  readMin: number
  proves: string[]
  /** Root-absolute anchor into the homepage, e.g. '/#sage-kernel-course-auditor'. */
  caseStudyAnchor?: string
  status: 'published' | 'draft'
  blocks: PostBlock[]
}

/* ---------- inline segment parser (safe, no HTML) ---------- */

export type InlineSegment =
  | { type: 'text'; text: string }
  | { type: 'bold'; text: string }
  | { type: 'em'; text: string }
  | { type: 'code'; text: string }

const INLINE_TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g

/**
 * Parses **bold**, *em*, and `code` markers into typed segments.
 * Unmatched markers pass through as plain text — never throws, never
 * produces HTML.
 */
export function parseInline(source: string): InlineSegment[] {
  const segments: InlineSegment[] = []
  for (const part of source.split(INLINE_TOKEN)) {
    if (part === '') continue
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      segments.push({ type: 'bold', text: part.slice(2, -2) })
    } else if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      segments.push({ type: 'code', text: part.slice(1, -1) })
    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      segments.push({ type: 'em', text: part.slice(1, -1) })
    } else {
      segments.push({ type: 'text', text: part })
    }
  }
  return segments
}

/* ---------- posts ---------- */

const TESTING_PROBABILISTIC_AI: Post = {
  slug: 'testing-probabilistic-ai',
  title: 'How I test AI systems when the answer is probabilistic',
  dek: "You can't assert equality on a model's output. You can assert properties — grounding, structure, refusal behavior, and drift. This is the harness that makes AI answers testable.",
  category: 'AI QUALITY',
  accent: CATEGORY_ACCENT['AI QUALITY'],
  date: '01 JUL 2026',
  readMin: 7,
  proves: ['EVAL DESIGN', 'REGRESSION THINKING', 'HUMAN-IN-THE-LOOP JUDGMENT'],
  caseStudyAnchor: '/#sage-kernel-course-auditor',
  status: 'published',
  blocks: [
    {
      kind: 'para',
      variant: 'lead',
      text: "**The unit-test mindset dies on contact with an LLM.** The first thing every engineer tries is `assert output === expected` — and it fails immediately, because the model produced a perfectly good answer worded differently. The wrong conclusion is that AI systems can't be tested. The right conclusion is that you're testing the wrong thing.",
    },
    { kind: 'h2', text: 'Stop testing strings. Test properties.' },
    {
      kind: 'para',
      text: 'A probabilistic answer still has deterministic properties. Those are your assertions:',
    },
    {
      kind: 'list',
      items: [
        '**Grounding** — every claim cites a source that was actually in the retrieved set. An answer citing outside it fails, no matter how good it sounds.',
        '**Structure** — the output parses, matches the schema, includes required fields. This is a plain old assertion.',
        "**Behavior** — the system refuses when it should: off-topic, injection attempts, questions the corpus can't answer.",
        "**Drift** — the score on a fixed golden set doesn't fall when the prompt, model, or index changes.",
      ],
    },
    {
      kind: 'code',
      lines: [
        '// one eval case — properties, not prose',
        '{',
        '  "id": "refund-policy-04",',
        '  "question": "Can I get a refund after 30 days?",',
        '  "must_cite": ["policies/refunds.md"],',
        '  "must_not": ["hallucinated_source", "definitive_legal_advice"],',
        '  "expected_behavior": "answer_with_caveat",',
        '  "rubric": ["grounded", "complete", "correct_refusal_scope"]',
        '}',
      ],
    },
    { kind: 'h2', text: 'The anatomy of the harness' },
    {
      kind: 'para',
      text: 'Four parts, all versioned in the repo next to the code they test:',
    },
    {
      kind: 'para',
      text: '**A golden set** of question → expected-source pairs, built from real usage and deliberately seeded with traps: questions the corpus can\'t answer, near-duplicate sources, and adversarial phrasings. **A scoring rubric** that turns "is this good?" into named, checkable dimensions. **Versioned prompts** with a changelog — a prompt edit is a code change and gets the same review. **A runner** that emits a JSON report per run, so results diff cleanly and archive with the release.',
    },
    {
      kind: 'callout',
      label: 'FIELD RULE',
      text: "If the eval result isn't a file you can attach to a release, it's a vibe check with extra steps.",
    },
    { kind: 'h2', text: 'Three graders, in order of trust' },
    {
      kind: 'para',
      text: '**1. Exact checks** — schema validation, citation-set membership, banned-phrase scans. Cheap, deterministic, run on everything. **2. Heuristic rubric scoring** — length bounds, required-topic coverage, source counts. Slightly fuzzy, still explainable. **3. LLM-as-judge** — useful for nuance like tone and completeness, but a judge is itself a probabilistic system: it gets its own spot-checks against human grades, and it never gets the final word on a release by itself.',
    },
    { kind: 'h2', text: 'Treat every change as a regression risk' },
    {
      kind: 'para',
      text: "Model swap, prompt edit, re-chunked index, new embedding version — each one reruns the full golden set, and the diff of scores is reviewed like a failing CI run. The most dangerous failures are silent: retrieval quietly returning worse sources while answers stay fluent. That's why retrieval gets its own smoke tests, separate from answer quality — you need to know *which layer* regressed.",
    },
    { kind: 'h2', text: 'Human review is a feature, not a fallback' },
    {
      kind: 'para',
      text: 'When the workflow touches users, money, or reputation, low-confidence answers route to an approval queue instead of shipping. That queue is also your best eval-case generator: every human correction is a new golden-set entry. The loop closes — production feeds the tests that guard production.',
    },
    {
      kind: 'checklist',
      label: 'THE CHECKLIST',
      items: [
        'Golden set with traps, versioned in the repo',
        'Property assertions: grounding, structure, behavior, drift',
        'Prompt changelog — prompt edits get code review',
        'JSON report per run, archived per release',
        'Separate smoke tests for the retrieval layer',
        'Approval queue for low confidence; corrections become eval cases',
      ],
    },
    {
      kind: 'para',
      variant: 'closing',
      text: 'None of this makes the model deterministic. It makes the *system* accountable — which is the actual job.',
    },
  ],
}

const PLAYWRIGHT_FLAKY_TESTS: Post = {
  slug: 'playwright-coverage-and-flaky-tests',
  title: 'How I think about Playwright coverage and flaky tests',
  dek: 'Flaky tests are production debt — diagnose the root cause or delete the test. Never retry-loop your way to green.',
  category: 'BROWSER QA',
  accent: CATEGORY_ACCENT['BROWSER QA'],
  date: '05 JUL 2026',
  readMin: 6,
  proves: ['TEST DISCIPLINE', 'CI DESIGN', 'ROOT-CAUSE THINKING'],
  caseStudyAnchor: '/#nexural-qa-os',
  status: 'published',
  blocks: [
    {
      kind: 'para',
      variant: 'lead',
      text: "**The most expensive test in your suite is the one nobody trusts.** A test that fails randomly doesn't just cost the minutes it takes to rerun — it changes how the team reads the whole board. The first time an engineer sees red, shrugs, and clicks re-run, CI has stopped being a signal and started being a formality. One flake is all it takes. After that, real failures ride to production inside the noise.",
    },
    { kind: 'h2', text: 'A flake is a defect with bad PR' },
    {
      kind: 'para',
      text: "The comfortable story is that flaky tests are a testing problem — brittle selectors, an unlucky runner, cosmic rays. The uncomfortable truth is that a flake is almost always a real defect with bad branding: a race condition, a timing assumption, an order dependency, or shared state that only collides under parallelism. Sometimes the defect lives in the test. Sometimes it lives in the application, and the test is the only part of the system honest enough to mention it. That's why *just add a retry* is such a dangerous reflex — you may be silencing the one witness to a production race.",
    },
    { kind: 'h2', text: "Quarantine, don't delete" },
    {
      kind: 'para',
      text: "A fails-sometimes test can't stay in the blocking lane — it poisons trust for every test around it. But deleting it destroys evidence. The middle path is a quarantine lane with teeth: the test still runs, its results are still recorded, and it no longer blocks merges. The teeth are the terms. A quarantined test has a named owner, a ticket, and an expiry date. When the expiry hits, either the root cause is fixed and the test returns to the blocking lane, or the test is deleted honestly — with a record of what coverage was lost and why. Quarantine without an expiry is just a graveyard with better marketing.",
    },
    {
      kind: 'code',
      lines: [
        '// quarantine lane — owner, ticket, expiry, or it doesn\'t go in',
        "test.fixme('checkout survives double-submit', async ({ page }) => {",
        '  // QUARANTINE: QA-412 — race between cart lock and payment intent',
        '  // OWNER: jason · EXPIRES: 19 JUL 2026 — fix or delete, no third option',
        '  // ...',
        '})',
      ],
    },
    { kind: 'h2', text: 'Determinism is a build target' },
    {
      kind: 'para',
      text: "Deterministic tests don't happen by discipline alone. They happen by design, the same way a performance budget does — engineered in, then defended:",
    },
    {
      kind: 'list',
      items: [
        '**Kill shared state** — no two tests touch the same record, user, or global. Isolation is what makes parallelism boring instead of terrifying.',
        '**Control the clock** — a test that depends on real time depends on the weather. Inject the clock; freeze it; advance it deliberately.',
        "**Await conditions, not timeouts** — `waitForTimeout` is a guess wearing a stopwatch. Wait for the request to settle, the element to attach, the state to change.",
        '**Seed data per test** — each test creates what it needs and owns what it creates, so execution order stops mattering.',
      ],
    },
    {
      kind: 'callout',
      label: 'FIELD RULE',
      text: 'A retry hides a defect. A quarantine files it.',
    },
    { kind: 'h2', text: 'The ratchet' },
    {
      kind: 'para',
      text: "None of this holds without a number. Flake rate — how often a test fails and then passes on unchanged code — is a tracked metric on the suite, the same as duration or coverage. And it only moves one direction: new flakes fail the PR that introduced them, while the existing backlog burns down through the quarantine lane. That's the ratchet. Without it, every sprint adds a little noise, and a year later the suite is a slot machine. With it, flakiness is a bounded, shrinking debt with a name attached to every entry.",
    },
    {
      kind: 'checklist',
      label: 'THE CHECKLIST',
      items: [
        'A flake is a defect until root-caused — in the test or the app',
        'Quarantine lane: still runs, never blocks, always recorded',
        'Every quarantined test has an owner, a ticket, and an expiry',
        'At expiry: fixed and reinstated, or deleted honestly',
        'Determinism mechanics: isolated state, controlled clock, condition waits, per-test data',
        'Flake rate is tracked; new flakes fail the PR that introduced them',
      ],
    },
    {
      kind: 'para',
      variant: 'closing',
      text: "Coverage tells you what the suite watches. Trust decides whether anyone listens. A green board only means something when red does too — and red only means something when it can't be shrugged off as *probably just flaky*.",
    },
  ],
}

const RELEASE_GATE_TRUST_CONTRACT: Post = {
  slug: 'release-gate-trust-contract',
  title: 'A release gate is a trust contract, not a checklist',
  dek: 'A gate earns its place when a non-QA stakeholder can read the output and make a ship decision.',
  category: 'RELEASE SAFETY',
  accent: CATEGORY_ACCENT['RELEASE SAFETY'],
  date: '08 JUL 2026',
  readMin: 6,
  proves: ['RELEASE ENGINEERING', 'CI/CD DESIGN', 'VERDICT THINKING'],
  caseStudyAnchor: '/#dashboard-audit-loop',
  status: 'published',
  blocks: [
    {
      kind: 'para',
      variant: 'lead',
      text: "**Every team has a release gate. On most teams, it's a person.** Somewhere in the deploy path there's someone whose gut feeling is the real approval — and everything blocks on their availability, their memory, and their mood. Gut feelings don't scale, don't transfer, and don't survive vacations. Verdicts do. The difference between the two is whether *ready* is something a system computed or something a human felt.",
    },
    { kind: 'h2', text: 'Readiness is a generated artifact' },
    {
      kind: 'para',
      text: "A real gate doesn't answer *can we ship?* in a chat thread. It emits a machine-readable report — the checks that ran, the result of each, and a single verdict — attached to the exact build it describes. That file is the contract. Anyone can open it: the engineer who wrote the change, the stakeholder deciding the launch, the person doing archaeology on an incident months later. Because the verdict travels with the artifact, *was this release ready?* has an answer that doesn't depend on who you ask or how well they remember.",
    },
    { kind: 'h2', text: 'What belongs in the gate' },
    {
      kind: 'para',
      text: "Only checks with a crisp fail state. Typecheck and the test suite are the floor. Accessibility scans, performance budgets, and migration safety belong there too — each one owning a clear pass condition: within budget, zero violations above an agreed severity, reversible with no destructive operations. **A check without a crisp fail state is a vibe.** Vibes don't belong in a gate; they belong in review, where a human can weigh them. The gate is for questions a machine can answer identically every single time.",
    },
    {
      kind: 'code',
      lines: [
        '// readiness-report.json — the verdict is a file, not a feeling',
        '{',
        '  "commit": "3f2c91a",',
        '  "generated_at": "2026-07-08T14:00:00Z",',
        '  "checks": [',
        '    { "name": "typecheck",        "status": "pass" },',
        '    { "name": "test_suite",       "status": "pass" },',
        '    { "name": "a11y_scan",        "status": "pass" },',
        '    { "name": "perf_budget",      "status": "pass" },',
        '    { "name": "migration_safety", "status": "pass" }',
        '  ],',
        '  "verdict": "SHIP"',
        '}',
      ],
    },
    { kind: 'h2', text: 'Fail loudly, ship boringly' },
    {
      kind: 'para',
      text: "The gate's job is to make shipping uneventful. A deploy should be the most boring moment of the week — every interesting question was asked and answered before the artifact got near production. So when the gate goes red, that's not the process failing; that's the system working. The drama happened in CI instead of in front of users, which is the entire point. The failure mode to fear is the quiet one: a gate so soft it always passes. That isn't a gate. It's a rubber stamp with YAML syntax.",
    },
    {
      kind: 'callout',
      label: 'FIELD RULE',
      text: "If 'ready' isn't a file, it's a feeling.",
    },
    { kind: 'h2', text: 'Gates guard the gate-keepers' },
    {
      kind: 'para',
      text: "The gate runs in CI, not on a laptop. That one decision does more for integrity than any policy document: nobody can skip it quietly, forget a step, or run a friendlier local version — and *nobody* includes me. This site eats its own cooking: its release gate runs on the build and writes the readiness report you can read in the hero. If I could route around my own gate, every claim on this page would be worth exactly nothing. A gate you can bypass is a suggestion. A gate in the pipeline is a contract.",
    },
    {
      kind: 'checklist',
      label: 'THE CHECKLIST',
      items: [
        'The gate emits a machine-readable report, attached to the build it describes',
        'Every check owns a crisp pass condition — no vibes in the gate',
        'Floor: typecheck, tests, a11y, perf budgets, migration safety',
        'One verdict a non-engineer can read and act on without a meeting',
        'The gate runs in CI — no laptop runs, no quiet skips, no exceptions',
        'A red gate is the system succeeding, not the process failing',
      ],
    },
    {
      kind: 'para',
      variant: 'closing',
      text: 'A checklist asks a person to remember. A contract lets anyone verify. Ship the second one.',
    },
  ],
}

/** Draft stubs — titles + theses from the homepage writing section. No body yet. */
const DRAFTS: Post[] = [
  {
    slug: 'reliable-automation-before-production',
    title: 'What a reliable automation workflow needs before production',
    dek: "A workflow isn't done until someone else can run it, inspect it, and recover it.",
    category: 'OPERATIONS',
    accent: CATEGORY_ACCENT.OPERATIONS,
    date: 'TBD',
    readMin: 0,
    proves: ['OPERATIONAL MATURITY'],
    status: 'draft',
    blocks: [],
  },
  {
    slug: 'demo-bot-vs-operational-ai-workflow',
    title: 'The difference between a demo bot and an operational AI workflow',
    dek: 'A demo proves possibility. An operational workflow proves repeatability under failure.',
    category: 'AI QUALITY',
    accent: CATEGORY_ACCENT['AI QUALITY'],
    date: 'TBD',
    readMin: 0,
    proves: ['PRODUCTION THINKING'],
    status: 'draft',
    blocks: [],
  },
]

export const POSTS: readonly Post[] = [
  TESTING_PROBABILISTIC_AI,
  PLAYWRIGHT_FLAKY_TESTS,
  RELEASE_GATE_TRUST_CONTRACT,
  ...DRAFTS,
]

export const PUBLISHED_POSTS: readonly Post[] = POSTS.filter((p) => p.status === 'published')

export const DRAFT_POSTS: readonly Post[] = POSTS.filter((p) => p.status === 'draft')

export function getPublishedPost(slug: string): Post | undefined {
  return PUBLISHED_POSTS.find((p) => p.slug === slug)
}
