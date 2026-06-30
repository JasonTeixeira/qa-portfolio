import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  buildHumanAppealHarness,
  type HumanAppealHarnessResult,
} from '@/lib/discord/human-appeal-harness';

const root = process.cwd();
const evidenceDir = path.join(root, 'docs', 'evidence', 'engineering-loop');
const jsonPath = path.join(evidenceDir, 'sagebot-human-appeal-harness-latest.json');
const mdPath = path.join(evidenceDir, 'sagebot-human-appeal-harness-latest.md');

const sourceFiles = [
  'lib/discord/ask-sage.ts',
  'lib/discord/message-formatting.ts',
  'lib/discord/mention-responder.ts',
  'lib/discord/sage-commands.ts',
  'lib/discord/sage-rest.ts',
  'lib/discord/sagebot-personality.ts',
  'scripts/discord/smoke-ask-sage.ts',
] as const;

async function readText(relativePath: string): Promise<string | null> {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) return null;
  return readFile(filePath, 'utf8');
}

async function readJson(relativePath: string): Promise<any> {
  const raw = await readText(relativePath);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function renderMarkdown(report: HumanAppealHarnessResult): string {
  return [
    '# SageBot Human Appeal Harness',
    '',
    `Generated: ${report.generatedAt}`,
    `Status: ${report.status}`,
    `Score: ${report.score}/100`,
    `Target: ${report.targetScoreRange}`,
    '',
    '## Category Scores',
    '',
    ...report.categories.map((category) => `- ${category.title}: ${Math.round((category.score / category.maxScore) * 100)}/100 (${category.status})`),
    '',
    '## Failures',
    '',
    ...(report.failures.length ? report.failures.map((failure) => `- ${failure}`) : ['- None.']),
    '',
    '## Safe Autonomous Commands',
    '',
    ...report.safeAutonomousCommands.map((command) => `- ${command}`),
    '',
    '## Production Proof Commands',
    '',
    ...report.productionProofCommands.map((command) => `- ${command}`),
    '',
    '## Boundary',
    '',
    report.releaseMeaning,
    '',
  ].join('\n');
}

async function main() {
  const packageJson = await readJson('package.json');
  const sourceEntries = await Promise.all(sourceFiles.map(async (file) => [file, await readText(file)]));
  const report = buildHumanAppealHarness({
    generatedAt: new Date().toISOString(),
    packageJson,
    sourceFiles: Object.fromEntries(sourceEntries),
    askSageSmoke: await readJson('docs/evidence/discord/ask-sage-smoke.json'),
    visualEmbedProof: await readJson('docs/evidence/discord/visual-embed-live-proof.json'),
  });

  await mkdir(evidenceDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(mdPath, renderMarkdown(report));

  console.log(JSON.stringify({
    ok: report.ok,
    status: report.status,
    score: report.score,
    failures: report.failures,
    evidencePath: path.relative(root, jsonPath),
    markdownPath: path.relative(root, mdPath),
  }, null, 2));

  if (!report.ok) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
