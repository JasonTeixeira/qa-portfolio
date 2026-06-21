#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const migrationsDir = path.join(root, 'supabase', 'migrations');
const files = (await readdir(migrationsDir)).filter((file) => /^\d{4}_.+\.sql$/.test(file)).sort();
const versions = new Map();

for (const file of files) {
  const version = file.slice(0, 4);
  versions.set(version, [...(versions.get(version) ?? []), file]);
}

const duplicateVersions = [...versions.entries()].filter(([, names]) => names.length > 1);
const ragMigrations = files.filter((file) => /(^\d{4}_rag_|_rag_|rag_)/.test(file));
const ragText = (await Promise.all(ragMigrations.map((file) => readFile(path.join(migrationsDir, file), 'utf8')))).join('\n');

const requiredTables = [
  'rag_sources',
  'rag_documents',
  'rag_chunks',
  'rag_ingestion_runs',
  'rag_retrieval_logs',
  'rag_answers',
  'rag_answer_feedback',
  'rag_eval_questions',
  'rag_eval_runs',
  'rag_eval_results',
];

const requiredTerms = [
  'create extension if not exists vector',
  'embedding extensions.vector(1536)',
  'source_type in',
  'enable row level security',
];

const missingTables = requiredTables.filter((table) => !ragText.includes(`public.${table}`));
const missingTerms = requiredTerms.filter((term) => !ragText.includes(term));

const result = {
  ok: duplicateVersions.length === 0 && missingTables.length === 0 && missingTerms.length === 0,
  migrations: files.length,
  ragMigrations,
  duplicateVersions: duplicateVersions.map(([version, names]) => ({ version, names })),
  missingTables,
  missingTerms,
};

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
