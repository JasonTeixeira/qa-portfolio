#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const evidenceDir = path.join(root, 'docs', 'evidence', 'engineering-loop');
const evidencePath = path.join(evidenceDir, 'sagebot-live-deploy-latest.json');
const SITE_URL = process.env.SITE_URL || 'https://www.sageideas.dev';
const RAILWAY_SERVICE = process.env.SAGEBOT_RAILWAY_SERVICE || 'sagebot-gateway';

const LOCAL_GATES = [
  'npm run test:unit',
  'npm run typecheck',
  'npm run lint',
  'npm run build',
  'git diff --check',
];

const LIVE_VERIFY_COMMANDS = [
  `curl -fsS ${SITE_URL}/api/health`,
  `curl -fsS ${SITE_URL}/api/discord/interactions`,
  'npm run discord:smoke-ask-sage',
];

const EXPLICIT_APPROVAL_COMMANDS = [
  'vercel deploy --prod --yes',
  `railway variables --set DISCORD_ENABLE_MENTION_RESPONSES=true --service ${RAILWAY_SERVICE}`,
  `railway variables --set DEEPSEEK_API_KEY=<from local env> --service ${RAILWAY_SERVICE}`,
  `railway up --service ${RAILWAY_SERVICE}`,
  'npm run discord:register',
  'npm run discord:pin-posts',
  'git push',
];

function parseArgs(argv) {
  const flags = new Set(argv);
  return {
    execute: flags.has('--execute'),
    push: flags.has('--push'),
    skipVercel: flags.has('--skip-vercel'),
    skipRailway: flags.has('--skip-railway'),
    skipPins: flags.has('--skip-pins'),
    skipBuild: flags.has('--skip-build'),
    yes: flags.has('--yes'),
  };
}

function run(command, options = {}) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(command, {
    cwd: root,
    encoding: 'utf8',
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, ...(options.env ?? {}) },
  });
  return {
    command,
    startedAt,
    finishedAt: new Date().toISOString(),
    exitCode: result.status,
    signal: result.signal,
    ok: result.status === 0,
    stdoutTail: (result.stdout ?? '').slice(-8000),
    stderrTail: (result.stderr ?? '').slice(-8000),
  };
}

async function readPackageScript(name) {
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  return pkg.scripts?.[name] ?? null;
}

async function prodHealth() {
  try {
    const res = await fetch(`${SITE_URL}/api/health`, { headers: { accept: 'application/json' } });
    const json = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, sha: json?.sha ?? null, body: json };
  } catch (error) {
    return { ok: false, status: null, sha: null, error: error instanceof Error ? error.message : String(error) };
  }
}

