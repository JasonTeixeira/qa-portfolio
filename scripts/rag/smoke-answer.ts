import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { answerRagQuestion } from '../../lib/rag/retrieval';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'rag');

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const question = process.argv.slice(2).join(' ').trim() || 'What is the right Discord onboarding path for an education community?';
  const startedAt = new Date().toISOString();
  const result = await answerRagQuestion(sb, question, { limit: 5, persist: true });
  const evidence = {
    ok: Boolean(result.answer && result.citations.length && result.retrievalLogId && result.answerId),
    question,
    model: result.model,
    answerPreview: result.answer.slice(0, 500),
    citationCount: result.citations.length,
    retrievalLogId: result.retrievalLogId,
    answerId: result.answerId,
    citations: result.citations,
    startedAt,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'answer-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (!evidence.ok) process.exit(1);
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'answer-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
