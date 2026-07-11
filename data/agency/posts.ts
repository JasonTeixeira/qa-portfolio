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
    slug: 'playwright-coverage-and-flaky-tests',
    title: 'How I think about Playwright coverage and flaky tests',
    dek: 'Flaky tests are production debt — diagnose the root cause or delete the test. Never retry-loop your way to green.',
    category: 'BROWSER QA',
    accent: CATEGORY_ACCENT['BROWSER QA'],
    date: 'TBD',
    readMin: 0,
    proves: ['QA STRATEGY'],
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
  {
    slug: 'release-gate-trust-contract',
    title: 'A release gate is a trust contract, not a checklist',
    dek: 'A gate earns its place when a non-QA stakeholder can read the output and make a ship decision.',
    category: 'RELEASE SAFETY',
    accent: CATEGORY_ACCENT['RELEASE SAFETY'],
    date: 'TBD',
    readMin: 0,
    proves: ['COMMUNICATION'],
    status: 'draft',
    blocks: [],
  },
]

export const POSTS: readonly Post[] = [TESTING_PROBABILISTIC_AI, ...DRAFTS]

export const PUBLISHED_POSTS: readonly Post[] = POSTS.filter((p) => p.status === 'published')

export const DRAFT_POSTS: readonly Post[] = POSTS.filter((p) => p.status === 'draft')

export function getPublishedPost(slug: string): Post | undefined {
  return PUBLISHED_POSTS.find((p) => p.slug === slug)
}
