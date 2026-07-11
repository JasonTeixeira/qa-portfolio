/**
 * Evidence ledger — the strongest claims across all 8 inventory projects,
 * each with the artifact that backs it. Source: docs/agency-proof-inventory.md.
 */

import type { ProofTier } from './case-studies'

export interface LedgerRow {
  claim: string
  artifact: string
  tooling: string
  proofType: string
  tier: ProofTier
}

export interface TierLegendEntry {
  tier: ProofTier
  label: string
}

export const LEDGER_ROWS: LedgerRow[] = [
  {
    claim: '85-runner QA fleet with hash-sealed, redacted evidence bundles (Ed25519-capable signer) and a `qa verify` trust command',
    artifact: 'evidence/qa-run-* dirs + runner-registry.ts (repo nexural-qa-os)',
    tooling: 'TypeScript · pnpm · sha256/Ed25519',
    proofType: 'signed evidence bundles',
    tier: 'T1',
  },
  {
    claim: 'Full-fleet E2E CI gate with SLSA provenance and artifact signing',
    artifact: 'qa.yml · proof-gate.yml · slsa-provenance.yml · sign-artifacts.yml',
    tooling: 'GitHub Actions',
    proofType: 'green CI runs',
    tier: 'T1',
  },
  {
    claim: 'Found + fixed 11 false-pass "honesty bugs" — runners returning green while doing zero work',
    artifact: 'runner-conformance.test.ts + git log on feat/sdet-autonomy',
    tooling: 'Vitest · git',
    proofType: 'conformance suite + commit history',
    tier: 'T1',
  },
  {
    claim: '256/256 Tier 1–3 verification on a 256-screen native app, machine-computed (never hand-edited)',
    artifact: 'PROOF_REPORT.md via `npm run verify` (repo Voza-e2e-stabilization)',
    tooling: 'TypeScript · screen registry',
    proofType: 'generated proof report',
    tier: 'T2',
  },
  {
    claim: '257 Maestro device flows auto-generated from the screen registry',
    artifact: 'mobile/e2e/generated/ — 257 flows on disk',
    tooling: 'Maestro · TypeScript',
    proofType: 'flow files on disk',
    tier: 'T2',
  },
  {
    claim: 'Tier-4 device cert 256/256 on iOS simulator (recorded 2026-06-14)',
    artifact: 'cert runs on operator device — on-disk report honestly shows 0/256 until re-run',
    tooling: 'Maestro · iOS Simulator',
    proofType: 'recorded result — needs re-verification',
    tier: 'T3',
  },
  {
    claim: '140-tool MCP SDLC server with an append-only, HMAC-anchored proof ledger',
    artifact: 'apps/mcp-server/tools.json + .sage-kernel/proof/ledger.jsonl',
    tooling: 'Node.js · MCP (stdio)',
    proofType: 'tool count + ledger on disk',
    tier: 'T2',
  },
  {
    claim: '68/68 release gates green with enforced coverage + complexity ratchets',
    artifact: 'scripts/release-check.mjs (123 test files)',
    tooling: 'Node.js',
    proofType: 'terminal gate output',
    tier: 'T2',
  },
  {
    claim: '23-course / 460+ lesson content audit baseline extracting 17k+ claims',
    artifact: 'AUDIT_BASELINE.md + audit-export.mjs (Supabase → markdown bridge)',
    tooling: 'Python · pytest · Supabase',
    proofType: 'generated ledgers + ranking',
    tier: 'T2',
  },
  {
    claim: 'Mechanical publish gate executed 160/160 labs — then the content-truth gate blocked an AI-generated 8-course batch',
    artifact: 'audit-courses.ts + PREMIUM_BUILD loop reports',
    tooling: 'TypeScript · Node.js',
    proofType: 'gate output + DO-NOT-PUBLISH verdict',
    tier: 'T2',
  },
  {
    claim: '~55 production dashboard routes driven 92 → 99.6 avg — 0 console errors, 0 network failures, axe-clean',
    artifact: 'live production dashboard; audit harness was deliberately throwaway — rebuild before re-running',
    tooling: 'Playwright · axe-core · JWT sessions',
    proofType: 'live prod routes (harness itself T3)',
    tier: 'T1',
  },
  {
    claim: 'No-fake-data CI ratchet bans `Math.random` / seeded mocks on cockpit screens',
    artifact: 'check-cockpit-no-fake-data.sh + ci.yml',
    tooling: 'Bash · GitHub Actions',
    proofType: 'CI script failing on an injected violation',
    tier: 'T1',
  },
  {
    claim: 'Exposed a false-green CI — missing `packageManager` silently skipped turbo gates; fix made ~1,374 tests actually run',
    artifact: 'phase1-verify.yml · sage-gate.yml (repo giggl)',
    tooling: 'Turborepo · GitHub Actions',
    proofType: 'before/after gate output',
    tier: 'T1',
  },
  {
    claim: '20-page client site with a working lead-capture loop, live in production',
    artifact: 'web-sage-ideas.vercel.app + admin lead cockpit with LIVE badge + SLA',
    tooling: 'HTML/JS · Vercel',
    proofType: 'public deploy + e2e walk-through',
    tier: 'T1',
  },
]

/** T1 = live repo/CI · T2 = local proof · T3 = written/planned */
export const TIER_LEGEND: TierLegendEntry[] = [
  { tier: 'T1', label: 'LIVE REPO / CI REPORT / DEPLOYED DEMO' },
  { tier: 'T2', label: 'LOCAL PROOF / TERMINAL OUTPUT / DIAGRAM / RUNBOOK' },
  { tier: 'T3', label: 'WRITTEN EXPLANATION / PLANNED WORK' },
]

export const LEDGER_CLOSING =
  "If a claim isn't on this ledger with an artifact behind it, it doesn't belong on this site."
