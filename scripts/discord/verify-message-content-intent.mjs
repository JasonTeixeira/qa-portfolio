#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const evidenceDir = path.join(root, 'docs', 'evidence', 'discord');

function clean(value) {
  return value?.replace(/\\n/g, '').trim() ?? '';
}

function developerPortalUrl() {
  const applicationId = clean(process.env.DISCORD_APPLICATION_ID) || clean(process.env.DISCORD_CLIENT_ID);
  return applicationId ? `https://discord.com/developers/applications/${applicationId}/bot` : null;
}

async function main() {
  const startedAt = new Date().toISOString();
  const portalUrl = developerPortalUrl();
  const probe = spawnSync(process.execPath, [
    '--import',
    'tsx',
    '--env-file=.env.local',
    'scripts/discord/gateway-worker.ts',
    '--once',
    '--message-content',
  ], {
    cwd: root,
    encoding: 'utf8',
    timeout: 25_000,
    env: {
      ...process.env,
      DISCORD_GATEWAY_WORKER_ID: `sagebot-message-content-verify-${Date.now()}`,
    },
  });

  const output = `${probe.stdout ?? ''}\n${probe.stderr ?? ''}`;
  const disabled = output.includes('4014') || output.includes('Disallowed intent');
  const ok = probe.status === 0 && !disabled;
  const evidence = {
    ok,
    status: ok ? 'enabled' : disabled ? 'disabled' : 'failed',
    closeCode: disabled ? 4014 : null,
    portalUrl,
    instructions: ok
      ? []
      : [
          'Open the Discord Developer Portal URL.',
          'Go to Bot > Privileged Gateway Intents.',
          'Enable Message Content Intent.',
          'Save changes.',
          'Run npm run discord:verify-message-content again.',
        ],
    stdout: (probe.stdout ?? '').slice(-4000),
    stderr: (probe.stderr ?? '').slice(-4000),
    startedAt,
    finishedAt: new Date().toISOString(),
  };

  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'message-content-intent.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (!ok) process.exit(1);
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    status: 'failed',
    portalUrl: developerPortalUrl(),
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'message-content-intent.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
