#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const root = process.cwd();
const outDir = path.join(root, 'docs', 'evidence', 'rag');
const baselinePath = path.join(outDir, 'baseline.json');
const sourceInventoryPath = path.join(outDir, 'source-inventory.txt');

const sourceTables = [
  'discord_messages',
  'discord_questions',
  'discord_answers',
  'discord_content_queue',
  'discord_gateway_events',
  'discord_gateway_heartbeats',
  'discord_gateway_sessions',
  'discord_gateway_dead_letters',
];

function run(command, args, options = {}) {
  const startedAt = Date.now();
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    env: process.env,
    ...options,
  });
  return {
    command: [command, ...args].join(' '),
    ok: result.status === 0,
    status: result.status,
    durationMs: Date.now() - startedAt,
    stdout: result.stdout?.trim() ?? '',
    stderr: result.stderr?.trim() ?? '',
  };
}

async function tableCounts() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const rows = [];
  for (const table of sourceTables) {
    const { count, error } = await sb.from(table).select('*', { count: 'exact' }).limit(1);
    rows.push({ table, count: count ?? null, error: error?.message ?? null });
  }
  return rows;
}

async function main() {
  await mkdir(outDir, { recursive: true });

  const envPresence = Object.fromEntries([
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DISCORD_BOT_TOKEN',
    'DISCORD_GUILD_ID',
    'DISCORD_CLIENT_ID',
    'DISCORD_APPLICATION_ID',
  ].map((name) => [name, Boolean(process.env[name]?.trim())]));

  const discordSmoke = run('npm', ['run', 'discord:smoke']);
  const gatewayOnce = run('npm', ['run', 'discord:gateway:once']);
  const railwayDeployments = run('railway', ['deployment', 'list']);
  const railwayLogs = run('railway', ['logs', '--lines', '80']);
  const counts = await tableCounts();
  const messageContentProbe = run('npm', ['run', 'discord:gateway:once:content']);

  const baseline = {
    generatedAt: new Date().toISOString(),
    phase: 'phase_0_baseline',
    ok: discordSmoke.ok && gatewayOnce.ok && counts.every((row) => !row.error),
    envPresence,
    checks: {
      discordSmoke,
      gatewayOnce,
      railwayDeployments,
      railwayLogs,
      messageContentProbe: {
        ...messageContentProbe,
        expectedBlockedUntilPortalToggle: messageContentProbe.stdout.includes('4014') || messageContentProbe.stderr.includes('4014'),
      },
    },
    sourceTableCounts: counts,
    verifiedBlockers: [
      ...(messageContentProbe.ok ? [] : ['Discord Message Content Intent is not verified; normal message body capture remains blocked until portal toggle passes.']),
    ],
  };

  const inventory = [
    'SAGE IDEAS RAG SOURCE INVENTORY',
    `Generated: ${baseline.generatedAt}`,
    '',
    'Source tables:',
    ...counts.map((row) => `- ${row.table}: count=${row.count ?? 'unknown'}${row.error ? ` error=${row.error}` : ''}`),
    '',
    'Primary RAG candidates:',
    '- discord_messages: normal Discord message capture after Message Content Intent is enabled.',
    '- discord_questions: structured slash-command questions.',
    '- discord_answers: structured slash-command answers and helpful marks.',
    '- discord_content_queue: captured lessons, resource gaps, and future content ideas.',
    '- content/blog/*.mdx: existing site articles and future education content.',
    '- docs/DISCORD_EDUCATION_SERVER_RUNBOOK.md: canonical community operating instructions.',
    '',
    'Verified blockers:',
    ...(baseline.verifiedBlockers.length ? baseline.verifiedBlockers.map((item) => `- ${item}`) : ['- None in Phase 0 baseline.']),
    '',
  ].join('\n');

  await writeFile(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
  await writeFile(sourceInventoryPath, inventory);

  console.log(JSON.stringify({
    ok: baseline.ok,
    baselinePath,
    sourceInventoryPath,
    sourceTableCounts: counts,
    verifiedBlockers: baseline.verifiedBlockers,
  }, null, 2));

  if (!baseline.ok) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
