#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const migrationsDir = path.join(root, 'supabase', 'migrations');
const files = (await readdir(migrationsDir)).filter((file) => /^\d{4}_.+\.sql$/.test(file)).sort();
const byVersion = new Map();
for (const file of files) {
  const version = file.slice(0, 4);
  const current = byVersion.get(version) ?? [];
  current.push(file);
  byVersion.set(version, current);
}

const duplicateVersions = [...byVersion.entries()].filter(([, names]) => names.length > 1);
const discordMigrations = files.filter((file) => file.includes('discord'));
const requiredDiscordTables = [
  'discord_members',
  'discord_member_applications',
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
  'discord_premium_review_requests',
  'discord_premium_answer_requests',
  'discord_office_hours_queue',
  'discord_content_draft_evaluations',
  'discord_member_intelligence_profiles',
  'discord_project_submissions',
];
const migrationText = (await Promise.all(discordMigrations.map((file) => readFile(path.join(migrationsDir, file), 'utf8')))).join('\n');
const missingDiscordTables = requiredDiscordTables.filter((table) => !migrationText.includes(`public.${table}`));

const result = {
  ok: duplicateVersions.length === 0 && missingDiscordTables.length === 0,
  migrations: files.length,
  duplicateVersions: duplicateVersions.map(([version, names]) => ({ version, names })),
  discordMigrations,
  missingDiscordTables,
};

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
