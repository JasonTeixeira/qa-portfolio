import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { buildWorldClassReadinessReport, type WorldClassScorecardItem } from '@/lib/discord/world-class-readiness';

const root = process.cwd();
const finalScorecardPath = path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-20-final-scorecard.json');
const localVerificationPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'local-verification-latest.json');
const gatewayCapturePath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-gateway-capture-diagnosis-latest.json');
const outputPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'world-class-readiness-latest.json');

async function readJson(filePath: string) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function main() {
  const [finalScorecard, localVerification, gatewayCapture] = await Promise.all([
    readJson(finalScorecardPath),
    readJson(localVerificationPath),
    readJson(gatewayCapturePath),
  ]);

  const scorecard = Array.isArray(finalScorecard.scorecard)
    ? finalScorecard.scorecard as WorldClassScorecardItem[]
    : [];
  if (scorecard.length === 0) {
    throw new Error('Final scorecard evidence does not include category scores.');
  }
  if (localVerification.ok !== true) {
    throw new Error('Local verification evidence is not ok.');
  }

  const operatingBlockers = [
    ...(gatewayCapture.diagnosis?.status === 'blocked' ? ['discord_gateway_capture_blocked'] : []),
    ...(localVerification.operatingCycle?.knownBlockers ?? []),
  ];

  const report = buildWorldClassReadinessReport({
    generatedAt: new Date().toISOString(),
    averageScore: Number(finalScorecard.averageScore ?? localVerification.scorecard?.averageScore ?? 0),
    worldClassThreshold: Number(finalScorecard.worldClassThreshold ?? 95),
    worldClassEligible: Boolean(finalScorecard.worldClassEligible),
    scorecard,
    releaseGates: Array.isArray(finalScorecard.releaseGates) ? finalScorecard.releaseGates : [],
    operatingBlockers,
    requiredOperatingProof: finalScorecard.requiredOperatingProof ?? [],
  });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Wrote ${path.relative(root, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
