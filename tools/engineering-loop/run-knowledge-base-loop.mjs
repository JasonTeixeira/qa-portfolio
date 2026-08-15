import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const evidenceDir = path.join(root, 'docs', 'evidence', 'engineering-loop');
const runPath = path.join(evidenceDir, 'knowledge-base-loop-run-latest.json');
const harnessPath = path.join(evidenceDir, 'knowledge-base-engineering-harness-latest.json');

const BASE_COMMANDS = [
  'npm run discord:career-content-harness',
  'npm run discord:sage-kernel-content-harness',
  'npm run discord:knowledge-base-e2e-readiness',
  'npm run discord:release-local',
  'npm run loop:audit',
  'npm run discord:knowledge-base-harness',
];

const QUALITY_GATE_COMMANDS = [
  'npm run test:unit',
  'npm run typecheck',
  'npm run lint',
  'npm run build',
  'git diff --check',
  'npm run ops:approval-boundaries',
];

const FORBIDDEN_COMMAND_PATTERNS = [
  /\bgit\s+push\b/,
  /\bvercel\s+(?:deploy|--prod|prod)\b/,
  /\brailway\s+up\b/,
  /\bstripe\s+/,
  /\bsupabase\s+db\s+push\b/,
  /\bnpm\s+run\s+db:push\b/,
  /\bnpm\s+run\s+discord:(?:register|provision|archive-old|approval-gate|approval-enforce|role-sync:enforce|onboarding-nudge:send|categorize|harden|pin-posts|operating-cycle|operating-cycle:strict|operating-cycle:full|content-factory|content-factory:week)\b/,
  /\bnpm\s+run\s+rag:(?:sync-sources|chunk|embed|evaluate|evaluate:missing|evaluate:approved-missing|evaluate:smoke)\b/,
  /SAGE_ALLOW_/,
];

function parseArgs(argv) {
  const args = new Set(argv);
  const maxCyclesArg = argv.find((arg) => arg.startsWith('--max-cycles='));
  return {
    dryRun: args.has('--dry-run'),
    once: args.has('--once'),
    qualityGate: args.has('--quality-gate'),
    maxCycles: args.has('--once') ? 1 : Number(maxCyclesArg?.split('=')[1] ?? 3),
  };
}

function validateCommand(command) {
  const failures = FORBIDDEN_COMMAND_PATTERNS
    .filter((pattern) => pattern.test(command))
    .map((pattern) => pattern.source);
  return { command, ok: failures.length === 0, failures };
}

