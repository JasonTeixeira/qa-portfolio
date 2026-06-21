#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const requiredEnv = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DISCORD_BOT_TOKEN',
  'DISCORD_GUILD_ID',
  'DISCORD_CLIENT_ID',
];

function env(name) {
  return process.env[name]?.trim();
}

async function getDiscordCommands() {
  const token = env('DISCORD_BOT_TOKEN');
  const appId = env('DISCORD_APPLICATION_ID') || env('DISCORD_CLIENT_ID');
  const guildId = env('DISCORD_GUILD_ID');
  if (!token || !appId || !guildId) return { ok: false, reason: 'discord_env_missing' };
  const res = await fetch(`https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`, {
    headers: { authorization: `Bot ${token}` },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !Array.isArray(body)) return { ok: false, reason: body?.message ?? `status_${res.status}` };
  return { ok: true, count: body.length, names: body.map((command) => command.name).sort() };
}

async function getDiscordTables() {
  const url = env('NEXT_PUBLIC_SUPABASE_URL');
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return { ok: false, reason: 'supabase_env_missing' };
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const tables = [
    'discord_members',
    'discord_member_applications',
    'discord_events',
    'discord_scheduled_runs',
    'discord_quizzes',
    'discord_challenges',
    'discord_points_ledger',
    'discord_content_queue',
    'discord_questions',
    'discord_answers',
    'discord_messages',
    'discord_gateway_events',
    'discord_reactions',
    'discord_threads',
    'discord_gateway_heartbeats',
    'discord_gateway_sessions',
    'discord_gateway_dead_letters',
  ];
  const counts = {};
  const errors = {};
  for (const table of tables) {
    const { count, error } = await sb.from(table).select('*', { count: 'exact' }).limit(1);
    if (error) errors[table] = error.message;
    else counts[table] = count ?? 0;
  }
  return { ok: Object.keys(errors).length === 0, counts, errors };
}

const packageJson = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
const missingEnv = requiredEnv.filter((name) => !env(name) && !(name === 'DISCORD_CLIENT_ID' && env('DISCORD_APPLICATION_ID')));
const [commands, tables] = await Promise.all([getDiscordCommands(), getDiscordTables()]);
const requiredCommands = ['apply', 'approve', 'onboard', 'ask', 'ask-sage', 'premium-ask', 'premium-review', 'answer', 'quiz', 'challenge', 'leaderboard', 'premium'];
const missingCommands = commands.ok ? requiredCommands.filter((name) => !commands.names.includes(name)) : requiredCommands;

const result = {
  ok: missingEnv.length === 0 && commands.ok && missingCommands.length === 0 && tables.ok,
  missingEnv,
  scripts: {
    gatewayWorker: Boolean(packageJson.scripts?.['discord:gateway']),
    migrationCheck: Boolean(packageJson.scripts?.['discord:migration-check']),
  },
  commands,
  missingCommands,
  tables,
};

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
