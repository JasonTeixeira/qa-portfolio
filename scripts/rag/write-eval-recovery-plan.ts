import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  buildRagEvalRecoveryPlan,
  validateRagEvalRecoveryPlan,
} from '@/lib/rag/eval-recovery-plan';

const root = process.cwd();
const evidenceDir = path.join(root, 'docs', 'evidence', 'rag');
const latestEvalPath = path.join(evidenceDir, 'eval-latest.json');
const coverageReadinessPath = path.join(evidenceDir, 'eval-coverage-readiness.json');
const missingPreflightPath = path.join(evidenceDir, 'eval-missing-preflight.json');
const outputPath = path.join(evidenceDir, 'eval-recovery-plan.json');

async function readJson(filePath: string): Promise<any> {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function main() {
  const [latestEval, coverageReadiness, missingPreflight] = await Promise.all([
    readJson(latestEvalPath),
    readJson(coverageReadinessPath),
    readJson(missingPreflightPath),
  ]);

  const plan = buildRagEvalRecoveryPlan({
    generatedAt: new Date().toISOString(),
    latestEval,
    coverageReadiness,
    missingPreflight,
  });
  const validation = validateRagEvalRecoveryPlan(plan);
  const evidence = {
    ...plan,
    validation,
    ok: plan.ok && validation.ok,
    failures: validation.failures,
    sourceEvidence: {
      latestEval: path.relative(root, latestEvalPath),
      coverageReadiness: path.relative(root, coverageReadinessPath),
      missingPreflight: path.relative(root, missingPreflightPath),
    },
  };

  await mkdir(evidenceDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath: path.relative(root, outputPath) }, null, 2));
  if (!evidence.ok) process.exitCode = 1;
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    version: 'rag-eval-recovery-plan-v1',
    mutationMode: 'local_file_evidence_only',
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath: path.relative(root, outputPath) }, null, 2));
  process.exit(1);
});
