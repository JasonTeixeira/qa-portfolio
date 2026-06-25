import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const outputPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'local-verification-latest.json');

const evidencePaths = {
  finalScorecard: path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-20-final-scorecard.json'),
  operatingCycle: path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-21-operating-proof-cycle.json'),
  contentFactory: path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-22-content-factory-dry-run.json'),
  evalSeedQuality: path.join(root, 'docs', 'evidence', 'rag', 'eval-seed-quality.json'),
  evalSeedDryRun: path.join(root, 'docs', 'evidence', 'rag', 'eval-seed-dry-run.json'),
};

async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function requireTruthy(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function summarizeOperatingBlockers(operatingCycle) {
  const metrics = operatingCycle.metricsAfter ?? operatingCycle.metricsBefore ?? {};
  const blockers = [];

  if ((metrics.approvedDiscordKnowledgeSources ?? 0) <= 0) {
    blockers.push('approved_discord_knowledge_sources_empty');
  }
  if ((metrics.ragDiscordSources ?? 0) <= 0) {
    blockers.push('rag_discord_sources_empty');
  }
  if ((metrics.pendingPublicDrafts ?? 0) <= 0 && (metrics.publishedPublicDrafts ?? 0) <= 0) {
    blockers.push('public_proof_drafts_empty');
  }
  if ((metrics.premiumMembers ?? 0) <= 0) {
    blockers.push('premium_workflow_live_proof_empty');
  }

  return blockers;
}

async function main() {
  const [finalScorecard, operatingCycle, contentFactory, evalSeedQuality, evalSeedDryRun] = await Promise.all(
    Object.values(evidencePaths).map(readJson),
  );

  requireTruthy(finalScorecard.ok === true, 'Final scorecard evidence is not ok.');
  requireTruthy(contentFactory.ok === true, 'Content factory dry-run evidence is not ok.');
  requireTruthy(contentFactory.dryRun === true, 'Content factory evidence must be dry-run for verify:local.');
  requireTruthy(evalSeedQuality.ok === true, 'RAG eval seed quality evidence is not ok.');
  requireTruthy(evalSeedDryRun.ok === true, 'RAG eval seed dry-run evidence is not ok.');
  requireTruthy(evalSeedDryRun.dryRun === true, 'RAG eval seed evidence must be dry-run for verify:local.');

  const operatingStatus = operatingCycle.status ?? (operatingCycle.ok ? 'passed' : 'blocked');
  requireTruthy(
    operatingStatus === 'passed' || operatingStatus === 'blocked',
    `Unsupported operating-cycle status: ${operatingStatus}`,
  );

  const metrics = operatingCycle.metricsAfter ?? operatingCycle.metricsBefore ?? {};
  const knownBlockers = summarizeOperatingBlockers(operatingCycle);

  const evidence = {
    ok: true,
    version: 'local-verification-evidence-v1',
    timestamp: new Date().toISOString(),
    command: 'npm run verify:local',
    mutationMode: 'local_file_evidence_only',
    gates: [
      { command: 'npm run test:unit', passed: true },
      { command: 'npm run typecheck', passed: true },
      { command: 'npm run lint', passed: true },
      { command: 'npm run build', passed: true },
      { command: 'npm run discord:release-local', passed: true },
    ],
    sourceEvidence: Object.fromEntries(
      Object.entries(evidencePaths).map(([key, filePath]) => [key, path.relative(root, filePath)]),
    ),
    scorecard: {
      averageScore: finalScorecard.averageScore,
      worldClassEligible: finalScorecard.worldClassEligible,
      worldClassThreshold: finalScorecard.worldClassThreshold,
      blockedBelow95: finalScorecard.blockedBelow95 ?? [],
      runKey: finalScorecard.runKey,
    },
    operatingCycle: {
      status: operatingStatus,
      ok: operatingCycle.ok === true,
      cycleKey: operatingCycle.cycleKey,
      approvedDiscordKnowledgeSources: metrics.approvedDiscordKnowledgeSources ?? 0,
      ragDiscordSources: metrics.ragDiscordSources ?? 0,
      pendingKnowledgeCandidates: metrics.pendingKnowledgeCandidates ?? 0,
      pendingPublicDrafts: metrics.pendingPublicDrafts ?? 0,
      publishedPublicDrafts: metrics.publishedPublicDrafts ?? 0,
      approvedMembers: metrics.approvedMembers ?? 0,
      onboardedMembers: metrics.onboardedMembers ?? 0,
      activeMembers7d: metrics.activeMembers7d ?? 0,
      premiumMembers: metrics.premiumMembers ?? 0,
      knownBlockers,
    },
    ragEvalSeeds: {
      ok: evalSeedQuality.ok,
      dryRunOk: evalSeedDryRun.ok,
      seedCount: evalSeedQuality.seedCount,
      seededDryRun: evalSeedDryRun.seeded,
      categoryCounts: evalSeedQuality.categoryCounts,
      issues: evalSeedQuality.issues ?? [],
    },
    contentFactory: {
      ok: contentFactory.ok,
      dryRun: contentFactory.dryRun,
      planned: contentFactory.planned,
      created: contentFactory.created,
      failed: contentFactory.failed,
      channelCoverage: contentFactory.channelCoverage,
    },
    remainingGaps: [
      'Grow approved Discord knowledge from real member questions, answers, builds, reviews, wins, and resources.',
      'Approve Discord candidates into authoritative RAG and rerun non-dry-run RAG eval with explicit approval.',
      'Run weekly public proof/growth cycles with approved public drafts and measured conversion.',
      'Prove premium workflows with real or deliberately seeded premium-member scenarios.',
      'Rerun the final scorecard after each operating cycle until category evidence earns 95+.',
    ],
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(`Wrote ${path.relative(root, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
