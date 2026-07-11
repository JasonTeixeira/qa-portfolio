/**
 * Evidence capture manifest — real artifacts harvested 2026-07-11.
 *
 * Every PNG under /agency/evidence/ is a styled screenshot of a REAL file's
 * real content (or real read-only command output). The frame header on each
 * capture shows the true on-disk source path. Presentation is styled;
 * content is verbatim. Nothing here is fabricated or mocked.
 *
 * Slot format: `${caseStudyId}-${index}` (1-based) for case-study frames,
 * or a work-sample key (eval-output, browser-proof, readiness-report,
 * job-log, architecture, bug-note).
 */

export type EvidenceProject =
  | 'qa-os'
  | 'voza'
  | 'sage-kernel'
  | 'dashboard-loop'
  | 'giggl'
  | 'this-site'

export interface EvidenceCapture {
  /** Path under /agency/evidence/ (served from public/). */
  file: string
  title: string
  /** Real on-disk path the content was read from. */
  sourcePath: string
  project: EvidenceProject
  tier: 'T1' | 'T2'
  /** Case-study slot (`${caseStudyId}-${index}`) or work-sample key. */
  slot: string
}

export const EVIDENCE_CAPTURES: EvidenceCapture[] = [
  // ── Case study: nexural-qa-os ─────────────────────────────────────────────
  {
    file: '/agency/evidence/qa-signed-manifest.png',
    title: 'Signed evidence manifest — every artifact content-hashed, run record signed',
    sourcePath:
      '/Users/Sage/code/nexural/nexural-qa-os/evidence/qa-run-standard-1779991687045/evidence-manifest.json',
    project: 'qa-os',
    tier: 'T1',
    slot: 'nexural-qa-os-1',
  },
  {
    file: '/agency/evidence/qa-honesty-fixes.png',
    title: 'Git history of honesty-bug fixes — false-pass runners made honest',
    sourcePath: '/Users/Sage/code/nexural/nexural-qa-os (git log --grep=honest/fake)',
    project: 'qa-os',
    tier: 'T1',
    slot: 'nexural-qa-os-2',
  },
  {
    file: '/agency/evidence/qa-coverage.png',
    title: 'Measured coverage — 91.45% lines (12,588/13,764), ratcheted thresholds',
    sourcePath: '/Users/Sage/code/nexural/nexural-qa-os/coverage/coverage-summary.json',
    project: 'qa-os',
    tier: 'T2',
    slot: 'nexural-qa-os-3',
  },

  // ── Case study: voza-verification ─────────────────────────────────────────
  {
    file: '/agency/evidence/voza-proof-scorecard.png',
    title: 'Machine-generated PROOF_REPORT — 256/256 Tier 1-3, honest 0/256 device tier',
    sourcePath: '/Users/Sage/code/active/Voza-e2e-stabilization/mobile/PROOF_REPORT.md',
    project: 'voza',
    tier: 'T2',
    slot: 'voza-verification-1',
  },
  {
    file: '/agency/evidence/voza-maestro-flows.png',
    title: '257 auto-generated Maestro flows on disk + one verbatim flow',
    sourcePath: '/Users/Sage/code/active/Voza-e2e-stabilization/mobile/e2e/generated/',
    project: 'voza',
    tier: 'T2',
    slot: 'voza-verification-2',
  },

  // ── Case study: sage-kernel-course-auditor ────────────────────────────────
  {
    file: '/agency/evidence/kernel-proof-ledger.png',
    title: 'Append-only proof ledger — 6,559 hash-chained entries + HMAC anchor',
    sourcePath: '/Users/Sage/sage-kernel/.sage-kernel/proof/ledger.jsonl',
    project: 'sage-kernel',
    tier: 'T2',
    slot: 'sage-kernel-course-auditor-1',
  },
  {
    file: '/agency/evidence/kernel-security-prove.png',
    title: 'security:e2e prove — threat-model output recorded as a ledger artifact',
    sourcePath:
      '/Users/Sage/sage-kernel/.sage-kernel/proof/artifacts/proof_3b91f43b-0a03-4ffe-b636-7506ba17c123/stdout.txt',
    project: 'sage-kernel',
    tier: 'T2',
    slot: 'sage-kernel-course-auditor-2',
  },
  {
    file: '/agency/evidence/auditor-baseline.png',
    title: '23-course baseline audit — 17,305 claims extracted, sourcing-priority ranking',
    sourcePath: 'docs/academy/AUDIT_BASELINE.md (this repo)',
    project: 'sage-kernel',
    tier: 'T2',
    slot: 'sage-kernel-course-auditor-3',
  },

  // ── Case study: dashboard-audit-loop ──────────────────────────────────────
  {
    file: '/agency/evidence/lake-exit-engineering.png',
    title: 'Exit engineering over 13,446 backtested trades — the falsifiable edge',
    sourcePath: '/Users/Sage/code/nexural/nexural-website/scripts/lake/BACKTEST_RESULTS.md',
    project: 'dashboard-loop',
    tier: 'T2',
    slot: 'dashboard-audit-loop-1',
  },
  {
    file: '/agency/evidence/cockpit-ratchet.png',
    title: 'No-fake-data CI ratchet — fabricated metrics fail the build',
    sourcePath: '/Users/Sage/code/nexural/nexural-website/scripts/check-cockpit-no-fake-data.sh',
    project: 'dashboard-loop',
    tier: 'T1',
    slot: 'dashboard-audit-loop-2',
  },

  // ── Case study: giggl-release-lane ────────────────────────────────────────
  {
    file: '/agency/evidence/giggl-false-green.png',
    title: 'False-green CI exposed — packageManager fix made 13 typecheck / 5 lint / 18 test gates real',
    sourcePath: '/Users/Sage/code/active/giggl/docs/LAUNCH_PROGRAM.md',
    project: 'giggl',
    tier: 'T1',
    slot: 'giggl-release-lane-1',
  },
  {
    file: '/agency/evidence/giggl-social-wiring.png',
    title: 'Social-surface wiring plan + production migrations 0044-0051',
    sourcePath: '/Users/Sage/code/active/giggl/docs/PHASE3_SOCIAL_WIRING.md + supabase/migrations/',
    project: 'giggl',
    tier: 'T1',
    slot: 'giggl-release-lane-2',
  },

  // ── Work samples ──────────────────────────────────────────────────────────
  {
    file: '/agency/evidence/ws-eval-output.png',
    title: 'Scored content eval — 21/100, release BLOCKED by the auditor',
    sourcePath:
      '/Users/Sage/course-auditor-harness/audit-output/career-ai_engineering_rag_eval/audit_report.md',
    project: 'sage-kernel',
    tier: 'T2',
    slot: 'eval-output',
  },
  {
    file: '/agency/evidence/ws-browser-proof.png',
    title: 'This site: typecheck / build / playwright / axe gates, all pass',
    sourcePath: 'proof/site-proof.json + docs/evidence/agency-portfolio/ (this repo)',
    project: 'this-site',
    tier: 'T2',
    slot: 'browser-proof',
  },
  {
    file: '/agency/evidence/ws-readiness-report.png',
    title: 'Release readiness verdict — scored dimensions, honest REVIEW_REQUIRED',
    sourcePath:
      '/Users/Sage/code/nexural/nexural-qa-os/evidence/qa-run-standard-1779991687045/qa-run.json',
    project: 'qa-os',
    tier: 'T1',
    slot: 'readiness-report',
  },
  {
    file: '/agency/evidence/ws-job-log.png',
    title: 'Runner fleet execution log — per-runner status + durations into signed evidence',
    sourcePath:
      '/Users/Sage/code/nexural/nexural-qa-os/evidence/qa-run-standard-1779991687045/qa-run.json',
    project: 'qa-os',
    tier: 'T1',
    slot: 'job-log',
  },
  {
    file: '/agency/evidence/ws-architecture.png',
    title: 'Control-plane architecture — MCP-first, policy-gated, persistence-backed',
    sourcePath: '/Users/Sage/sage-kernel/docs/ARCHITECTURE.md',
    project: 'sage-kernel',
    tier: 'T2',
    slot: 'architecture',
  },
  {
    file: '/agency/evidence/ws-bug-note.png',
    title: 'Data-integrity triage note — caught a ~34% inflated backtest result',
    sourcePath: '/Users/Sage/code/nexural/nexural-website/scripts/lake/BACKTEST_RESULTS.md',
    project: 'dashboard-loop',
    tier: 'T2',
    slot: 'bug-note',
  },
]
