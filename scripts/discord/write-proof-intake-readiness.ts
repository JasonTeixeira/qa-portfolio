import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  buildDiscordProofIntakeReadinessReport,
  validateDiscordProofIntakeReadinessReport,
  type DiscordProofIntakeReadinessReport,
} from '@/lib/discord/proof-intake-readiness';

const root = process.cwd();
const outputPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-intake-readiness-latest.json');
const markdownPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-intake-readiness-latest.md');

function renderMarkdown(report: DiscordProofIntakeReadinessReport): string {
  return [
    '# Sage Ideas Discord Proof Intake Readiness',
    '',
    `Generated: ${report.generatedAt}`,
    `Mutation mode: ${report.mutationMode}`,
    `Readiness OK: ${report.ok ? 'yes' : 'no'}`,
    '',
    '## Release Meaning',
    '',
    report.releaseMeaning,
    '',
    '## Weekly Intake Order',
    '',
    ...report.weeklyIntakeOrder.map((item, index) => `${index + 1}. ${item}`),
    '',
    '## Lanes',
    '',
    ...report.lanes.flatMap((lane) => [
      `### ${lane.title}`,
      '',
      `- Key: ${lane.key}`,
      `- Target: ${lane.targetCount}`,
      `- Admin surface: ${lane.adminSurface}`,
      `- Source tables: ${lane.sourceTables.join(', ')}`,
      `- Verification: ${lane.verificationCommands.join(' && ')}`,
      `- Evidence paths: ${lane.evidencePaths.join(', ')}`,
      '',
      'Required fields:',
      ...lane.requiredFields.filter((field) => field.required).map((field) => `- ${field.key}: ${field.description}`),
      '',
      'Accept:',
      ...lane.acceptanceChecks.map((item) => `- ${item}`),
      '',
      'Reject:',
      ...lane.rejectionChecks.map((item) => `- ${item}`),
      '',
      'Privacy:',
      ...lane.privacyChecks.map((item) => `- ${item}`),
      '',
    ]),
    '## Validation Failures',
    '',
    report.failures.length ? report.failures.map((failure) => `- ${failure}`).join('\n') : 'None.',
    '',
  ].join('\n');
}

async function main() {
  const report = buildDiscordProofIntakeReadinessReport({
    generatedAt: new Date().toISOString(),
  });
  const validation = validateDiscordProofIntakeReadinessReport(report);
  const evidence = {
    ...report,
    validation: {
      ...validation,
      validator: 'discord-proof-intake-readiness-validator-v1',
      validatedAt: new Date().toISOString(),
    },
    ok: report.ok && validation.ok,
    failures: [...report.failures, ...validation.failures],
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  await writeFile(markdownPath, renderMarkdown(evidence), 'utf8');
  console.log(`Wrote ${path.relative(root, outputPath)} and ${path.relative(root, markdownPath)}`);
  if (!evidence.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