function runCommand(command) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(command, {
    cwd: root,
    encoding: 'utf8',
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return {
    command,
    startedAt,
    finishedAt: new Date().toISOString(),
    exitCode: result.status,
    signal: result.signal,
    stdoutTail: result.stdout.slice(-5000),
    stderrTail: result.stderr.slice(-5000),
    ok: result.status === 0,
  };
}

async function readHarness() {
  const raw = await readFile(harnessPath, 'utf8');
  return JSON.parse(raw);
}

function shouldStopForApproval(harness) {
  return harness?.status === 'locally_verified_waiting_on_live_approval'
    || (Array.isArray(harness?.productionStopConditions) && harness.productionStopConditions.length > 0);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!Number.isInteger(options.maxCycles) || options.maxCycles < 1 || options.maxCycles > 10) {
    throw new Error('--max-cycles must be an integer from 1 through 10.');
  }
  const loopCommands = options.qualityGate
    ? [...QUALITY_GATE_COMMANDS, ...BASE_COMMANDS]
    : BASE_COMMANDS;
  const commandValidation = loopCommands.map(validateCommand);
  const commandFailures = commandValidation.flatMap((item) => item.failures.map((failure) => `${item.command}:${failure}`));
  if (commandFailures.length) {
    throw new Error(`Unsafe knowledge-base loop command detected: ${commandFailures.join('; ')}`);
  }

  const run = {
    ok: true,
    version: 'knowledge-base-engineering-loop-run-v1',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    mutationMode: 'local_evidence_and_safe_local_commands_only',
    releaseMeaning: 'This loop runs only local-safe knowledge-base harness commands. It refuses deploys, pushes, live Discord mutations, Stripe/Supabase production changes, and non-dry RAG eval.',
    options,
    loopCommands,
    commandValidation,
    cycles: [],
    stopReason: null,
    finalHarnessPath: path.relative(root, harnessPath),
  };

  const seenFingerprints = new Set();
  for (let cycle = 1; cycle <= options.maxCycles; cycle += 1) {
    const cycleRecord = {
      cycle,
      startedAt: new Date().toISOString(),
      commands: [],
      harnessAfter: null,
      stoppedEarly: false,
      stopReason: null,
    };

    if (options.dryRun) {
      cycleRecord.stoppedEarly = true;
      cycleRecord.stopReason = 'dry_run_planned_only';
      run.stopReason = cycleRecord.stopReason;
      run.cycles.push(cycleRecord);
      break;
    }

    for (const command of loopCommands) {
      const commandResult = runCommand(command);
      cycleRecord.commands.push(commandResult);
      if (!commandResult.ok) {
        cycleRecord.stoppedEarly = true;
        cycleRecord.stopReason = `command_failed:${command}`;
        run.ok = false;
        run.stopReason = cycleRecord.stopReason;
        break;
      }
    }

    if (!cycleRecord.stoppedEarly) {
      try {
        cycleRecord.harnessAfter = await readHarness();
      } catch (error) {
        cycleRecord.stoppedEarly = true;
        cycleRecord.stopReason = `harness_read_failed:${error instanceof Error ? error.message : String(error)}`;
        run.ok = false;
        run.stopReason = cycleRecord.stopReason;
      }
    }

    if (!cycleRecord.stoppedEarly && cycleRecord.harnessAfter) {
      const fingerprint = JSON.stringify({
        status: cycleRecord.harnessAfter.status,
        score: cycleRecord.harnessAfter.score,
        failures: cycleRecord.harnessAfter.failures,
        stops: cycleRecord.harnessAfter.productionStopConditions,
      });
      if (seenFingerprints.has(fingerprint)) {
        cycleRecord.stoppedEarly = true;
        cycleRecord.stopReason = 'blocked_fingerprint_repeated';
        run.stopReason = cycleRecord.stopReason;
      } else {
        seenFingerprints.add(fingerprint);
      }

      if (!cycleRecord.stoppedEarly && shouldStopForApproval(cycleRecord.harnessAfter)) {
        cycleRecord.stoppedEarly = true;
        cycleRecord.stopReason = 'external_approval_or_live_proof_required';
        run.stopReason = cycleRecord.stopReason;
      }
    }

    cycleRecord.finishedAt = new Date().toISOString();
    run.cycles.push(cycleRecord);
    if (cycleRecord.stoppedEarly) break;
  }

  run.finishedAt = new Date().toISOString();
  if (!run.stopReason) run.stopReason = 'max_cycles_reached';

  await mkdir(evidenceDir, { recursive: true });
  await writeFile(runPath, `${JSON.stringify(run, null, 2)}\n`);
  console.log(JSON.stringify({ ...run, runPath: path.relative(root, runPath) }, null, 2));
  if (!run.ok) process.exit(1);
}

main().catch(async (error) => {
  const failure = {
    ok: false,
    version: 'knowledge-base-engineering-loop-run-v1',
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    mutationMode: 'local_evidence_and_safe_local_commands_only',
    stopReason: 'harness_exception',
    error: error instanceof Error ? error.message : String(error),
  };
  await mkdir(evidenceDir, { recursive: true });
  await writeFile(runPath, `${JSON.stringify(failure, null, 2)}\n`);
  console.error(error);
  process.exit(1);
});
