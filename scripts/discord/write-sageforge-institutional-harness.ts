import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  buildSageForgeInstitutionalHarness,
  type SageForgeInstitutionalHarnessResult,
} from '@/lib/discord/sageforge-institutional-harness';

const root = process.cwd();
const evidenceDir = path.join(root, 'docs', 'evidence', 'engineering-loop');
const jsonPath = path.join(evidenceDir, 'sageforge-institutional-harness-latest.json');
const mdPath = path.join(evidenceDir, 'sageforge-institutional-harness-latest.md');

const files = {
  packageJson: 'package.json',
  institutionalReadiness: 'docs/evidence/engineering-loop/sagebot-institutional-readiness-latest.json',
  knowledgeBaseHarness: 'docs/evidence/engineering-loop/knowledge-base-engineering-harness-latest.json',
  worldClassReadiness: 'docs/evidence/engineering-loop/world-class-readiness-latest.json',
  gatewayCaptureDiagnosis: 'docs/evidence/engineering-loop/discord-gateway-capture-diagnosis-latest.json',
  observabilityQualityReadiness: 'docs/evidence/engineering-loop/observability-quality-readiness-latest.json',
  contentFactoryReadiness: 'docs/evidence/engineering-loop/content-factory-readiness-latest.json',
  durableJobsReadiness: 'docs/evidence/engineering-loop/durable-jobs-readiness-latest.json',
  premiumWorkflowReadiness: 'docs/evidence/engineering-loop/premium-workflow-readiness-latest.json',
  publicGrowthReadiness: 'docs/evidence/engineering-loop/public-growth-readiness-latest.json',
  securityPrivacyReadiness: 'docs/evidence/engineering-loop/security-privacy-readiness-latest.json',
  localVerification: 'docs/evidence/engineering-loop/local-verification-latest.json',
	  ragEvalLatest: 'docs/evidence/rag/eval-latest.json',
	  langfuseSmoke: 'docs/evidence/engineering-loop/langfuse-smoke-latest.json',
	  humanAppealHarness: 'docs/evidence/engineering-loop/sagebot-human-appeal-harness-latest.json',
	} as const;

async function readJson(relativePath: string): Promise<any> {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function renderMarkdown(report: SageForgeInstitutionalHarnessResult): string {
  const blocked = report.productionStopConditions.length
    ? report.productionStopConditions.map((item) => `- ${item}`)
    : ['- None.'];
  return [
    '# SageForge Institutional Harness',
    '',
    `Generated: ${report.generatedAt}`,
    `Bot name: ${report.botName}`,
    `Status: ${report.status}`,
    `Score: ${report.score}/100`,
    `Target: ${report.targetScoreRange}`,
    '',
    '## Bot Name',
    '',
    report.botNameRationale,
    '',
    '## Category Scores',
    '',
    ...report.categories.map((category) => `- ${category.title}: ${Math.round((category.score / category.maxScore) * 100)}/100 (${category.status})`),
    '',
    '## Production Stop Conditions',
    '',
    ...blocked,
    '',
    '## Safe Autonomous Commands',
    '',
    ...report.safeAutonomousCommands.map((item) => `- ${item}`),
    '',
    '## Explicit Approval Commands',
    '',
    ...report.explicitApprovalCommands.map((item) => `- ${item}`),
    '',
    '## Live Operator Actions',
    '',
    ...report.liveOperatorActions.map((item) => `- ${item}`),
    '',
    '## Autonomy Contract',
    '',
    'Allowed without more input:',
    ...report.autonomyContract.allowedWithoutMoreInput.map((item) => `- ${item}`),
    '',
    'Stops for approval:',
    ...report.autonomyContract.stopsForApproval.map((item) => `- ${item}`),
    '',
    'Completion definition:',
    ...report.autonomyContract.completionDefinition.map((item) => `- ${item}`),
    '',
    '## Anti-Fake Rules',
    '',
    ...report.antiFakeRules.map((item) => `- ${item}`),
    '',
    '## Boundary',
    '',
    report.releaseMeaning,
    '',
  ].join('\n');
}

async function main() {
  const payload = Object.fromEntries(
    await Promise.all(
      Object.entries(files).map(async ([key, relativePath]) => [key, await readJson(relativePath)]),
    ),
  ) as Record<keyof typeof files, any>;

  const report = buildSageForgeInstitutionalHarness({
    generatedAt: new Date().toISOString(),
    botName: 'SageForge',
    ...payload,
  });

  await mkdir(evidenceDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(mdPath, renderMarkdown(report));
  console.log(JSON.stringify({
    ok: report.ok,
    status: report.status,
    score: report.score,
    targetScoreRange: report.targetScoreRange,
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
