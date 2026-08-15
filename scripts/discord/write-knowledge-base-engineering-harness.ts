import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  buildKnowledgeBaseEngineeringHarness,
  KNOWLEDGE_BASE_ENGINEERING_HARNESS_VERSION,
} from '@/lib/discord/knowledge-base-engineering-harness';

const root = process.cwd();
const evidenceDir = path.join(root, 'docs', 'evidence', 'engineering-loop');
const outputPath = path.join(evidenceDir, 'knowledge-base-engineering-harness-latest.json');

const evidencePaths = {
  careerContentHarness: path.join(evidenceDir, 'career-content-harness-latest.json'),
  sageKernelContentHarness: path.join(evidenceDir, 'sage-kernel-content-harness-latest.json'),
  approvedKnowledgePacket: path.join(evidenceDir, 'approved-knowledge-operating-packet-latest.json'),
  proofCandidateAudit: path.join(evidenceDir, 'discord-proof-candidate-audit-latest.json'),
  discordCorpusReadiness: path.join(evidenceDir, 'discord-corpus-readiness-latest.json'),
  knowledgeBaseE2eReadiness: path.join(evidenceDir, 'knowledge-base-e2e-readiness-latest.json'),
  ragEvalCoverage: path.join(root, 'docs', 'evidence', 'rag', 'eval-coverage-readiness.json'),
  localVerification: path.join(evidenceDir, 'local-verification-latest.json'),
  autonomousLoopState: path.join(evidenceDir, 'AUTONOMOUS_LOOP_STATE.json'),
};

async function readJson(filePath: string): Promise<any> {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function main() {
  const entries = await Promise.all(
    Object.entries(evidencePaths).map(async ([key, filePath]) => [key, await readJson(filePath)] as const),
  );
  const result = buildKnowledgeBaseEngineeringHarness({
    generatedAt: new Date().toISOString(),
    ...Object.fromEntries(entries),
  } as any);

  await mkdir(evidenceDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({ ...result, evidencePath: path.relative(root, outputPath) }, null, 2));

  if (!result.ok) process.exitCode = 1;
}

main().catch(async (error) => {
  const result = {
    ok: false,
    version: KNOWLEDGE_BASE_ENGINEERING_HARNESS_VERSION,
    generatedAt: new Date().toISOString(),
    mutationMode: 'local_file_evidence_only',
    releaseMeaning: 'This failure artifact was written locally only. It did not mutate Discord, Supabase, Stripe, RAG, deployments, or Git remotes.',
    error: error instanceof Error ? error.message : String(error),
  };
  await mkdir(evidenceDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  console.error(JSON.stringify({ ...result, evidencePath: path.relative(root, outputPath) }, null, 2));
  process.exit(1);
});
