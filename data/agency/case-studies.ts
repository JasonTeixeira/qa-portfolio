/**
 * Featured case studies — content sourced from docs/agency-proof-inventory.md.
 * Every number here traces to an inventory claim; no invented metrics.
 */

export type BadgeVariant = 'live' | 'local' | 'internal' | 'proto'
export type PipelineAccent = 'primary' | 'ai' | 'browser' | 'pass' | 'log' | 'fail'
export type ProofTier = 'T1' | 'T2' | 'T3'

export interface PipelineStage {
  label: string
  accent: PipelineAccent
}

export interface EvidenceSlot {
  caption: string
  tier: ProofTier
}

export interface CaseStudy {
  id: string
  title: string
  subtitle: string
  badge: { label: string; variant: BadgeVariant }
  pipeline: PipelineStage[]
  problem: string
  built: string
  validation: string
  failureModes: string
  evidenceSlots: EvidenceSlot[]
  stack: string[]
  improveNext: string
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'nexural-qa-os',
    title: 'Nexural QA OS — Signed-Evidence Runner Fleet',
    subtitle:
      'An 85-runner QA fleet that signs its own evidence and refuses to report a green it did not earn.',
    badge: { label: 'LIVE REPO + CI', variant: 'live' },
    pipeline: [
      { label: 'RUNNER FLEET', accent: 'browser' },
      { label: 'DAG ORCHESTRATOR', accent: 'primary' },
      { label: 'SIGNED EVIDENCE', accent: 'ai' },
      { label: 'QA VERIFY', accent: 'pass' },
      { label: 'CI GATE', accent: 'log' },
    ],
    problem:
      'A 39-repo, single-operator SaaS federation had no way to trust its own QA. Runners could return green while doing zero work, and "evidence" was whatever the last terminal scroll said. Verification had to become machine-checkable, not vibes.',
    built:
      'A Turbo/pnpm monorepo with 85 registered runners producing Ed25519-signed, redacted evidence bundles (qa-run.json, evidence manifest, spans, semgrep/gitleaks reports), plus a `qa verify` trust command that validates any run directory. On top sits an autonomous SDET loop — `qa auto` and `qa gen-tests` — that generates compiling, passing unit/property/BDD tests against a Definition-of-Done oracle.',
    validation:
      'A full-fleet E2E CI gate exercises every wired runner against fixtures and hard-fails on hang or crash, alongside proof-gate, SLSA-provenance, and artifact-signing workflows. Measured line coverage was driven from 52% to 91% (3,698 tests) with ratcheting thresholds, so a coverage regression is a build failure, not a footnote.',
    failureModes:
      'The core threat was the fleet lying to itself: 11 false-pass "honesty bugs" — runners returning green while doing nothing — were found and fixed, and fake fallbacks were converted to explicit honest-skips. Evidence tampering is countered by signing; hangs and crashes are hard failures, never timeouts-as-pass.',
    evidenceSlots: [
      { caption: '`qa verify` passing on a signed run directory', tier: 'T1' },
      { caption: 'GitHub Actions green run of the qa.yml full-fleet gate', tier: 'T1' },
      { caption: 'Coverage summary from `pnpm test:coverage` (52% → 91%)', tier: 'T2' },
    ],
    stack: [
      'TypeScript',
      'Turborepo',
      'pnpm',
      'Vitest',
      'Ed25519 signing',
      'GitHub Actions',
      'Semgrep',
      'Gitleaks',
    ],
    improveNext:
      'Publish a sanitized sample evidence bundle so anyone can run `qa verify` against a real signed run without repo access.',
  },
  {
    id: 'voza-verification',
    title: 'Voza — 256-Screen Verification System',
    subtitle:
      'A machine-computed, 4-tier proof report for a native Expo app (repo: Voza-e2e-stabilization).',
    badge: { label: 'LOCAL PROOF', variant: 'local' },
    pipeline: [
      { label: 'SCREEN REGISTRY', accent: 'primary' },
      { label: 'STATIC GATE', accent: 'log' },
      { label: 'LOGIC TESTS', accent: 'ai' },
      { label: 'ENGINE CONTRACTS', accent: 'browser' },
      { label: 'DEVICE CERT', accent: 'fail' },
    ],
    problem:
      'A 256-screen native language-learning app had no honest answer to "which screens actually work?" Manual spot-checks do not scale to that surface area, and a hand-edited status doc is exactly the kind of claim this portfolio refuses to make.',
    built:
      'A 4-tier verification system driven by a single screen registry: `npm run verify` machine-computes a PROOF_REPORT — never hand-edited — across static, logic, and engine-contract tiers, and the same registry auto-generates 257 Maestro device flows. All 36 native service contracts are wired to the production backend (176 API routes) with a data-path smoke test that calls every contract.',
    validation:
      '256/256 screens pass Tier 1–3 verification on the current tree, with live signed-in Maestro journeys walking real authenticated data. A full Tier-4 device certification was recorded passing on iOS simulator on 2026-06-14, but the on-disk report honestly shows 0/256 until it is re-run — that result is listed as needing re-verification, not claimed as current.',
    failureModes:
      'Routes that threw on missing deep-link params let one redbox cascade into 139 downstream failures — fixed by making missing params non-fatal. Transient device flakes are retried and recorded as retries, and the report generator rejects hand edits so the scorecard cannot drift from reality.',
    evidenceSlots: [
      { caption: 'PROOF_REPORT scorecard section, regenerated by `npm run verify`', tier: 'T2' },
      { caption: 'e2e/generated directory listing — 257 Maestro flows on disk', tier: 'T2' },
      { caption: 'engineSmoke green run against the live production backend', tier: 'T2' },
    ],
    stack: ['Expo / React Native', 'TypeScript', 'Maestro', 'iOS Simulator', 'Vercel (prod backend)'],
    improveNext:
      'Re-run the Tier-4 device certification and publish the refreshed report — the flows exist on disk, but the cert number must be regenerated, not quoted from memory.',
  },
  {
    id: 'sage-kernel-course-auditor',
    title: 'sage-kernel + Course Auditor',
    subtitle:
      'A proof-first, 140-tool MCP SDLC server paired with a content claim/source integrity harness.',
    badge: { label: 'INTERNAL TOOLING', variant: 'internal' },
    pipeline: [
      { label: 'CLAIM', accent: 'primary' },
      { label: 'COMMAND EVIDENCE', accent: 'browser' },
      { label: 'HMAC LEDGER', accent: 'ai' },
      { label: 'PROOF GRAPH', accent: 'log' },
      { label: 'RELEASE GATE', accent: 'pass' },
    ],
    problem:
      '"Nothing stated, everything proven" fails the moment the tooling itself cannot back its own claims. I needed an SDLC layer where every assertion — about code quality, security, or course content — resolves to a command that was actually run and a record that cannot be quietly edited.',
    built:
      'A terminal-only, 140-tool MCP SDLC server with an append-only, HMAC-anchored proof ledger and proof graph, plus AST engines for SAST with taint tracking, mutation testing, dead-code detection, and module graphs. Alongside it, a Python course-auditor harness (14 pytest suites) that extracts course content into claim/source ledgers behind a scored release gate (≥95 approved / ≥85 pilot / <70 blocked).',
    validation:
      'The kernel holds 68/68 release gates green, with coverage and complexity thresholds enforced inside `release:check` so quality cannot silently rot; a chaos matrix covers 8 fault scenarios including tamper-detected ledgers and fail-closed DAGs. The auditor ran a 23-course / 460+ lesson baseline extracting 17k+ claims, and the SAST engine found a real HIGH (`new Function()`) in a sibling repo.',
    failureModes:
      'A proof ledger is only as good as its tamper story — HMAC anchoring plus chaos tests for corrupt locks and edited ledgers cover that path. On the auditor side, the known weakness is over-extraction of claims from prose, which is documented in the baseline rather than hidden.',
    evidenceSlots: [
      { caption: '`release:check` terminal output — 68/68 gates green', tier: 'T2' },
      { caption: 'SAST findings table from a run against a real repo', tier: 'T2' },
      { caption: 'AUDIT_BASELINE sourcing-priority ranking table', tier: 'T2' },
    ],
    stack: ['Node.js', 'MCP (stdio)', 'Python', 'pytest', 'HMAC-anchored ledger', 'AST analysis'],
    improveNext:
      'Stand up a public, sanitized demo of the proof ledger and terminal cockpit so the 68/68 gate output is verifiable outside my machine.',
  },
  {
    id: 'dashboard-audit-loop',
    title: 'Headless Dashboard Audit Loop',
    subtitle:
      'A Playwright audit → fix → re-audit SDLC loop across ~55 authenticated production routes.',
    badge: { label: 'LIVE PRODUCT', variant: 'live' },
    pipeline: [
      { label: 'MINT SESSION', accent: 'primary' },
      { label: 'DRIVE ROUTES', accent: 'browser' },
      { label: 'SCORE', accent: 'ai' },
      { label: 'TRIAGE + FIX', accent: 'fail' },
      { label: 'RE-AUDIT', accent: 'pass' },
    ],
    problem:
      'A ~55-route production dashboard "looked done," but nobody could say which routes threw console errors, failed network calls, or shipped accessibility violations behind auth. Code audits kept missing it because the app has a mock/real twin — only driving the live product tells the truth.',
    built:
      'A headless Playwright audit loop that mints real JWT sessions, drives every production route as an authenticated user, and scores each on console errors, network failures, axe-core accessibility, and content integrity — then feeds failures into a triage → fix → re-audit cycle. A separate no-fake-data ratchet in CI bans `Math.random` and seeded mocks on allowlisted cockpit screens.',
    validation:
      'Three loop iterations drove the route average from 92 to 99.6 with 0 console errors, 0 network failures, and clean axe scans — verified against the live product, not a staging mock. One honest caveat: the harness scripts were deliberately throwaway; the live site is the standing proof, and the loop itself must be rebuilt from its spec before being re-claimed.',
    failureModes:
      'Auth-gated routes silently "passing" because the crawler only ever saw a login page — solved by minting real sessions. Score inflation from auditing the mock twin instead of production, and fixed routes regressing later — the CI ratchet exists precisely to make faked data a build failure.',
    evidenceSlots: [
      { caption: 'Authenticated production dashboard route, live', tier: 'T1' },
      { caption: 'No-fake-data ratchet failing on an injected violation', tier: 'T1' },
      { caption: 'axe-core 0-violations output (requires harness rebuild to re-run)', tier: 'T3' },
    ],
    stack: ['Playwright', 'TypeScript', 'axe-core', 'JWT session minting', 'GitHub Actions'],
    improveNext:
      'Rebuild the audit harness as a committed, re-runnable package — the results were real, but re-verification currently requires reconstructing the tooling from spec.',
  },
  {
    id: 'giggl-release-lane',
    title: 'GIGGL — Headless iOS Release Lane',
    subtitle:
      'Device E2E verification and 2FA-free EAS → TestFlight delivery for a live AI consumer app.',
    badge: { label: 'LIVE BACKEND', variant: 'live' },
    pipeline: [
      { label: 'REPO', accent: 'primary' },
      { label: 'EAS CLOUD BUILD', accent: 'browser' },
      { label: 'LOG FORENSICS', accent: 'log' },
      { label: 'ASC SUBMIT', accent: 'ai' },
      { label: 'TESTFLIGHT', accent: 'pass' },
    ],
    problem:
      'An AI comedy app (Expo monorepo, live backend at api.joingiggl.app) needed iOS releases that do not depend on a human sitting at a machine answering Apple 2FA prompts — and its CI was quietly worthless: gates reported green while skipping the actual test suites.',
    built:
      'A fully headless EAS iOS production build and TestFlight submission lane authenticated with an App Store Connect API key (no Apple 2FA in the loop), documented as a reusable playbook covering Brotli build-log forensics and signing gotchas. I also wired 8 social surfaces to the live backend with production migrations (0048–0051).',
    validation:
      'Production builds ship to TestFlight end to end without interactive login. The false-green CI was exposed — a missing `packageManager` field silently skipped turbo gates — and the fix made ~1,374 tests actually run. A professional audit of the social wiring found and fixed 2 CRITICAL and ~18 HIGH issues before ship.',
    failureModes:
      'CI that skips work is worse than no CI, so gate health is judged by test counts actually executed, not exit codes. Headless signing fails in opaque ways — the playbook documents lockfile, credential, and entitlement failure modes so the lane degrades loudly instead of silently.',
    evidenceSlots: [
      { caption: 'EAS build page for production build #8', tier: 'T2' },
      { caption: 'Before/after CI gate output — skipped turbo gates vs ~1,374 tests running', tier: 'T1' },
      { caption: 'PHASE3 social-wiring doc + production migration list', tier: 'T2' },
    ],
    stack: [
      'Expo',
      'EAS Build',
      'TypeScript',
      'Turborepo',
      'Supabase',
      'GitHub Actions',
      'App Store Connect API',
    ],
    improveNext:
      'Generalize the headless-release playbook into a shared CI workflow so any Expo app ships to TestFlight through the same verified lane.',
  },
]
