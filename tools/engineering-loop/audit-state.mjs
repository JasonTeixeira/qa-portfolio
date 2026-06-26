import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const evidenceDir = path.join(root, 'docs', 'evidence', 'engineering-loop');
const statePath = path.join(evidenceDir, 'AUTONOMOUS_LOOP_STATE.json');

const localVerificationPath = path.join(evidenceDir, 'local-verification-latest.json');
const worldClassReadinessPath = path.join(evidenceDir, 'world-class-readiness-latest.json');
const operatorBriefPath = path.join(evidenceDir, 'discord-operator-brief-latest.json');

const SAFE_LOCAL_COMMANDS = [
  'npm run rag:evaluate:recovery-plan',
  'npm run rag:evaluate:missing-preflight',
  'npm run discord:gateway-capture-diagnosis && npm run discord:gateway-operating-packet',
  'npm run discord:proof-source-scan && npm run discord:proof-source-recovery-plan',
  'npm run discord:proof-backlog && npm run discord:proof-candidate-audit',
  'npm run discord:world-class-readiness && npm run discord:operator-brief && npm run verify:local:evidence',
];

const REQUIRED_APPROVAL_COMMANDS = [
  'SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate:approved-missing',
  'SAGE_ALLOW_DISCORD_OPERATING_CYCLE=approved npm run discord:operating-cycle',
];

const LIVE_OPERATOR_ACTIONS = [
  'Post or request one fresh non-bot member message now that identify evidence shows Message Content Intent enabled.',
  'Approve at least 10 high-signal Discord questions, answers, builds, reviews, wins, or resources as knowledge candidates.',
  'Sync approved Discord candidates into authoritative RAG and rerun retrieval/answer evals.',
  'Create and approve four privacy-safe public proof assets from approved Discord source material.',
  'Publish at least one public proof asset with tracked apply/join intent before claiming growth proof.',
  'Drive at least one measured Discord application from the approval-gated growth funnel.',
  'Run one premium review, deeper-answer, or office-hours proof path with a real or deliberately seeded premium scenario.',
];

async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function commandOutput(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    shell: false,
  });
  return {
    command: [command, ...args].join(' '),
    status: result.status,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}

function normalizeStringList(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function blockerFingerprint(input) {
  return JSON.stringify({
    score: input.averageScore,
    releaseGateFailures: input.releaseGateFailures,
    operatingProofBlockedLanes: input.operatingProofBlockedLanes,
    explicitApprovalCommands: input.explicitApprovalCommands,
    liveOperatorActions: input.liveOperatorActions,
  });
}

async function main() {
  const [localVerification, worldClassReadiness, operatorBrief] = await Promise.all([
    readJson(localVerificationPath),
    readJson(worldClassReadinessPath),
    readJson(operatorBriefPath),
  ]);

  const summary = localVerification.summary ?? {};
  const actionPlan = summary.actionPlan ?? {};
  const releaseGateFailures = normalizeStringList(summary.releaseGateFailures);
  const operatingProof = summary.operatingProof ?? {};
  const operatingProofBlockedLanes = normalizeStringList(operatingProof.blockedLanes);
  const operatingProofKnownBlockers = normalizeStringList(operatingProof.knownBlockers);

  const explicitApprovalCommands = unique([
    ...normalizeStringList(actionPlan.explicitApprovalCommands),
    ...REQUIRED_APPROVAL_COMMANDS,
  ]);
  const liveOperatorActions = unique([
    ...normalizeStringList(actionPlan.liveOperatorActions),
    ...LIVE_OPERATOR_ACTIONS,
  ]);
  const safeLocalCommands = unique([
    ...normalizeStringList(actionPlan.localOnlyCommands),
    ...SAFE_LOCAL_COMMANDS,
  ]);

  const averageScore = Number(summary.averageScore ?? localVerification.scorecard?.averageScore ?? 0);
  const worldClassEligible = Boolean(summary.worldClassEligible);
  const localVerificationPassed = Boolean(summary.localVerificationPassed ?? localVerification.ok);
  const gitStatus = commandOutput('git', ['status', '--short']);

  const stopReasons = [];
  if (!localVerificationPassed) stopReasons.push('local_verification_not_passing');
  if (releaseGateFailures.length) stopReasons.push(`release_gates_blocked:${releaseGateFailures.join(',')}`);
  if (operatingProofBlockedLanes.length) stopReasons.push(`operating_proof_blocked:${operatingProofBlockedLanes.join(',')}`);
  if (averageScore < 95) stopReasons.push(`score_below_95:${averageScore}`);

  const state = {
    ok: true,
    version: 'autonomous-engineering-loop-state-v1',
    generatedAt: new Date().toISOString(),
    mutationMode: 'local_file_evidence_only',
    releaseMeaning: 'This state audit reads local evidence and git status, then writes local evidence only. It does not push, deploy, mutate Discord, mutate Supabase, change Stripe, or run non-dry RAG eval.',
    current: {
      localVerificationPassed,
      worldClassEligible,
      averageScore,
      targetScoreRange: '95-99',
      releaseGateFailures,
      operatingProofBlockedLanes,
      operatingProofKnownBlockers,
      ragEvalCoverage: summary.ragEvalCoverage ?? null,
    },
    commandPlan: {
      safeLocalCommands,
      explicitApprovalCommands,
      liveOperatorActions,
      defaultLoopCommands: [
        'npm run loop:audit',
        'npm run discord:release-local',
        'npm run ops:approval-boundaries',
        'npm run verify:local:evidence',
        'npm run loop:audit',
      ],
    },
    stopPolicy: {
      maxCyclesDefault: 3,
      stopOnRepeatedFingerprint: true,
      stopOnExternalApprovalBoundary: true,
      stopOnDirtyUncommittedWork: false,
      explicitApprovalRequiredFor: [
        'pushing to GitHub',
        'deploying to Vercel or Railway',
        'mutating live Discord structure, members, roles, or posts',
        'changing Stripe or Supabase production state',
        'running non-dry RAG eval commands that write rows or call DeepSeek',
        'spending money or creating paid jobs',
        'deleting remote or live resources',
      ],
    },
    sourceEvidence: {
      localVerificationPath: path.relative(root, localVerificationPath),
      worldClassReadinessPath: path.relative(root, worldClassReadinessPath),
      operatorBriefPath: path.relative(root, operatorBriefPath),
      worldClassReadinessStatus: worldClassReadiness.status ?? null,
      operatorBriefStatus: operatorBrief.status ?? null,
    },
    git: {
      statusCommand: gitStatus.command,
      statusExitCode: gitStatus.status,
      statusShort: gitStatus.stdout.split('\n').filter(Boolean),
      statusError: gitStatus.stderr || null,
    },
    stopReasons,
    nextHarnessAction: stopReasons.length
      ? 'Run safe local loop commands until the fingerprint repeats, then stop at the explicit approval/live proof boundary.'
      : 'System is locally eligible; run final release review and external deployment only with explicit approval.',
    blockerFingerprint: blockerFingerprint({
      averageScore,
      releaseGateFailures,
      operatingProofBlockedLanes,
      explicitApprovalCommands,
      liveOperatorActions,
    }),
  };

  await mkdir(evidenceDir, { recursive: true });
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`);
  console.log(JSON.stringify({ ...state, statePath: path.relative(root, statePath) }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