async function writeEvidence(report) {
  await mkdir(evidenceDir, { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify(report, null, 2)}\n`);
}

function envPresence() {
  const keys = [
    'DISCORD_BOT_TOKEN',
    'DISCORD_CLIENT_ID',
    'DISCORD_APPLICATION_ID',
    'DISCORD_GUILD_ID',
    'DISCORD_PUBLIC_KEY',
    'DEEPSEEK_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];
  return Object.fromEntries(keys.map((key) => [key, Boolean(process.env[key]?.trim())]));
}

function deployCommands(options) {
  const commands = [];
  if (!options.skipVercel) commands.push('vercel deploy --prod --yes');
  if (!options.skipRailway) {
    commands.push(`railway variables --set DISCORD_ENABLE_MENTION_RESPONSES=true --service ${RAILWAY_SERVICE}`);
    const botId = process.env.DISCORD_APPLICATION_ID || process.env.DISCORD_CLIENT_ID;
    if (botId) commands.push(`railway variables --set DISCORD_BOT_USER_ID=${botId} --service ${RAILWAY_SERVICE}`);
    if (process.env.DEEPSEEK_API_KEY?.trim()) {
      commands.push(`railway variables --set "DEEPSEEK_API_KEY=$DEEPSEEK_API_KEY" --service ${RAILWAY_SERVICE}`);
    }
    commands.push(`railway up --service ${RAILWAY_SERVICE}`);
  }
  commands.push('npm run discord:register');
  if (!options.skipPins) commands.push('npm run discord:pin-posts');
  if (options.push) commands.push('git push');
  return commands;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const localSha = run('git rev-parse HEAD');
  const branch = run('git branch --show-current');
  const gitStatus = run('git status --short');
  const healthBefore = await prodHealth();
  const packageScripts = {
    register: await readPackageScript('discord:register'),
    pins: await readPackageScript('discord:pin-posts'),
    smokeAskSage: await readPackageScript('discord:smoke-ask-sage'),
    gateway: await readPackageScript('discord:gateway'),
  };
  const gates = options.skipBuild ? LOCAL_GATES.filter((command) => command !== 'npm run build') : LOCAL_GATES;
  const plannedDeployCommands = deployCommands(options);
  const report = {
    ok: true,
    version: 'sagebot-live-deploy-harness-v1',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    mode: options.execute ? 'execute' : 'plan',
    mutationMode: options.execute
      ? 'explicitly_approved_live_deploy_push_capable'
      : 'plan_only_no_live_mutation',
    releaseMeaning: 'Deploy harness for Sage Ideas SageBot/SageForge. Plan mode writes evidence only. Execute mode can deploy Vercel, deploy Railway gateway, register commands, pin posts, and optionally push when explicitly requested.',
    siteUrl: SITE_URL,
    railwayService: RAILWAY_SERVICE,
    options,
    git: {
      branch: branch.stdoutTail.trim(),
      localSha: localSha.stdoutTail.trim(),
      dirty: gitStatus.stdoutTail.trim().length > 0,
      statusShort: gitStatus.stdoutTail.trim().split('\n').filter(Boolean).slice(0, 120),
      productionShaBefore: healthBefore.sha,
      productionBehindLocal: Boolean(healthBefore.sha && localSha.stdoutTail.trim() && healthBefore.sha !== localSha.stdoutTail.trim()),
    },
    envPresence: envPresence(),
    packageScripts,
    localGates: [],
    plannedDeployCommands,
    deployCommands: [],
    liveVerification: [],
    healthBefore,
    healthAfter: null,
    explicitApprovalCommands: EXPLICIT_APPROVAL_COMMANDS,
    stopReason: null,
    nextActions: [],
  };

  if (!options.execute) {
    report.nextActions = [
      'Run npm run sagebot:deploy-live to execute with the current explicit approval.',
      'Run npm run sagebot:deploy-live:push only after staging/committing the intended deploy branch.',
      'After deployment, test /ask-sage and an @Sage Ideas mention in Discord.',
    ];
    report.finishedAt = new Date().toISOString();
    await writeEvidence(report);
    console.log(JSON.stringify({ ok: true, mode: report.mode, evidencePath: path.relative(root, evidencePath), plannedDeployCommands, git: report.git }, null, 2));
    return;
  }

  for (const command of gates) {
    const result = run(command);
    report.localGates.push(result);
    await writeEvidence(report);
    if (!result.ok) {
      report.ok = false;
      report.stopReason = `local_gate_failed:${command}`;
      report.finishedAt = new Date().toISOString();
      await writeEvidence(report);
      console.error(JSON.stringify({ ok: false, stopReason: report.stopReason, evidencePath: path.relative(root, evidencePath) }, null, 2));
      process.exit(1);
    }
  }

  for (const command of plannedDeployCommands) {
    const result = run(command);
    report.deployCommands.push(result);
    await writeEvidence(report);
    if (!result.ok) {
      report.ok = false;
      report.stopReason = `deploy_command_failed:${command}`;
      report.finishedAt = new Date().toISOString();
      await writeEvidence(report);
      console.error(JSON.stringify({ ok: false, stopReason: report.stopReason, evidencePath: path.relative(root, evidencePath) }, null, 2));
      process.exit(1);
    }
  }

  for (const command of LIVE_VERIFY_COMMANDS) {
    const result = run(command);
    report.liveVerification.push(result);
    await writeEvidence(report);
    if (!result.ok) {
      report.ok = false;
      report.stopReason = `live_verification_failed:${command}`;
      report.finishedAt = new Date().toISOString();
      await writeEvidence(report);
      console.error(JSON.stringify({ ok: false, stopReason: report.stopReason, evidencePath: path.relative(root, evidencePath) }, null, 2));
      process.exit(1);
    }
  }

  report.healthAfter = await prodHealth();
  report.finishedAt = new Date().toISOString();
  report.nextActions = [
    'In Discord, run /ask-sage with a real question.',
    'In Discord, mention @Sage Ideas with a real question and confirm Railway logs include mention_response_posted.',
    'If mention response fails, check DISCORD_ENABLE_MENTION_RESPONSES and DISCORD_BOT_USER_ID in Railway.',
  ];
  await writeEvidence(report);
  console.log(JSON.stringify({
    ok: report.ok,
    mode: report.mode,
    productionShaBefore: report.healthBefore?.sha ?? null,
    productionShaAfter: report.healthAfter?.sha ?? null,
    evidencePath: path.relative(root, evidencePath),
    stopReason: report.stopReason,
  }, null, 2));
}

main().catch(async (error) => {
  const report = {
    ok: false,
    version: 'sagebot-live-deploy-harness-v1',
    finishedAt: new Date().toISOString(),
    stopReason: 'harness_exception',
    error: error instanceof Error ? error.message : String(error),
  };
  await writeEvidence(report);
  console.error(error);
  process.exit(1);
});
