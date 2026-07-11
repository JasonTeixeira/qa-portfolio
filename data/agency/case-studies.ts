import type { SystemDiagramSpec } from '@/components/agency/diagrams/system-diagram'

/**
 * Featured case studies — content sourced from docs/agency-proof-inventory.md.
 * Every number here traces to an inventory claim; no invented metrics.
 * Diagram-first: each study leads with a SystemDiagramSpec topology; prose is
 * compressed to one problem sentence + one built sentence + instrument stats.
 */

export type BadgeVariant = 'live' | 'local' | 'internal' | 'proto'
export type PipelineAccent = 'primary' | 'ai' | 'browser' | 'pass' | 'log' | 'fail'
export type ProofTier = 'T1' | 'T2' | 'T3'

/** Legacy small-strip stages — still consumed by pipeline-diagram.tsx. */
export interface PipelineStage {
  label: string
  accent: PipelineAccent
}

export interface EvidenceSlot {
  caption: string
  tier: ProofTier
}

export interface CaseStat {
  value: string
  label: string
}

export interface CaseStudy {
  id: string
  title: string
  subtitle: string
  badge: { label: string; variant: BadgeVariant }
  pipeline: PipelineStage[]
  problem: string
  built: string
  stats: CaseStat[]
  hazards: string[]
  diagram: SystemDiagramSpec
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
      'An 85-runner QA fleet could return green while doing zero work — its evidence was unverifiable terminal scroll.',
    built:
      'Every runner now emits hash-sealed evidence bundles (Ed25519 signing built in), `qa verify` validates any run directory, and an autonomous SDET loop generates passing tests.',
    stats: [
      { value: '85', label: 'runners registered in the fleet' },
      { value: '52→91%', label: 'measured line coverage' },
      { value: '3,698', label: 'tests behind ratcheting thresholds' },
      { value: '11', label: 'false-green honesty bugs fixed' },
    ],
    hazards: [
      'Runners returning green, doing nothing',
      'Evidence tampering',
      'Hangs counted as passes',
      'Silent coverage rot',
    ],
    diagram: {
      summary:
        'Topology: an 85-runner fleet feeds a DAG orchestrator, whose runs are packaged by a hash-chain evidence signer (Ed25519-capable) and validated by the qa verify trust command. In parallel an autonomous SDET loop drives a 52-to-91-percent coverage ratchet; both paths terminate in the full-fleet CI gate.',
      nodes: [
        { id: 'fleet', glyph: 'queue', label: 'Runner fleet', sublabel: '85 registered', accent: 'browser', x: 11, y: 12 },
        { id: 'orch', glyph: 'pipeline', label: 'DAG orchestrator', sublabel: 'fixture-gated', accent: 'primary', x: 35, y: 12 },
        { id: 'signer', glyph: 'key', label: 'Evidence signer', sublabel: 'sealed bundles', accent: 'ai', x: 60, y: 12 },
        { id: 'verify', glyph: 'gate', label: 'qa verify', sublabel: 'trust command', accent: 'pass', x: 85, y: 12 },
        { id: 'sdet', glyph: 'model', label: 'SDET loop', sublabel: 'qa auto · gen-tests', accent: 'ai', x: 11, y: 42 },
        { id: 'ratchet', glyph: 'eval', label: 'Coverage ratchet', sublabel: '52%→91% · 3,698 tests', accent: 'log', x: 39, y: 42 },
        { id: 'ci', glyph: 'check', label: 'CI gate', sublabel: 'full-fleet E2E', accent: 'pass', x: 68, y: 42, pulse: true },
      ],
      edges: [
        { from: 'fleet', to: 'orch', accent: 'browser' },
        { from: 'orch', to: 'signer', accent: 'primary' },
        { from: 'signer', to: 'verify', accent: 'ai' },
        { from: 'verify', to: 'ci', accent: 'pass', curved: true, bend: 5 },
        { from: 'sdet', to: 'ratchet', accent: 'ai' },
        { from: 'ratchet', to: 'ci', accent: 'log' },
      ],
      pins: [
        { nodeId: 'fleet', kind: 'hazard', label: '11 false-greens fixed' },
        { nodeId: 'signer', kind: 'artifact', label: 'signed run dir' },
      ],
    },
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
      'evidence signing',
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
      'A 256-screen native app had no honest answer to "which screens actually work" — hand-edited status docs do not scale.',
    built:
      'A registry-driven 4-tier verifier machine-computes a PROOF_REPORT no human can edit and auto-generates 257 Maestro device flows against the live backend.',
    stats: [
      { value: '256/256', label: 'screens green on Tier 1–3' },
      { value: '257', label: 'generated Maestro flows' },
      { value: '36/36', label: 'live service contracts wired' },
      { value: '176', label: 'production API routes behind them' },
    ],
    hazards: [
      'Hand-edited scorecard drift',
      'One redbox cascading 139 failures',
      'Stale device-cert claims',
      'Transient device flakes',
    ],
    diagram: {
      summary:
        'Topology: a 256-screen registry drives npm run verify, which fans out to Tier-1 static, Tier-2 logic, and Tier-3 engine-contract gates that all write into a machine-computed PROOF_REPORT. The same registry generates 257 Maestro flows feeding a Tier-4 device certification that honestly reads 0 of 256 until re-run.',
      nodes: [
        { id: 'registry', glyph: 'log', label: 'Screen registry', sublabel: '256 screens', accent: 'primary', x: 11, y: 12 },
        { id: 'verify', glyph: 'terminal', label: 'npm run verify', sublabel: 'machine-computed', accent: 'primary', x: 33, y: 12 },
        { id: 't1', glyph: 'gate', label: 'T1 static', accent: 'log', x: 56, y: 5, size: 'sm' },
        { id: 't2', glyph: 'eval', label: 'T2 logic', accent: 'ai', x: 56, y: 19, size: 'sm' },
        { id: 't3', glyph: 'retrieval', label: 'T3 contracts', sublabel: '36/36 live', accent: 'browser', x: 56, y: 34, size: 'sm' },
        { id: 'report', glyph: 'report', label: 'Proof report', sublabel: 'never hand-edited', accent: 'pass', x: 81, y: 14, pulse: true },
        { id: 'flows', glyph: 'pipeline', label: 'Maestro flows', sublabel: '257 generated', accent: 'browser', x: 33, y: 45 },
        { id: 'cert', glyph: 'device', label: 'Device cert', sublabel: 'Tier 4 · iOS sim', accent: 'fail', x: 81, y: 45 },
      ],
      edges: [
        { from: 'registry', to: 'verify', accent: 'primary' },
        { from: 'verify', to: 't1', accent: 'log' },
        { from: 'verify', to: 't2', accent: 'ai' },
        { from: 'verify', to: 't3', accent: 'browser' },
        { from: 't1', to: 'report', accent: 'log' },
        { from: 't2', to: 'report', accent: 'ai' },
        { from: 't3', to: 'report', accent: 'browser' },
        { from: 'registry', to: 'flows', accent: 'browser', curved: true, bend: 6 },
        { from: 'flows', to: 'cert', accent: 'browser' },
      ],
      pins: [
        { nodeId: 'cert', kind: 'hazard', label: '0/256 until re-run', accent: 'fail' },
        { nodeId: 'report', kind: 'artifact', label: 'PROOF_REPORT.md' },
      ],
    },
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
      '"Nothing stated, everything proven" fails the moment the tooling cannot back its own claims with re-runnable evidence.',
    built:
      'A 140-tool MCP SDLC server with an HMAC-anchored proof ledger and AST engines, plus a Python course auditor extracting claim/source ledgers behind scored gates.',
    stats: [
      { value: '140', label: 'MCP tools served over stdio' },
      { value: '68/68', label: 'release gates green' },
      { value: '17k+', label: 'claims extracted at baseline' },
      { value: '460+', label: 'lessons audited across 23 courses' },
    ],
    hazards: [
      'Quietly edited proof ledgers',
      'Corrupt ledger locks',
      'Fail-open DAGs',
      'Claim over-extraction from prose',
    ],
    diagram: {
      summary:
        'Topology: a 140-tool MCP surface backed by AST engines writes into an HMAC-anchored append-only proof ledger and proof graph, which feed the 68-of-68 release:check gates. In parallel a Python course auditor extracts 17k-plus claims into claim/source ledgers behind a scored gate (95 approved, 85 pilot, below 70 blocked) that reports into the same release check.',
      nodes: [
        { id: 'mcp', glyph: 'terminal', label: 'MCP surface', sublabel: '140 tools · stdio', accent: 'primary', x: 11, y: 12 },
        { id: 'ast', glyph: 'eval', label: 'AST engines', sublabel: 'SAST · mutation', accent: 'browser', x: 34, y: 12 },
        { id: 'ledger', glyph: 'key', label: 'Proof ledger', sublabel: 'append-only', accent: 'ai', x: 58, y: 12 },
        { id: 'graph', glyph: 'pipeline', label: 'Proof graph', accent: 'log', x: 81, y: 12, size: 'sm' },
        { id: 'auditor', glyph: 'retrieval', label: 'Course auditor', sublabel: '14 pytest suites', accent: 'browser', x: 11, y: 42 },
        { id: 'claims', glyph: 'report', label: 'Claim ledgers', sublabel: '17k+ claims', accent: 'log', x: 36, y: 42 },
        { id: 'scoregate', glyph: 'gate', label: 'Score gate', sublabel: '≥95 approved', accent: 'ai', x: 59, y: 42, size: 'sm' },
        { id: 'release', glyph: 'check', label: 'release:check', sublabel: '68/68 gates green', accent: 'pass', x: 83, y: 42, pulse: true },
      ],
      edges: [
        { from: 'mcp', to: 'ast', accent: 'primary' },
        { from: 'ast', to: 'ledger', accent: 'browser' },
        { from: 'ledger', to: 'graph', accent: 'ai' },
        { from: 'graph', to: 'release', accent: 'log', curved: true, bend: 5 },
        { from: 'auditor', to: 'claims', accent: 'browser' },
        { from: 'claims', to: 'scoregate', accent: 'log' },
        { from: 'scoregate', to: 'release', accent: 'ai' },
      ],
      pins: [
        { nodeId: 'ledger', kind: 'artifact', label: 'HMAC-anchored' },
        { nodeId: 'claims', kind: 'hazard', label: 'over-extracts prose' },
      ],
    },
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
      'A ~55-route authenticated dashboard "looked done," but nobody knew which routes threw console errors or shipped accessibility violations.',
    built:
      'A headless Playwright loop mints real JWT sessions, drives and scores every production route, then feeds failures into a triage → fix → re-audit cycle.',
    stats: [
      { value: '92→99.6', label: 'route score average, 3 iterations' },
      { value: '~55', label: 'authenticated production routes' },
      { value: '0', label: 'console errors at final pass' },
      { value: '0', label: 'axe violations at final pass' },
    ],
    hazards: [
      'Login page scored as pass',
      'Auditing the mock twin',
      'Fixed routes regressing later',
      'Throwaway harness needs rebuild',
    ],
    diagram: {
      summary:
        'Topology: a session minter issues real JWTs to a headless Playwright driver that walks about 55 authenticated routes; a scorer checks console, network, and axe-core, and failures flow to triage-and-fix, which loops back into re-audit — three cycles drove the live dashboard from 92 to 99.6, guarded by a no-fake-data CI ratchet. The mock twin is explicitly excluded as an audit target.',
      nodes: [
        { id: 'mint', glyph: 'key', label: 'Mint session', sublabel: 'real JWT', accent: 'primary', x: 11, y: 12 },
        { id: 'drive', glyph: 'browser', label: 'Playwright drive', sublabel: '~55 routes, authed', accent: 'browser', x: 35, y: 12 },
        { id: 'score', glyph: 'eval', label: 'Score routes', sublabel: 'console · net · axe', accent: 'ai', x: 60, y: 12 },
        { id: 'fix', glyph: 'alert', label: 'Triage + fix', accent: 'fail', x: 84, y: 12 },
        { id: 'twin', glyph: 'device', label: 'Mock twin', sublabel: 'not the target', accent: 'fail', x: 11, y: 44, size: 'sm' },
        { id: 'ratchet', glyph: 'gate', label: 'CI ratchet', sublabel: 'bans fake data', accent: 'log', x: 36, y: 44 },
        { id: 'live', glyph: 'check', label: 'Live dashboard', sublabel: 'avg 92→99.6', accent: 'pass', x: 66, y: 44, pulse: true },
      ],
      edges: [
        { from: 'mint', to: 'drive', accent: 'primary' },
        { from: 'drive', to: 'score', accent: 'browser' },
        { from: 'score', to: 'fix', accent: 'ai' },
        { from: 'fix', to: 'drive', accent: 'fail', curved: true, bend: 9, label: 're-audit ×3' },
        { from: 'score', to: 'live', accent: 'pass', curved: true, bend: -4 },
        { from: 'ratchet', to: 'live', accent: 'log', label: 'guards' },
        { from: 'twin', to: 'ratchet', accent: 'fail', label: 'excluded' },
      ],
      pins: [
        { nodeId: 'live', kind: 'artifact', label: '0 axe violations', accent: 'pass' },
        { nodeId: 'score', kind: 'hazard', label: 'rebuild to re-run' },
      ],
    },
    evidenceSlots: [
      { caption: 'Data-integrity triage from the research lake', tier: 'T2' },
      { caption: 'No-fake-data CI ratchet script', tier: 'T1' },
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
      'iOS releases required a human answering Apple 2FA prompts, while CI quietly reported green and skipped the entire test suite.',
    built:
      'A fully headless EAS build → TestFlight lane authenticated by an App Store Connect API key, plus a CI fix that made ~1,374 tests actually run.',
    stats: [
      { value: '~1,374', label: 'tests un-skipped by the CI fix' },
      { value: '8', label: 'social surfaces wired to live backend' },
      { value: '0048–51', label: 'production migrations shipped' },
      { value: '2+18', label: 'critical/high issues fixed pre-ship' },
    ],
    hazards: [
      'CI green while skipping suites',
      'Opaque headless signing failures',
      'Apple 2FA blocking automation',
      'Lockfile and credential drift',
    ],
    diagram: {
      summary:
        'Topology: commits flow through CI gates (about 1,374 tests, un-skipped by the packageManager fix) into an EAS cloud production build; Brotli log forensics reads build failures, an App Store Connect API key signs the submission with no Apple 2FA, and the app lands on TestFlight, exercising the live backend at api.joingiggl.app with production migrations 0048 to 0051.',
      nodes: [
        { id: 'repo', glyph: 'repo', label: 'Repo', sublabel: 'Expo monorepo', accent: 'primary', x: 10, y: 12, size: 'sm' },
        { id: 'gates', glyph: 'eval', label: 'CI gates', sublabel: '~1,374 tests run', accent: 'log', x: 31, y: 12 },
        { id: 'eas', glyph: 'pipeline', label: 'EAS cloud build', sublabel: 'production #8', accent: 'browser', x: 56, y: 12 },
        { id: 'logs', glyph: 'log', label: 'Log forensics', sublabel: 'Brotli decode', accent: 'log', x: 81, y: 12 },
        { id: 'asckey', glyph: 'key', label: 'ASC API key', sublabel: 'no Apple 2FA', accent: 'ai', x: 31, y: 44 },
        { id: 'testflight', glyph: 'device', label: 'TestFlight', sublabel: 'headless submit', accent: 'pass', x: 56, y: 44, pulse: true },
        { id: 'backend', glyph: 'retrieval', label: 'Live backend', sublabel: 'api.joingiggl.app', accent: 'pass', x: 81, y: 44 },
      ],
      edges: [
        { from: 'repo', to: 'gates', accent: 'primary' },
        { from: 'gates', to: 'eas', accent: 'log' },
        { from: 'eas', to: 'logs', accent: 'browser', label: 'on failure' },
        { from: 'eas', to: 'testflight', accent: 'browser', curved: true, bend: 4 },
        { from: 'asckey', to: 'testflight', accent: 'ai', label: 'signs' },
        { from: 'testflight', to: 'backend', accent: 'pass', label: 'device E2E' },
      ],
      pins: [
        { nodeId: 'gates', kind: 'hazard', label: 'false-green fixed' },
        { nodeId: 'backend', kind: 'artifact', label: 'migrations 0048–51' },
      ],
    },
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
