import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

type RehearsalLane = {
  key: string;
  title: string;
  command: string;
  scriptPath: string;
  evidencePath: string;
  mutationMode: 'read_only' | 'transient_seed_cleanup';
  requiredContracts: string[];
  requiredSourcePatterns: RegExp[];
};

const root = process.cwd();
const outputPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'proof-rehearsal-readiness-latest.json');
const maxEvidenceAgeMs = 14 * 24 * 60 * 60 * 1000;

const lanes: RehearsalLane[] = [
  {
    key: 'gateway_capture_rehearsal',
    title: 'Gateway capture diagnosis rehearsal',
    command: 'npm run discord:gateway-capture-diagnosis',
    scriptPath: 'scripts/discord/diagnose-gateway-capture.ts',
    evidencePath: 'docs/evidence/engineering-loop/discord-gateway-capture-diagnosis-latest.json',
    mutationMode: 'read_only',
    requiredContracts: [
      'reads live gateway heartbeat and message rows',
      'diagnoses Message Content Intent state',
      'counts non-bot non-empty captured messages',
      'writes local evidence only',
      'does not post messages or mutate Discord',
      'does not count diagnosis rows as operating proof',
    ],
    requiredSourcePatterns: [
      /messageContentDiagnosis/,
      /message_content_enabled/,
      /discord_messages\.non_bot_non_empty/,
      /read_only_supabase_selects_and_local_file_evidence_only/,
      /does not post messages, change Discord, mutate Supabase/,
    ],
  },
  {
    key: 'content_factory_readiness_rehearsal',
    title: 'Content factory readiness rehearsal',
    command: 'npm run discord:content-factory-readiness',
    scriptPath: 'scripts/discord/write-content-factory-readiness.ts',
    evidencePath: 'docs/evidence/engineering-loop/content-factory-readiness-latest.json',
    mutationMode: 'read_only',
    requiredContracts: [
      'validates the dry-run content factory evidence',
      'checks no public publish happened',
      'checks admin approval is required',
      'checks channel, draft type, and topic coverage',
      'writes local evidence only',
      'does not count dry-run drafts as operating proof',
    ],
    requiredSourcePatterns: [
      /buildDiscordContentFactoryReadinessReport/,
      /validateDiscordContentFactoryReadinessReport/,
      /phase-22-content-factory-dry-run\.json/,
      /content-factory-readiness-latest\.json/,
    ],
  },
  {
    key: 'authoritative_rag_sync_rehearsal',
    title: 'Authoritative Discord RAG sync rehearsal',
    command: 'npm run rag:smoke-discord-authoritative-sync',
    scriptPath: 'scripts/rag/smoke-discord-authoritative-sync.ts',
    evidencePath: 'docs/evidence/rag/discord-authoritative-sync-smoke.json',
    mutationMode: 'transient_seed_cleanup',
    requiredContracts: [
      'creates one approved queue item',
      'creates one blocked queue item',
      'creates one approved draft',
      'creates one blocked draft',
      'cleans inserted smoke rows',
      'does not count smoke rows as operating proof',
    ],
    requiredSourcePatterns: [
      /status:\s*'published'/,
      /status:\s*'captured'/,
      /status:\s*'approved'/,
      /status:\s*'rejected'/,
      /finally\s*\{/,
      /delete\(\)\.in\('id', inserted/i,
    ],
  },
  {
    key: 'public_proof_growth_rehearsal',
    title: 'Public proof growth rehearsal',
    command: 'npm run discord:smoke-public-proof-growth',
    scriptPath: 'scripts/discord/smoke-public-proof-growth.ts',
    evidencePath: 'docs/evidence/discord-ai-os/phase-16-public-proof-growth-proof.json',
    mutationMode: 'transient_seed_cleanup',
    requiredContracts: [
      'checks privacy blocking',
      'creates public proof source',
      'creates public growth draft',
      'records privacy and quality gates',
      'cleans public proof source and draft rows',
      'does not count smoke rows as operating proof',
    ],
    requiredSourcePatterns: [
      /scorePublicProofPrivacy/,
      /createPublicProofSource/,
      /createPublicGrowthDraft/,
      /privacy_blocks_private_data/,
      /finally\s*\{/,
      /discord_public_growth_drafts'\)\.delete\(\)/,
      /discord_public_proof_sources'\)\.delete\(\)/,
    ],
  },
  {
    key: 'premium_workflow_rehearsal',
    title: 'Premium workflow rehearsal',
    command: 'npm run discord:smoke-premium-workflows',
    scriptPath: 'scripts/discord/smoke-premium-workflows.ts',
    evidencePath: 'docs/evidence/discord-ai-os/phase-15-premium-workflows-proof.json',
    mutationMode: 'transient_seed_cleanup',
    requiredContracts: [
      'creates premium review request',
      'assigns premium review request',
      'completes premium review request',
      'creates office-hours queue item',
      'answers premium question through RAG',
      'cleans premium smoke rows',
      'does not count smoke rows as operating proof',
    ],
    requiredSourcePatterns: [
      /createPremiumReviewRequest/,
      /assignPremiumReviewRequest/,
      /completePremiumReviewRequest/,
      /createOfficeHoursQueueItem/,
      /answerPremiumQuestion/,
      /finally\s*\{/,
      /discord_members'\)\.delete\(\)/,
    ],
  },
];

async function readJsonIfPresent(filePath: string): Promise<Record<string, unknown> | null> {
  try {
    return JSON.parse(await readFile(filePath, 'utf8')) as Record<string, unknown>;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return null;
    throw error;
  }
}

function evidenceTimestamp(payload: Record<string, unknown> | null): string | null {
  if (!payload) return null;
  for (const key of ['finishedAt', 'timestamp', 'generatedAt']) {
    const value = payload[key];
    if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) return value;
  }
  return null;
}

async function main() {
  const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')) as { scripts?: Record<string, string> };
  const now = Date.now();
  const laneResults = await Promise.all(lanes.map(async (lane) => {
    const absoluteScriptPath = path.join(root, lane.scriptPath);
    const absoluteEvidencePath = path.join(root, lane.evidencePath);
    const script = await readFile(absoluteScriptPath, 'utf8');
    const evidence = await readJsonIfPresent(absoluteEvidencePath);
    const timestamp = evidenceTimestamp(evidence);
    const ageMs = timestamp ? now - Date.parse(timestamp) : null;
    const npmScriptName = lane.command.replace(/^npm run\s+/, '');
    const checks = {
      npm_script_present: Boolean(packageJson.scripts?.[npmScriptName]),
      source_contract_present: lane.requiredSourcePatterns.every((pattern) => pattern.test(script)),
      evidence_present: Boolean(evidence),
      evidence_ok: evidence?.ok === true,
      evidence_recent_or_absent: ageMs === null || ageMs <= maxEvidenceAgeMs,
      evidence_not_operating_proof: true,
    };
    return {
      key: lane.key,
      title: lane.title,
      command: lane.command,
      scriptPath: lane.scriptPath,
      evidencePath: lane.evidencePath,
      mutationMode: lane.mutationMode,
      requiredContracts: lane.requiredContracts,
      checks,
      ok: Object.values(checks).every(Boolean),
      latestEvidence: evidence ? {
        path: lane.evidencePath,
        ok: evidence.ok === true,
        timestamp,
        ageHours: ageMs === null ? null : Number((ageMs / 3_600_000).toFixed(2)),
      } : null,
      note: lane.mutationMode === 'transient_seed_cleanup'
        ? 'This lane uses temporary seeded rows and cleanup. It proves local wiring only and must not be counted as real operating proof.'
        : 'This lane is read-only.',
    };
  }));

  const evidence = {
    ok: laneResults.every((lane) => lane.ok),
    version: 'discord-proof-rehearsal-readiness-v2',
    generatedAt: new Date().toISOString(),
    mutationMode: 'local_file_evidence_only',
    maxEvidenceAgeDays: maxEvidenceAgeMs / 86_400_000,
    releaseMeaning: 'Readiness for proof rehearsal only. Real 95+ operating proof still requires live gateway capture, approved knowledge, RAG sync, public proof cycles, and premium fulfillment.',
    lanes: laneResults,
    missingOrStale: laneResults
      .filter((lane) => !lane.ok)
      .map((lane) => ({
        key: lane.key,
        failedChecks: Object.entries(lane.checks).filter(([, passed]) => !passed).map(([key]) => key),
      })),
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(`Wrote ${path.relative(root, outputPath)}`);
  if (!evidence.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
