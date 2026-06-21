#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const requiredEnv = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingEnv = requiredEnv.filter((name) => !process.env[name]?.trim());

const tables = [
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

async function main() {
  if (missingEnv.length) {
    const result = { ok: false, missingEnv, tables: { ok: false, counts: {}, errors: {} } };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const counts = {};
  const errors = {};

  for (const table of tables) {
    const { count, error } = await sb.from(table).select('*', { count: 'exact' }).limit(1);
    if (error) errors[table] = error.message;
    else counts[table] = count ?? 0;
  }

  const result = {
    ok: Object.keys(errors).length === 0,
    missingEnv,
    tables: {
      ok: Object.keys(errors).length === 0,
      counts,
      errors,
    },
  };

  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
