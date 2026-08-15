import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildSageKernelContentHarness } from '@/lib/discord/sage-kernel-content-harness';

const root = process.cwd();
const evidenceDir = path.join(root, 'docs', 'evidence', 'engineering-loop');
const outputPath = path.join(evidenceDir, 'sage-kernel-content-harness-latest.json');

function arg(name: string): string | null {
  const prefix = `--${name}=`;
  const match = process.argv.find((value) => value.startsWith(prefix));
  return match ? match.slice(prefix.length) : null;
}

async function main() {
  const result = await buildSageKernelContentHarness({
    sourceRoot: arg('source-root') ?? undefined,
    candidateLimit: Number(arg('candidate-limit') ?? 60),
    draftLimit: Number(arg('draft-limit') ?? 18),
    maxFiles: Number(arg('max-files') ?? 8000),
  });

  await mkdir(evidenceDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({ ...result, evidencePath: path.relative(root, outputPath) }, null, 2));

  if (!result.ok) process.exitCode = 1;
}

main().catch(async (error) => {
  const result = {
    ok: false,
    version: 'sage-kernel-content-harness-v1',
    generatedAt: new Date().toISOString(),
    mutationMode: 'read_only_external_repo_and_local_file_evidence_only',
    error: error instanceof Error ? error.message : String(error),
  };
  await mkdir(evidenceDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  console.error(JSON.stringify({ ...result, evidencePath: path.relative(root, outputPath) }, null, 2));
  process.exit(1);
});
