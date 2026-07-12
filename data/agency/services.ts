import type { DiagAccent } from '@/components/agency/diagrams/primitives'
import type { GlyphKind } from '@/components/agency/diagrams/glyphs'

/**
 * SERVICES — the three fixed-scope contract engagements.
 *
 * Source of truth for offer names + taglines is the contact section
 * (components/agency/sections/contact.tsx); the copy here must stay
 * consistent with it. No invented metrics: no prices, timelines, or client
 * counts — deliverables and process only. CTA is always the booking link.
 */

export type ServiceId = 'ai-workflow-build' | 'test-coverage-sprint' | 'release-gate-setup'

export interface ServiceStage {
  label: string
  accent: DiagAccent
  glyph: GlyphKind
  detail: string
}

export interface ServiceFaq {
  q: string
  a: string
}

export interface Service {
  id: ServiceId
  kicker: string
  accent: DiagAccent
  title: string
  tagline: string
  whatYouGet: readonly string[]
  process: readonly ServiceStage[]
  goodFit: readonly string[]
  badFit: readonly string[]
  faq: readonly ServiceFaq[]
}

export const SERVICES: readonly Service[] = [
  {
    id: 'ai-workflow-build',
    kicker: 'AI SYSTEMS',
    accent: 'ai',
    title: 'AI Workflow Build',
    tagline:
      'You get a working AI workflow with an eval harness, guardrails, and an approval queue — plus the golden set and runbook that keep it honest after handoff.',
    whatYouGet: [
      'A working AI workflow wired into your stack — trigger, model, checks, output — not a notebook demo',
      'A golden set: real inputs with agreed-correct outputs, used to score every change',
      'An eval harness that runs on every prompt or model change and reports pass/fail',
      'Guardrails and an approval queue — low-confidence outputs route to a human, nothing fails silently',
      'Structured logs for every run: inputs, outputs, scores, and decisions are inspectable',
      'A runbook and a recorded walkthrough so your team can operate and extend it without me',
    ],
    process: [
      {
        label: 'AUDIT',
        accent: 'log',
        glyph: 'log',
        detail: 'Map the manual process, its inputs, and where it breaks today.',
      },
      {
        label: 'GOLDEN SET',
        accent: 'ai',
        glyph: 'retrieval',
        detail: 'Agree on real inputs with known-correct outputs before anything is built.',
      },
      {
        label: 'BUILD',
        accent: 'primary',
        glyph: 'pipeline',
        detail: 'Wire the workflow into your stack — trigger, model, checks, output.',
      },
      {
        label: 'EVALS',
        accent: 'browser',
        glyph: 'eval',
        detail: 'Score the workflow against the golden set; failing evals block changes.',
      },
      {
        label: 'HANDOFF',
        accent: 'pass',
        glyph: 'human',
        detail: 'Runbook, walkthrough, and the harness that keeps it honest — you own all of it.',
      },
    ],
    goodFit: [
      'A process your team repeats every week, with clear inputs and a checkable definition of "correct"',
      'You would rather have a narrower workflow you can trust than a broad one that guesses',
      'Someone on your side can spend a little time each week reviewing outputs while we build',
    ],
    badFit: [
      'You want a demo for a pitch deck, not a system that runs in production',
      'The task has no checkable right answer — if nobody can say what correct looks like, an eval can’t either',
      'You need model training or ML research — this is workflow engineering on top of existing models',
    ],
    faq: [
      {
        q: 'How do we start?',
        a: 'With a working session to map the process you want automated — inputs, outputs, edge cases, and what "correct" means. The first artifacts are a findings doc and a scoped plan, and nothing gets built until you have approved that scope.',
      },
      {
        q: 'Who owns the code and IP?',
        a: 'You do. The workflow is built in your repositories, on your accounts and API keys. Code, prompts, golden set, evals, and docs are yours outright — nothing routes through my infrastructure after handoff.',
      },
      {
        q: 'What happens if the evals fail?',
        a: 'That is the harness doing its job. A failing eval blocks the change that caused it, and the run log shows which inputs failed and why. If quality can’t reach the bar we agreed on, we scope down to the slice that passes instead of shipping something that guesses.',
      },
    ],
  },
  {
    id: 'test-coverage-sprint',
    kicker: 'QA COVERAGE',
    accent: 'browser',
    title: 'Test Coverage Sprint',
    tagline:
      'You get your critical flows under Playwright coverage, running in CI, with trace-backed reports your team can actually read.',
    whatYouGet: [
      'Your critical user flows under Playwright end-to-end coverage — scoped and agreed before a single test is written',
      'The suite running in your CI on every push, not on my laptop',
      'Trace-backed failure reports: every red test carries a trace, screenshots, and steps to reproduce',
      'Flake discipline: deterministic waits, resilient selectors, and a quarantine path for genuinely flaky cases',
      'A coverage map that says what is protected — and, just as honestly, what isn’t',
      'Docs and a recorded walkthrough so your team can write the next test without me',
    ],
    process: [
      {
        label: 'AUDIT',
        accent: 'log',
        glyph: 'log',
        detail: 'Read the product and your failure history; find where regressions actually hurt.',
      },
      {
        label: 'FLOW MAP',
        accent: 'ai',
        glyph: 'browser',
        detail: 'Rank the critical user journeys and agree the coverage scope in writing.',
      },
      {
        label: 'BUILD',
        accent: 'primary',
        glyph: 'terminal',
        detail: 'Write the Playwright suite — deterministic waits, resilient selectors, no sleep() theater.',
      },
      {
        label: 'CI WIRE',
        accent: 'browser',
        glyph: 'repo',
        detail: 'Run the suite in your CI on every push, with traces attached to every failure.',
      },
      {
        label: 'HANDOFF',
        accent: 'pass',
        glyph: 'human',
        detail: 'Coverage map, docs, and a walkthrough — your team writes the next test.',
      },
    ],
    goodFit: [
      'A product with real users where regressions keep escaping and manual QA can’t keep up',
      'You have CI, or are willing to add it — the suite gates merges, it doesn’t decorate a README',
      'The flows exist and mostly work — we are protecting behavior, not designing it',
    ],
    badFit: [
      'The UI is being redesigned next month — tests written now would be rework; wait for stability',
      'You want a test count for a compliance checkbox rather than coverage that catches regressions',
    ],
    faq: [
      {
        q: 'How do we start?',
        a: 'With a short audit of the product and your recent failure history. That produces a ranked flow map — which user journeys hurt most when they break — and you approve the scoped flow list before any test is written.',
      },
      {
        q: 'Who owns the tests?',
        a: 'You do. The tests live in your repository and run in your CI under your accounts. The suite, the helpers, the CI config, and the docs are all yours — nothing depends on me after handoff.',
      },
      {
        q: 'How is progress communicated?',
        a: 'Through artifacts and async updates. Each flow lands as a pull request with a passing CI run and traces attached, and a shared checklist tracks scoped versus shipped. You can inspect progress at any point without a status meeting.',
      },
    ],
  },
  {
    id: 'release-gate-setup',
    kicker: 'RELEASE SAFETY',
    accent: 'primary',
    title: 'Release Gate Setup',
    tagline:
      'You get a ship/no-ship verdict on every build — checks, scores, and a readiness report generated by CI, not by vibes.',
    whatYouGet: [
      'A CI pipeline that runs your checks on every build and produces a single ship/no-ship verdict',
      'Scored checks — tests, lint and type gates, performance and accessibility budgets — with thresholds agreed up front',
      'A readiness report generated per build: what ran, what passed, what blocked, and why',
      'Failure routing: a blocked build names the exact check that failed and links to the evidence',
      'Threshold docs so future changes to the gate are deliberate decisions, not accidents',
      'A runbook and a walkthrough so your team owns the gate and can tune it without me',
    ],
    process: [
      {
        label: 'AUDIT',
        accent: 'log',
        glyph: 'log',
        detail: 'Map how you ship today and what has escaped to production.',
      },
      {
        label: 'CHECK SPEC',
        accent: 'ai',
        glyph: 'gate',
        detail: 'Agree the checks and thresholds that decide ship or no-ship.',
      },
      {
        label: 'BUILD',
        accent: 'primary',
        glyph: 'pipeline',
        detail: 'Wire checks, scoring, and the readiness report into your CI.',
      },
      {
        label: 'DRY RUN',
        accent: 'browser',
        glyph: 'eval',
        detail: 'Run the gate against real builds and tune thresholds before it enforces anything.',
      },
      {
        label: 'HANDOFF',
        accent: 'pass',
        glyph: 'human',
        detail: 'Runbook, threshold docs, and a walkthrough — your team owns the gate.',
      },
    ],
    goodFit: [
      'You ship regularly and things escape — releases currently rely on someone remembering to check',
      'You already have some checks (tests, lint, budgets) — they just aren’t enforced or visible',
      'The team actually wants the gate — a gate people route around is worse than no gate',
    ],
    badFit: [
      'You want a dashboard to look at, not a gate that can actually block a bad build',
      'Nothing is automated yet and there’s no appetite to add checks — a gate with nothing behind it is theater',
    ],
    faq: [
      {
        q: 'What happens when the gate blocks a release?',
        a: 'That is the gate doing its job. The readiness report names the exact check that failed and links the evidence. Your team fixes it — or makes a deliberate, logged override. The gate turns skipping a check into a visible decision instead of a silent one.',
      },
      {
        q: 'Who owns the pipeline?',
        a: 'You do. The pipeline config, check scripts, thresholds, and report tooling all live in your repository under your CI account. You can tune, extend, or remove any part of it without me.',
      },
      {
        q: 'How is progress communicated?',
        a: 'Through artifacts and async updates. Each check lands with sample readiness reports generated from your real builds, so you watch the verdict take shape before it enforces anything. Thresholds only go live after a dry-run period you have seen the output of.',
      },
    ],
  },
]
